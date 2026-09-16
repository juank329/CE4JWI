# -*- coding: utf-8 -*-
"""Verifica cobertura de prefijos->ISO para todos los rankings del sitio."""
import json, os, re, io, glob

BASE = os.path.dirname(os.path.abspath(__file__))
recursos = os.path.join(BASE, "recursos")

# Leer la tabla PREFS / PREFS del script banderas_20260915.js
src = io.open(os.path.join(recursos, "banderas_20260915.js"), encoding="utf-8").read()
PREFS = {}
for m in re.finditer(r'"([A-Z0-9]{2,3})"\s*:\s*"([A-Z]{2})"', src):
    if len(m.group(1)) == 2:
        PREFS[m.group(1)] = m.group(2)

def iso_local(call):
    if not call: return ""
    call = call.upper()
    c = PREFS.get(call[:2])
    if c: return c
    if re.match(r"^[A-Z][0-9]", call): return "US"
    if re.match(r"^[78][0-9]", call): return "JP"
    return ""

def collect_calls(o, out):
    if isinstance(o, dict):
        if "call" in o and o["call"]:
            out.add(str(o["call"]).upper())
        for v in o.values():
            collect_calls(v, out)
    elif isinstance(o, list):
        for v in o:
            collect_calls(v, out)

calls = set()
blobs = []
rd = os.path.join(BASE, "rankings", "ranking-data")
if os.path.isdir(rd):
    for root, _, files in os.walk(rd):
        for fn in files:
            if fn.endswith((".json", ".JSON")):
                blobs.append(os.path.join(root, fn))
for p in glob.glob(os.path.join(BASE, "rankings", "*.json")):
    blobs.append(p)

for p in blobs:
    try:
        j = json.load(io.open(p, encoding="utf-8"))
        collect_calls(j, calls)
    except Exception as e:
        print("WARN", os.path.basename(p), e)

falta = sorted(c for c in calls if not iso_local(c))
print("ARCHIVOS_JSON=", len(blobs))
print("CALLS_DISTINTOS=", len(calls))
print("SIN_BANDERA_LOCAL=", len(falta))
for c in falta:
    print("  NO_LOCAL:", c)
