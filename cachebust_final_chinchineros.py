# -*- coding: utf-8 -*-
# cachebust_final_chinchineros.py
# Reemplaza en TODOS los .html del repo:
#   actividades_20260915000322_452461df.js  ->  actividades_20260916024526_8a9db2a5.js
# Solo ASCII + \uXXXX. Guard mojibake por archivo. Imprime conteos.
import glob, io, os, re
REPO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
VIEJO = "actividades_20260915000322_452461df.js"
NUEVO = "actividades_20260916024526_8a9db2a5.js"
RE_MO = re.compile("[\u00c0-\u00c3][^\u0000-\u007f]")


def moji(s):
    return len(RE_MO.findall(s))


def leer(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()


def escribir(p, s):
    with io.open(p, "w", encoding="utf-8", newline="") as f:
        f.write(s)


camb = 0
tot = 0
for p in glob.glob(os.path.join(REPO, "*.html")):
    h = leer(p)
    if VIEJO not in h:
        continue
    tot += 1
    h2 = h.replace(VIEJO, NUEVO)
    if moji(h2):
        raise SystemExit("mojibake en %s - ABORTO" % p)
    escribir(p, h2)
    camb += 1
print("[cachebust] html con ref vieja: %d | actualizados: %d | mojibake=0" % (tot, camb))
