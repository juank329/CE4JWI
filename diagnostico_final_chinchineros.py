# -*- coding: utf-8 -*-
# diagnostico_final_chinchineros.py  (ASCII puro; salida solo ASCII)
import io, os, re

REPO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
REC = os.path.join(REPO, "recursos")

def leer(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()

# [1] id 87 en actividades.js base
a = leer(os.path.join(REC, "actividades.js"))
print("BASE_ID87:", bool(re.search(r"[^0-9]id\s*:\s*87", a)))

# [2] referencia exacta en index.html
h = leer(os.path.join(REPO, "index.html"))
m = re.search(r"actividades_\d{14}_[0-9a-f]{8}\.js", h)
print("INDEX_REFA:", m.group(0) if m else "NINGUNA")

# [3] archivos cachebust en disco
c = sorted(f for f in os.listdir(REC) if re.match(r"actividades_\d{14}_[0-9a-f]{8}\.js", f))
print("DISCO_ULTIMO:", c[-1] if c else "NADA")
for f in c:
    ok = bool(re.search(r"[^0-9]id\s*:\s*87", leer(os.path.join(REC, f))))
    print("  ", f, "ID87=", ok)
