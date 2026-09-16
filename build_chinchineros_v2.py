# -*- coding: utf-8 -*-
# build_chinchineros_v2.py  --  pipeline unico y autocontenido
# [1] clon completo los_chinchineros_2026.html (desde el_organillero_2026.html)
# [2] insertar id 87 en recursos/actividades.js
# [3] cachebust nuevo + reemplazo en todos los .html
# [4] FTP subida de los archivos cambiados (credenciales leidas de subir_v18.py)
import ftplib, hashlib, io, os, re, shutil, sys, time

REPO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
ORIG = os.path.join(REPO, "el_organillero_2026.html")
DEST = os.path.join(REPO, "los_chinchineros_2026.html")
ACT  = os.path.join(REPO, "recursos", "actividades.js")
SUBI = os.path.join(REPO, "subir_v18.py")

PAT_MOJI = re.compile("[\u00c0-\u00c3][^\u0000-\u007f]")
def mojibake(s):
    return len(PAT_MOJI.findall(s))

def leer(p, enc="utf-8"):
    with io.open(p, "r", encoding=enc) as f:
        return f.read()
def escribir(p, s, enc="utf-8"):
    with io.open(p, "w", encoding=enc, newline="") as f:
        f.write(s)

def creds():
    t = leer(SUBI)
    m = re.search(r'HOST\s*=\s*"([^"]+)";\s*USER\s*=\s*"([^"]+)";\s*PASS\s*=\s*"([^"]+)"', t)
    if not m:
        raise SystemExit("no encuentro credenciales en subir_v18.py")
    return m.group(1), m.group(2), m.group(3)

# ---------------- [1] clon ----------------
t = leer(ORIG)
reemplazos = [
    (u"El Organillero 2026", u"Los Chinchineros 2026"),
    (u"El Organillero", u"Los Chinchineros"),
    (u"ORGANILLERO", u"CHINCHINERO"),
    (u"Organillero", u"Chinchinero"),
    (u"organillero", u"chinchinero"),
    (u"ranking_organillero.json", u"ranking_chinchineros.json"),
    (u"public/El Organillero.webp", u"public/LOS CHINCHINEROS.webp"),
    (u"el_organillero_2026.html", u"los_chinchineros_2026.html"),
    (u"15 Septiembre 2026", u"16 Septiembre 2026"),
]
for a, b in reemplazos:
    t = t.replace(a, b)
if mojibake(t):
    raise SystemExit("mojibake en clon - ABORTO")
escribir(DEST, t)
print("[1] clon OK", os.path.getsize(DEST), "B  mojibake=0")

# ---------------- [2] id 87 ----------------
a = leer(ACT)
if re.search(r"\bid\s*:\s*87\b", a):
    print("[2] id 87 ya presente, sin cambios")
else:
    bloque = (
        "{\n"
        "  id: 87,\n"
        '  title: "Los Chinchineros 2026",\n'
        '  image: "public/LOS CHINCHINEROS.webp",\n'
        '  status: "EN VIVO",\n'
        "  description:\n"
        '    "Activaci\u00f3n especial Los Chinchineros. Solo APRS con la frase CHINCHINERO a la '
        u'estaci\u00f3n CE4JWI-10. QSL conmemorativa autom\u00e1tica y ranking en tiempo real.",\n'
        '  date: "16 Septiembre 2026",\n'
        '  url: "los_chinchineros_2026.html",\n'
        "},\n"
    )
    if mojibake(bloque):
        raise SystemExit("mojibake en id87 - ABORTO")
    m = re.search(r"\n\s*\]\s*$", a)
    if not m:
        raise SystemExit("no encuentro cierre ] en actividades.js")
    a2 = a[: m.start()] + "\n  " + bloque + "]" + a[m.end():]
    if mojibake(a2):
        raise SystemExit("mojibake tr\u00e1s insert id87 - ABORTO")
    escribir(ACT, a2)
    print("[2] id 87 insertado  mojibake=0")

# ---------------- [3] cachebust ----------------
a = leer(ACT)
cache = [f for f in os.listdir(os.path.join(REPO, "recursos"))
         if re.match(r"^actividades_\d{14}_[0-9a-f]{8}\.js$", f)]
if not cache:
    raise SystemExit("no hay cachebusts viejos")
viejo = sorted(cache)[-1]
ts = time.strftime("%Y%m%d%H%M%S")
h8 = hashlib.sha256(a.encode("utf-8")).hexdigest()[:8]
nuevo = "actividades_%s_%s.js" % (ts, h8)
nuevo_path = os.path.join(REPO, "recursos", nuevo)
if not os.path.exists(nuevo_path) or newUno == "":  # keep file fresh
    shutil.copy2(ACT, nuevo_path)
print("[3] cachebust", viejo, "=>", nuevo)
camb = 0
for fn in os.listdir(REPO):
    if not fn.lower().endswith(".html"):
        continue
    p = os.path.join(REPO, fn)
    h = leer(p)
    if viejo in h:
        h2 = h.replace(viejo, nuevo)
        if mojibake(h2):
            raise SystemExit("mojibake al cachebustar %s" % fn)
        escribir(p, h2)
        camb += 1
print("[3] html actualizados:", camb)

# ---------------- [4] FTP ----------------
if len(sys.argv) > 1 and sys.argv[1] == "--ftp":
    HOST, USER, PASS = creds()
    total = 0
    for f in [DEST, nuevo_path, ACT] + [os.path.join(REPO, fn) for fn in os.listdir(REPO) if fn.lower().endswith(".html")]:
        total += 1
    ftp = ftplib.FTP(HOST); ftp.login(USER, PASS); ftp.set_pasv(True)
    ok = 0; err = []
    def subir(p):
        global ok
        rel = os.path.relpath(p, REPO).replace("\\", "/")
        try:
            with open(p, "rb") as fh:
                ftp.storbinary("STOR " + rel, fh)
            ok += 1
        except Exception as e:
            err.append((rel, str(e)[:60]))
    subir(DEST)
    subir(nuevo_path)
    subir(ACT)
    for fn in os.listdir(REPO):
        if fn.lower().endswith(".html"):
            subir(os.path.join(REPO, fn))
    ftp.quit()
    print("[4] FTP:", HOST, "total=", total, "OK=", ok, "errores=", len(err))
    for r, e in err[:10]:
        print("   ERR", r, "->", e)
else:
    print("[4] salto FTP (pasa --ftp para subir)")
