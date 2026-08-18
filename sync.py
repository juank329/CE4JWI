import ftplib, json, requests, base64, os, sys, time, datetime, re, subprocess
from io import BytesIO

FTP_HOST = os.environ['FTP_HOST']
FTP_USER = os.environ['FTP_USER']
FTP_PASS = os.environ['FTP_PASS']
GH_TOKEN = os.environ['GH_TOKEN']
GITHUB_REPO = "juank329/ce4jwi-qsls"
IMAGES_DIR = "qsl_images"

os.makedirs(IMAGES_DIR, exist_ok=True)

def parsearNombreArchivo(nombre):
    m_fecha = re.search(r"(\d{2})-(\d{2})-(\d{4})", nombre)
    m_hora = re.search(r"_(\d{4})_(?=[^_]*\.[a-z]+$)", nombre, re.IGNORECASE)
    m_modo = re.search(r"_([A-Z0-9]+)\.[a-z]+$", nombre, re.IGNORECASE)
    return type("Meta", (), {
        "fecha": f"{m_fecha.group(3)}-{m_fecha.group(2)}-{m_fecha.group(1)}" if m_fecha else "",
        "hora": f"{m_hora.group(1)[:2]}:{m_hora.group(1)[2:4]}" if m_hora else "",
        "modo": m_modo.group(1) if m_modo else "",
    })()

def call_from_file(archivo):
    base = os.path.splitext(os.path.basename(archivo))[0]
    partes = base.split("_")
    if len(partes) >= 3:
        return partes[2].upper()
    return base

def github_push_json(entries):
    url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/log_qsl.json"
    headers = {"Authorization": f"Bearer {GH_TOKEN}", "Accept": "application/vnd.github+json"}
    for attempt in range(3):
        try:
            sha = None
            r = requests.get(url, headers=headers, timeout=10)
            if r.status_code == 200:
                sha = r.json().get("sha")
            payload = {
                "message": "Auto-sync log_qsl.json from FTP",
                "content": base64.b64encode(json.dumps(entries, ensure_ascii=False).encode()).decode(),
            }
            if sha:
                payload["sha"] = sha
            r = requests.put(url, headers=headers, json=payload, timeout=15)
            if r.status_code in (200, 201):
                return True
            print(f"[RETRY {attempt+1}/3] PUT failed: {r.status_code} {r.text[:200]}")
        except Exception as e:
            print(f"[RETRY {attempt+1}/3] Error: {e}")
        time.sleep(2)
    return False

# Connect FTP
s = ftplib.FTP(FTP_HOST, FTP_USER, FTP_PASS, timeout=30)
s.cwd("/")

# Download current index from FTP
buf = BytesIO()
try:
    s.retrbinary("RETR log_qsl.json", buf.write)
    buf.seek(0)
    entries = json.loads(buf.read().decode("utf-8"))
except:
    entries = []
print(f"[INFO] Index actual en FTP: {len(entries)} QSLs")

# List FTP JPGs
ftp_files = []
s.retrlines("NLST", ftp_files.append)
ftp_jpgs = [f for f in ftp_files if f.lower().endswith('.jpg')]
print(f"[INFO] JPGs en FTP: {len(ftp_jpgs)}")

# Download new images
ya_descargadas = set(os.listdir(IMAGES_DIR))
nuevas = 0
for jpg in ftp_jpgs:
    if jpg not in ya_descargadas:
        try:
            with open(os.path.join(IMAGES_DIR, jpg), 'wb') as f:
                s.retrbinary(f"RETR {jpg}", f.write)
            nuevas += 1
            print(f"[IMG] Descargada: {jpg}")
        except Exception as e:
            print(f"[IMG] Error descargando {jpg}: {e}")
s.quit()
print(f"[IMG] Nuevas descargadas: {nuevas}")

# Build entries with local GitHub Pages URLs
entries_by_file = {e.get("archivo"): e for e in entries if e.get("archivo")}
new_entries = []
for jpg in ftp_jpgs:
    if jpg in entries_by_file:
        e = entries_by_file[jpg]
        e["url"] = f"https://juank329.github.io/CE4JWI/qsl_images/{jpg}"
        new_entries.append(e)
    else:
        call = call_from_file(jpg)
        meta = parsearNombreArchivo(jpg)
        nuevo = {
            "call": call,
            "carpeta": "General",
            "archivo": jpg,
            "url": f"https://juank329.github.io/CE4JWI/qsl_images/{jpg}",
            "fecha": meta.fecha,
            "hora": meta.hora,
            "modo": meta.modo,
        }
        new_entries.append(nuevo)
        print(f"[NEW] {jpg} ({call})")

entries = new_entries
print(f"[SYNC] Total: {len(entries)} QSLs")

# Clean entries > 365 days
cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=365)
remaining = []
removed = 0
for e in entries:
    fecha_str = e.get("fecha", "")
    if fecha_str:
        try:
            y, m, d = map(int, e["fecha"].split("-"))
            fecha_qsl = datetime.datetime(y, m, d, tzinfo=datetime.timezone.utc)
            if fecha_qsl < cutoff:
                removed += 1
                continue
        except:
            pass
    remaining.append(e)
entries = remaining
if removed:
    print(f"[CLEAN] Removed {removed} entries > 365 days")

# Upload updated index back to FTP
try:
    s2 = ftplib.FTP(FTP_HOST, FTP_USER, FTP_PASS, timeout=30)
    s2.cwd("/")
    data = json.dumps(entries, ensure_ascii=False).encode("utf-8")
    s2.storbinary("STOR log_qsl.json", BytesIO(data))
    s2.quit()
    print(f"[OK] FTP index updated: {len(entries)} entries")
except Exception as e:
    print(f"[WARN] Could not update FTP index: {e}")

# Git push images
if nuevas > 0:
    try:
        subprocess.run(["git", "add", IMAGES_DIR], check=True)
        subprocess.run(["git", "commit", "-m", f"Auto-sync: {nuevas} new QSL images from FTP"], check=False)
        subprocess.run(["git", "push"], check=True)
        print(f"[OK] Git pushed {nuevas} new images")
    except Exception as e:
        print(f"[WARN] Git push failed: {e}")

# Push JSON to ce4jwi-qsls
if not github_push_json(entries):
    sys.exit(1)
print("[OK] GitHub Pages (ce4jwi-qsls) updated")
