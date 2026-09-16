# -*- coding: utf-8 -*-
# Verifica cobertura local REAL del ranking en vivo chinchinero.
import io, json, os, re, urllib.request, sys

BASE = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
src = io.open(os.path.join(BASE, "recursos", "banderas_20260915.js"), encoding="utf-8").read()
PREFS = {}
for m in re.finditer(r'"([A-Z0-9]{2})"\s*:\s*"([A-Z]{2})"', src):
    PREFS.setdefault(m.group(1), m.group(2))

def iso_local(call):
    c = PREFS.get(call[:2])
    if c: return c
    if re.match(r"^[A-Z][0-9]", call): return "US"
    if re.match(r"^[78][0-9]", call): return "JP"
    return ""

url = "https://qsl.net/ce4jwi/ranking_chinchineros.json"
req = urllib.request.Request(url, headers={"Cache-Control": "no-cache"})
data = json.load(urllib.request.urlopen(req, timeout=40))
filas = data.get("filas", [])
calls = []
for f in filas:
    c = f.get("call")
    if c:
        c = str(c).upper()
        calls.append(c)

falta = sorted({c for c in calls if not iso_local(c)})
print("FILAS=", len(filas))
print("CALLS=", len(set(calls)))
print("SIN_BANDERA_LOCAL=", len(falta))
print("LISTA=", ", ".join(falta) if falta else "(ninguno)")
