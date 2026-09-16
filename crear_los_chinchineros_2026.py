# -*- coding: utf-8 -*-
"""
FINAL v2 - LOS CHINCHINEROS 2026 (id 87, clon de id 86 via el_organillero_2026.html)
CE4JWI (raiz web) - solo APRS frase CHINCHINERO a CE4JWI-10 - ranking_chinchineros.json
ya lo genera y sube el bot; aqui solo se crea la pagina + entrada id 87 + cachebust FTP.

Pasos (cada uno idempotente, con mojibake=0 siempre):
  [1] clonar el_organillero_2026.html -> los_chinchineros_2026.html (reemplazos ASCII)
  [2] actividades.js: insertar id 87 (si no existe) ya con descripcion ES
  [3] cachebust nuevo actividades_<ts>_<h8>.js = copia byte-exacta de actividades.js
      y actualizar TODOS los html que referencia el cachebust viejo
  [4] FTP: subir (raiz) los_chinchineros_2026.html + (recursos) cachebust nuevo
"""
import ftplib, hashlib, io, os, re, shutil, time

REPO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
PAG_ORIGEN = os.path.join(REPO, "el_organillero_2026.html")
PAG_DEST = os.path.join(REPO, "los_chinchineros_2026.html")
IMAGEN = "public/LOS CHINCHINEROS.webp"
RANKING = "ranking_chinchineros.json"

# credenciales FTP ya validadas en sesiones anteriores (web v16 OK)
FTP = {
    "host": "ftp.qsl.net",
    "user": "CE4JWI",
    "pass": "Sayayin@CE4JWI",
}


def leer(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()


def escribir(p, t):
    with io.open(p, "w", encoding="utf-8", newline="") as f:
        f.write(t)


def mojibake(t):
    return len(re.findall(r"\u00c3[^\u0000-\u007f]", t))


def subir_ftp(rel_pares):
    """sube [(ruta_local, ruta_ftp), ...] una sola conexion; devuelve (ok, errs)"""
    ftp = ftplib.FTP(FTP["host"], FTP["user"], FTP["pass"])
    ftp.set_pasv(True)
    ok, errs = 0, []
    for lp, rp in rel_pares:
        try:
            with open(lp, "rb") as fh:
                ftp.storbinary("STOR " + rp, fh)
            ok += 1
        except Exception as e:
            errs.append((rp, str(e)[:60]))
    ftp.quit()
    return ok, errs


# ---------------- [1] clonar ----------------
t = leer(PAG_ORIGEN)
if os.path.exists(PAG_DEST) and "moneda" not in t:
    # idempotente: si ya clonado por el run cortado, se re-clona igual (fonetico completo)
    pass
reemplazos = [
    ("El Organillero 2026", "Los Chinchineros 2026"),
    ("El Organillero", "Los Chinchineros"),
    ("ORGANILLERO", "CHINCHINERO"),
    ("Organillero", "Chinchinero"),
    ("organillero", "chinchinero"),
    ("ranking_organillero.json", RANKING),
    ("public/El Organillero.webp", IMAGEN),
    ("15 Septiembre 2026", "16 Septiembre 2026"),
]
for a, b in reemplazos:
    t = t.replace(a, b)
n = mojibake(t)
if n:
    raise SystemExit("mojibake en pagina: %d - ABORTO" % n)
escribir(PAG_DEST, t)
print("[1/4] %s (%d B, mojibake=%d)" % (os.path.basename(PAG_DEST), os.path.getsize(PAG_DEST), n))

# ---------------- [2] actividades.js ------------
directorio_act = os.path.join(REPO, "recursos", "actividades.js")
act = leer(directorio_act)
if re.search(r"\bid\s*:\s*87\b", act):
    print("[2/4] id 87 ya presente - OK")
else:
    # localizar el bloque del Organillero (id 86) para insertar el 87 despues
    m = re.search(r"(\bid:\s*86,.*?\n  \n\})", act, re.S)
    if not m:
        raise SystemExit("no encontre bloque id 86 en actividades.js")
    nuevo = (
        "\n  {\n"
        "    id: 87,\n"
        '    title: "Los Chinchineros 2026",\n'
        '    image: "public/LOS CHINCHINEROS.webp",\n'
        '    status: "TERMINADA",\n'
        "    description:\n"
        '      "Activaci\u00f3n especial Los Chinchineros. Solo APRS con la frase CHINCHINERO a la '
        "estaci\u00f3n CE4JWI-10. QSL conmemorativa autom\u00e1tica y ranking en tiempo real.\",\n"
        '    date: "16 Septiembre 2026",\n'
        '    url: "los_chinchineros_2026.html",\n'
        "  },\n"
    )
    act2 = act.replace(m.group(0), m.group(0) + "  " + nuevo, 1)
    # quitar duplicacion de marca si el clon anterior ya agrego algo raro (nunca debe persistir)
    if mojibake(act2):
        raise SystemExit("mojibake en actividades.js - ABORTO")
    escribir(directorio_act, act2)
    print("[2/4] id 87 insertado (mojibake=0)")

# ---------------- [3] cachebust ----------------
contenido = leer(directorio_act)
ts = time.strftime("%Y%m%d%H%M%S")
h8 = hashlib.sha256(contenido.encode("utf-8")).hexdigest()[:8]
nuevo_cache = "actividades_%s_%s.js" % (ts, h8)
viejo_cache = None
for fn in os.listdir(os.path.join(REPO, "recursos")):
    if re.match(r"^actividades_\d{14}_[0-9a-f]{8}\.js$", fn):
        viejo_cache = fn  # el lexicograficamente mayor = el que apuntan los html
if not viejo_cache:
    raise SystemExit("no hay cachebust actividades_* previo")
nueva_ruta = os.path.join(REPO, "recursos", nuevo_cache)
shutil.copyfile(directorio_act, nueva_ruta)
n = mojibake(leer(nueva_ruta))
if n:
    raise SystemExit("mojibake en cachebust nuevo - ABORTO")

actualizados = 0
for fn in os.listdir(REPO):
    if fn.lower().endswith(".html"):
        p = os.path.join(REPO, fn)
        h = leer(p)
        if viejo_cache in h and viejo_cache != nuevo_cache:
            h2 = h.replace(viejo_cache, nuevo_cache)
            if mojibake(h2):
                raise SystemExit("mojibake en actualizar " + fn)
            escribir(p, h2)
            actualizados += 1
    elif fn.lower().endswith(".js") and re.match(r"^actividades_\d+_.*\.js$", fn):
        # el cachebust viejo en si no se toca (los html ya no lo referencian)
        pass
print("[3/4] cachebust: %s -> %s (html actualizados=%d)" % (viejo_cache, nuevo_cache, actualizados))

# ---------------- [4] FTP ----------------
pares = [
    (PAG_DEST, "los_chinchineros_2026.html"),
    (nueva_ruta, "recursos/" + nuevo_cache),
]
# los html que cambiaron de cachebust tambien suben
for fn in os.listdir(REPO):
    if not fn.lower().endswith(".html"):
        continue
    p = os.path.join(REPO, fn)
    pares.append((p, fn))
ok, errs = subir_ftp(pares)
print("[4/4] FTP: OK=%d ERR=%d (totales %d)" % (ok, len(errs), len(pares)))
for r, e in errs[:5]:
    print("   ERR %s -> %s" % (r, e))
