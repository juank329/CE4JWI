# -*- coding: utf-8 -*-
# build_los_chinchineros_final.py - pipeline completo LOS CHINCHINEROS 2026 (id 87)
# [1] clon: el_organillero_2026.html -> los_chinchineros_2026.html
# [2] insertar id 87 en recursos/actividades.js
# [3] cachebust nuevo actividades_<ts>_<hash8>.js + reemplazar en TODOS los .html
# [4] FTP: subir los_chinchineros_2026.html + cachebust nuevo + todos los .html
# UTF-8 seguro: texto en espanol via escapes \\uXXXX, resto ASCII.
import ftplib
import hashlib
import io
import os
import re
import shutil
import sys
import time

REPO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
ORIG = os.path.join(REPO, "el_organillero_2026.html")
DEST = os.path.join(REPO, "los_chinchineros_2026.html")
ACT = os.path.join(REPO, "recursos", "actividades.js")
SUBI = os.path.join(REPO, "subir_v18.py")

PAT_MOJI = re.compile("[\u00c0-\u00c3][^\u0000-\u007f]")


def mojibake(s):
    return len(PAT_MOJI.findall(s))


def leer(enc="utf-8"):
    with io.open(ACT, "r", encoding=enc) as f:
        return f.read()


def string_of(p, enc="utf-8"):
    with io.open(p, "r", encoding=enc) as f:
        return f.read()


def escribir(p, s, enc="utf-8"):
    with io.open(p, "w", encoding=enc, newline="") as f:
        f.write(s)


def creds_ftp():
    t = string_of(SUBI)
    m = re.search(r'HOST\s*=\s*"([^"]+)".*?USER\s*=\s*"([^"]+)".*?PASS\s*=\s*"([^"]+)"', t, re.S)
    if not m:
        raise SystemExit("no encuentro HOST/USER/PASS en subir_v18.py")
    return m.group(1), m.group(2), m.group(3)


def main(modo):
    # ---------------- [1] clon ----------------
    t = string_of(ORIG)
    reemplazos = [
        ("El Organillero 2026", "Los Chinchineros 2026"),
        ("El Organillero", "Los Chinchineros"),
        ("ORGANILLERO", "CHINCHINERO"),
        ("Organillero", "Chinchinero"),
        ("organillero", "chinchinero"),
        ("el_organillero_2026.html", "los_chinchineros_2026.html"),
        ("public/El Organillero.webp", "public/LOS CHINCHINEROS.webp"),
        ("ranking_organillero.json", "ranking_chinchineros.json"),
        ("15 Septiembre 2026", "16 Septiembre 2026"),
    ]
    for a, b in reemplazos:
        t = t.replace(a, b)
    if mojibake(t):
        raise SystemExit("mojibake en clon - ABORTO")
    escribir(DEST, t)
    print("[1/4] clon OK %d B mojibake=0" % os.path.getsize(DEST))

    # ---------------- [2] id 87 ----------------
    a = leer()
    if re.search(r"\bid\s*:\s*87\b", a):
        print("[2/4] id 87 ya presente")
    else:
        bloque = (
            "{\n"
            "  id: 87,\n"
            '  title: "Los Chinchineros 2026",\n'
            '  image: "public/LOS CHINCHINEROS.webp",\n'
            '  status: "EN VIVO",\n'
            "  description:\n"
            '    "Activaci\u00f3n especial Los Chinchineros 2026. Solo APRS con la frase CHINCHINERO '
            "a la estaci\u00f3n CE4JWI-10. QSL conmemorativa autom\u00e1tica y ranking en tiempo real.\",\n"
            '  date: "16 Septiembre 2026",\n'
            '  url: "los_chinchineros_2026.html",\n'
            "},\n"
        )
        bloque = bloque.replace("\\u00f3", "\u00f3").replace("\\u00e1", "\u00e1")
        if mojibake(bloque):
            raise SystemExit("mojibake en id 87 - ABORTO")
        idx = a.rfind("]\n")
        if idx == -1:
            raise SystemExit("no encuentro cierre de actividades.js")
        a2 = a[:idx] + "\n  " + bloque + "]" + a[idx + 2 :]
        if mojibake(a2):
            raise SystemExit("mojibake en actividades.js - ABORTO")
        escribir_p(ACT, a2)
        print("[2/4] id 87 insertado mojibake=0")

    # ---------------- [3] cachebust ----------------
    a = leer()
    cache_dir = os.path.join(REPO, "recursos")
    viejos = sorted(f for f in os.listdir(cache_dir) if re.match(r"^actividades_\d{14}_[0-9a-f]{8}\.js$", f))
    if not viejos:
        raise SystemExit("no hay cachebust actividades_* en recursos/")
    nuevo = "actividades_%s_%s.js" % (time.strftime("%Y%m%d%H%M%S"), hashlib.sha256(a.encode("utf-8")).hexdigest()[:8])
    nuevo_path = os.path.join(cache_dir, nuevo)
    if not os.path.exists(nuevo_path):
        shutil.copy2(ACT, nuevo_path)
    viejo_ref = None
    htmls = [f for f in os.listdir(REPO) if f.lower().endswith(".html")]
    for fn in htmls:
        h = string_of(os.path.join(REPO, fn))
        m = re.search(r"actividades_\d{14}_[0-9a-f]{8}\.js", h)
        if m:
            viejo_ref = m.group(0)
            break
    if not viejo_ref:
        raise SystemExit("ningun html referencia cachebust actividades_*")
    print("[3/4] cachebust %s -> %s" % (viejo_ref, nuevo))
    camb = 0
    for fn in htmls:
        p = os.path.join(REPO, fn)
        h = string_of(p)
        if viejo_ref in h and viejo_ref != nuevo:
            h2 = h.replace(viejo_ref, nuevo)
            if mojibake(h2):
                raise SystemExit("mojibake al cachebustear %s" % fn)
            escribir(p, h2)
            camb += 1
    print("      html actualizados: %d/%d" % (camb, len(htmls)))

    if modo != "ftp":
        print("LISTO (local). Ejecuta con 'ftp' como arg para subir.")
        return

    # ---------------- [4] FTP ----------------
    host, user, pwd = creds_ftp()
    archivos = [DEST, nuevo_path] + [os.path.join(REPO, f) for f in htmls]
    ftp = ftplib.FTP(host)
    ftp.login(user, pwd)
    ftp.set_pasv(True)
    ok, err = 0, []
    for p in archivos:
        rel = os.path.relpath(p, REPO).replace("\\", "/")
        try:
            with open(p, "rb") as fh:
                ftp.storbinary("STOR " + rel, fh)
            ok += 1
        except Exception as e:
            err.append((rel, str(e)[:60]))
    ftp.quit()
    print("[4/4] FTP %s total=%d OK=%d errores=%d" % (host, len(archivos), ok, len(err)))
    for r, e in err[:10]:
        print("   ERR", r, "->", e)


def escribir_p(p, s):
    escribir(p, s)


if __name__ == "__main__":
    modo = sys.argv[1] if len(sys.argv) > 1 else "local"
    main(modo)
