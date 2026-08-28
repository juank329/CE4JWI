import ftplib, json, requests, base64, os, sys, time, datetime, re, subprocess
from io import BytesIO
from PIL import Image

GH_TOKEN = os.environ['GH_TOKEN']
GITHUB_REPO = "juank329/ce4jwi-qsls"
IMAGES_DIR = "qsl_images"
MIN_JPG_SIZE = 5000

FTP_ACCOUNTS = []
# CE4JWI account
ce4jwi_host = os.environ.get('FTP_HOST', '')
ce4jwi_user = os.environ.get('FTP_USER', '')
ce4jwi_pass = os.environ.get('FTP_PASS', '')
if ce4jwi_user:
    FTP_ACCOUNTS.append({'host': ce4jwi_host, 'user': ce4jwi_user, 'pass': ce4jwi_pass, 'label': 'CE4JWI'})
# XR4MAU account
xr4mau_host = os.environ.get('FTP2_HOST', '')
xr4mau_user = os.environ.get('FTP2_USER', '')
xr4mau_pass = os.environ.get('FTP2_PASS', '')
if xr4mau_user:
    FTP_ACCOUNTS.append({'host': xr4mau_host, 'user': xr4mau_user, 'pass': xr4mau_pass, 'label': 'XR4MAU'})

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

    # SAFETY: check current count on GitHub Pages - NEVER overwrite with fewer entries
    try:
        r_check = requests.get(url, headers=headers, timeout=10)
        if r_check.status_code == 200:
            existing = json.loads(base64.b64decode(r_check.json()["content"]).decode())
            existing_count = len(existing) if isinstance(existing, list) else 0
            if len(entries) < existing_count:
                print(f"[ABORT] SAFETY: new JSON has {len(entries)} entries but GitHub Pages has {existing_count}. Refusing to overwrite with fewer entries.")
                return True
    except Exception as e:
        print(f"[WARN] Safety check failed: {e}")

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

# Load EXISTING index from GitHub Pages to preserve LOG4OM entries
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

# Load MANUAL QSLs from Supabase (candado) so they persist in the index
# and never get lost. Uses SUPABASE_URL + SUPABASE_KEY (service_role) del entorno.
try:
    sb_url = os.environ.get('SUPABASE_URL', '')
    sb_key = os.environ.get('SUPABASE_KEY', '')
    if sb_url and sb_key:
        headers = {"Authorization": f"Bearer {sb_key}", "apikey": sb_key}
        rr = requests.get(f"{sb_url}/rest/v1/qsls?select=*&order=fecha.desc", headers=headers, timeout=15)
        if rr.status_code == 200:
            filas = rr.json()
            if isinstance(filas, list):
                sb_agregadas = 0
                for f in filas:
                    if not f or not f.get("callsign") or not f.get("archivo"):
                        continue
                    arch = f["archivo"]
                    # Las manuales viven en el bucket publico de Supabase
                    url_img = f.get("url_imagen") or f"{sb_url}/storage/v1/object/public/qsl-images/{arch}"
                    nuevo = {
                        "call": (f.get("callsign") or "").upper().strip(),
                        "carpeta": f.get("carpeta") or f.get("actividad") or f.get("banda") or "General",
                        "archivo": arch,
                        "url": url_img,
                        "fecha": f.get("fecha") or "",
                        "hora": f.get("hora") or "",
                        "modo": f.get("modo") or "",
                        "fuente": "manual",
                    }
                    if arch not in entries_by_file:
                        entries.append(nuevo)
                        entries_by_file[arch] = nuevo
                        sb_agregadas += 1
                        print(f"[SUPABASE] Manual agregada: {arch} ({nuevo['call']})")
                print(f"[SUPABASE] {sb_agregadas} QSL manuales del candado fusionadas desde Supabase")
            else:
                print(f"[WARN] Supabase devolvio formato inesperado, se ignora")
        else:
            print(f"[WARN] Supabase respondio {rr.status_code}, se ignora ({rr.text[:120]})")
    else:
        print(f"[INFO] Sin SUPABASE_URL/SUPABASE_KEY en entorno, se omite fusion de manuales")
