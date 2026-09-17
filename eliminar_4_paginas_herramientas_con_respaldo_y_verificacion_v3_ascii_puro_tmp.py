# -*- coding: utf-8 -*-
# eliminar_4_paginas_herramientas_con_respaldo_y_verificacion_v3_ascii_puro_tmp.py
# ASCII PURO. Pasos:
#   1) respaldo de las 4 herramienta-*.html en recursos/respaldo_herramientas_20260924/
#   2) borrarlas de la raiz
#   3) verificar que ningun .html vivo ni el JS vivo las referencia
#   4) reporte final (todo ASCII)
import io, os, glob, shutil

BASE = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
REC  = os.path.join(BASE, "recursos")
RESP = os.path.join(REC, "respaldo_herramientas_20260924")
PAGS = ["herramienta-indicativos.html",
        "herramienta-satelites.html",
        "herramienta-propagacion.html",
        "herramienta-mapa-radio.html"]

def leer(p): return io.open(p, encoding="utf-8").read()
def escribir(p, s): io.open(p, "w", encoding="utf-8", newline="\n").write(s)

# (0) diagnostico previo
js_vivo = None
for h in glob.glob(os.path.join(BASE, "*.html")):
    ht = leer(h)
    for m in re.findall(r"componentes_\d+\.js", ht):
        js_vivo = m
if js_vivo is None:
    print("JS_VIVO=None")
else:
    print("JS_VIVO=" + js_vivo)

# (1) respaldo
os.makedirs(RESP, exist_ok=True)
for nom in PAGS:
    p = os.path.join(BASE, nom)
    if os.path.exists(p):
        shutil.copy2(p, os.path.join(RESP, nom))
        print("RESPALDADA=" + nom)
    else:
        print("YA_NO_EXISTE=" + nom)

# (2) borrar
for nom in PAGS:
    p = os.path.join(BASE, nom)
    if os.path.exists(p):
        os.remove(p)
        print("BORRADA=" + nom)

# (3) verificacion de referencias vivas
refs = []
for h in glob.glob(os.path.join(BASE, "*.html")):
    ht = leer(h)
    for nom in PAGS:
        if nom in ht:
            refs.append(os.path.basename(h) + "->" + nom)
if js_vivo:
    t = leer(os.path.join(REC, js_vivo))
    for nom in PAGS:
        if nom in t:
            refs.append("JS->" + nom)

print("REFERENCIAS_VIVAS=" + str(len(refs)))
for r in refs:
    print("REF=" + r)

# (4) remanentes de archivos
rem = [n for n in glob.glob(os.path.join(BASE, "herramienta-*.html"))]
print("REMANENTES_ARCHIVOS=" + str(len(rem)))
print("FIN_OK")
