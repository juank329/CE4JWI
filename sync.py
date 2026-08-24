import ftplib, json, requests, base64, os, sys, time, datetime, re, subprocess
from io import BytesIO
from PIL import Image

FTP_HOST = os.environ['FTP_HOST']
FTP_USER = os.environ['FTP_USER']
FTP_PASS = os.environ['FTP_PASS']
GH_TOKEN = os.environ['GH_TOKEN']
GITHUB_REPO = "juank329/ce4jwi-qsls"
IMAGES_DIR = "qsl_images"
MIN_JPG_SIZE = 5000  # QSL images are ~100-300KB minimum

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
    # Find segment right before the date (dd-mm-yyyy)
    for i, p in enumerate(partes):
        if re.match(r"\d{2}-\d{2}-\d{4}", p) and i > 0:
            return partes[i - 1].upper()
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

# Load EXISTING index from GitHub Pages (not FTP!) to preserve LOG4OM entries
entries = []
entries_by_file = {}
try:
    gh_url = "https://juank329.github.io/ce4jwi-qsls/log_qsl.json"
    r = requests.get(gh_url, timeout=10)
    if r.status_code == 200:
        entries = r.json()
        if isinstance(entries, list):
            entries_by_file = {e.get("archivo"): e for e in entries if e.get("archivo")}
            print(f"[INFO] Index existente en GitHub Pages: {len(entries)} QSLs")
        else:
            entries = []
except Exception as e:
    print(f"[WARN] No se pudo leer index de GitHub Pages ({e})")

# Also read FTP index as fallback
try:
    buf = BytesIO()
    s.retrbinary("RETR log_qsl.json", buf.write)
    buf.seek(0)
    ftp_entries = json.loads(buf.read().decode("utf-8"))
    if isinstance(ftp_entries, list):
        for e in ftp_entries:
            arch = e.get("archivo", "")
            if arch and arch not in entries_by_file:
                entries.append(e)
                entries_by_file[arch] = e
        print(f"[INFO] Fusionadas {len(ftp_entries)} entradas del FTP")
except ftplib.error_perm:
    pass
except Exception as e:
    print(f"[WARN] FTP index no leido: {e}")

# List FTP JPGs
ftp_files = []
s.retrlines("NLST", ftp_files.append)
ftp_jpgs = [f for f in ftp_files if f.lower().endswith('.jpg')]
print(f"[INFO] JPGs en FTP: {len(ftp_jpgs)}")

# Download new images with validation
ya_descargadas = set(os.listdir(IMAGES_DIR))
# First: re-validate existing local files that might be corrupt from previous runs
corruptas_previas = 0
for jpg in list(ya_descargadas):
    if not jpg.lower().endswith('.jpg'):
        continue
    local_path = os.path.join(IMAGES_DIR, jpg)
    try:
        size = os.path.getsize(local_path)
        if size < MIN_JPG_SIZE:
            os.remove(local_path)
            ya_descargadas.discard(jpg)
            corruptas_previas += 1
            continue
        with Image.open(local_path) as im:
            im.verify()
    except Exception:
        try:
            os.remove(local_path)
        except Exception:
            pass
        ya_descargadas.discard(jpg)
        corruptas_previas += 1
if corruptas_previas:
    print(f"[IMG] Eliminadas {corruptas_previas} imagenes corruptas/parciales previas")

nuevas = 0
for jpg in ftp_jpgs:
    if jpg not in ya_descargadas:
        local_path = os.path.join(IMAGES_DIR, jpg)
        try:
            with open(local_path, 'wb') as f:
                s.retrbinary(f"RETR {jpg}", f.write)
            # Validate: file must be large enough and be a valid JPEG
            size = os.path.getsize(local_path)
            if size < MIN_JPG_SIZE:
                print(f"[IMG] Descartada {jpg}: solo {size} bytes (minimo {MIN_JPG_SIZE})")
                os.remove(local_path)
                continue
            try:
                with Image.open(local_path) as im:
                    im.verify()
            except Exception:
                print(f"[IMG] Descartada {jpg}: no es un JPEG valido o esta corrupta")
                os.remove(local_path)
                continue
            nuevas += 1
            print(f"[IMG] Descargada y validada: {jpg} ({size} bytes)")
        except Exception as e:
            print(f"[IMG] Error descargando {jpg}: {e}")
            # Borrar archivo parcial si quedo en disco
            local_path = os.path.join(IMAGES_DIR, jpg)
            if os.path.exists(local_path):
                os.remove(local_path)
                print(f"[IMG] Archivo parcial eliminado: {jpg}")

# Re-scan local dir after cleanup to get accurate list
ya_descargadas = set(os.listdir(IMAGES_DIR))
s.quit()
print(f"[IMG] Nuevas descargadas: {nuevas}")

# Build entries with local GitHub Pages URLs
# MODO ADITIVO: solo agregar las nuevas, nunca eliminar
agregadas = 0
for jpg in ftp_jpgs:
    if jpg in entries_by_file:
        e = entries_by_file[jpg]
        e["url"] = f"https://juank329.github.io/ce4jwi-qsls/qsl_images/{jpg}"
        e["fuente"] = e.get("fuente", "log4om")
    else:
        call = call_from_file(jpg)
        meta = parsearNombreArchivo(jpg)
        entry = {
            "call": call,
            "carpeta": "General",
            "archivo": jpg,
            "url": f"https://juank329.github.io/ce4jwi-qsls/qsl_images/{jpg}",
            "fecha": meta.fecha,
            "hora": meta.hora,
            "modo": meta.modo,
            "fuente": "log4om",
        }
        entries.append(entry)
        entries_by_file[jpg] = entry
        agregadas += 1
        print(f"[NEW] {jpg} ({call})")

print(f"[SYNC] Total: {len(entries)} QSLs (agregadas {agregadas} nuevas, 0 eliminadas)")

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