except Exception as e:
    print(f"[WARN] No se pudo fusionar Supabase: {e}")

# Process each FTP account
ya_descargadas = set(os.listdir(IMAGES_DIR))
nuevas = 0

# Validate existing local files before downloading
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

all_ftp_jpgs = []
for acct in FTP_ACCOUNTS:
    label = acct['label']
    print(f"\n{'='*50}")
    print(f"[FTP] Conectando a cuenta {label}: {acct['user']}@{acct['host']}")
    try:
        s = ftplib.FTP(acct['host'], acct['user'], acct['pass'], timeout=30)
        s.cwd("/")

        # Read FTP index as fallback for this account
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
                print(f"[{label}] Fusionadas {len(ftp_entries)} entradas del FTP")
        except ftplib.error_perm:
            pass
        except Exception as e:
            print(f"[{label}] FTP index no leido: {e}")

        # List FTP JPGs
        ftp_files = []
        s.retrlines("NLST", ftp_files.append)
        ftp_jpgs = [f for f in ftp_files if f.lower().endswith('.jpg')]
        print(f"[{label}] JPGs en FTP: {len(ftp_jpgs)}")
        all_ftp_jpgs.extend(ftp_jpgs)

        # Download new images
        for jpg in ftp_jpgs:
            if jpg not in ya_descargadas:
                local_path = os.path.join(IMAGES_DIR, jpg)
                try:
                    with open(local_path, 'wb') as f:
                        s.retrbinary(f"RETR {jpg}", f.write)
                    size = os.path.getsize(local_path)
                    if size < MIN_JPG_SIZE:
                        print(f"[{label}] Descartada {jpg}: solo {size} bytes")
                        os.remove(local_path)
                        continue
                    try:
                        with Image.open(local_path) as im:
                            im.verify()
                    except Exception:
                        print(f"[{label}] Descartada {jpg}: JPEG invalido")
                        os.remove(local_path)
                        continue
                    nuevas += 1
                    print(f"[{label}] Descargada: {jpg} ({size} bytes)")
                except Exception as e:
                    print(f"[{label}] Error descargando {jpg}: {e}")
                    if os.path.exists(local_path):
                        os.remove(local_path)

        s.quit()
        print(f"[{label}] Sincronizacion FTP completada")
    except Exception as e:
        print(f"[{label}] ERROR de conexion FTP: {e}")

# Re-scan local dir after all downloads
ya_descargadas = set(os.listdir(IMAGES_DIR))
print(f"[IMG] Total nuevas descargadas: {nuevas}")

# Build entries with local GitHub Pages URLs - ADDITIVE only
agregadas = 0
for jpg in all_ftp_jpgs:
    if jpg in entries_by_file:
        e = entries_by_file[jpg]
        e["url"] = f"https://juank329.github.io/ce4jwi-qsls/qsl_images/{jpg}"
        e["fuente"] = e.get("fuente", "aprs")
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
            "fuente": "aprs",
        }
        entries.append(entry)
        entries_by_file[jpg] = entry
        agregadas += 1
        print(f"[NEW] {jpg} ({call})")

print(f"[SYNC] Total: {len(entries)} QSLs (agregadas {agregadas} nuevas, 0 eliminadas)")

# Upload updated index back to each FTP
for acct in FTP_ACCOUNTS:
    try:
        s2 = ftplib.FTP(acct['host'], acct['user'], acct['pass'], timeout=30)
        s2.cwd("/")
        data = json.dumps(entries, ensure_ascii=False).encode("utf-8")
        s2.storbinary("STOR log_qsl.json", BytesIO(data))
        s2.quit()
        print(f"[OK] FTP {acct['label']} index updated: {len(entries)} entries")
    except Exception as e:
        print(f"[WARN] Could not update FTP {acct['label']} index: {e}")

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
