# -*- coding: utf-8 -*-
import glob, io, os, re
R = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"


def leer(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()


idx = leer(os.path.join(R, "index.html"))
refs = sorted(set(re.findall(r"actividades_\d{14}_[0-9a-f]{8}\.js", idx)))
print("INDEX_REF:", refs)
for ref in refs:
    p = os.path.join(R, "recursos", ref)
    ex = os.path.exists(p)
    id87 = False
    if ex:
        t = leer(p)
        id87 = bool(re.search(r"\bid\s*:\s*87\b", t))
    print("  REF", ref, "en_disco=", ex, "id87=", id87)
base = leer(os.path.join(R, "recursos", "actividades.js"))
print("BASE_id87:", bool(re.search(r"\bid\s*:\s*87\b", base)))
discos = sorted(glob.glob(os.path.join(R, "recursos", "actividades_*.js")))
print("DISCO_ULTIMO:", os.path.basename(discos[-1]) if discos else "ninguno")
