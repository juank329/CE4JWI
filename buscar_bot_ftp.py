# -*- coding: utf-8 -*-
"""Busca el config.json del BOT que ya sube ranking_chinchineros.json.
Imprime ruta + credenciales ftp. No modifica nada."""
import json, os, io, glob, re

def leer(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()

def chinos(p):
    try:
        t = leer(p)
    except Exception:
        return ""
    if "chinchineros" in t.lower() or "ranking_chinchineros" in t:
        return t
    return ""

RAICES = [
    r"C:\Users\javen\Desktop\BOT",
    r"C:\Users\javen\BOT",
    r"C:\Users\javen\Desktop",
    r"C:\Users\javen\OneDrive\Escritorio",
    r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI",
]
visto = {}
for r in RAICES:
    if not os.path.isdir(r):
        continue
    # sin recursion OneDrive entero (lento); solo 4 niveles
    for p in glob.glob(r + r"\**", recursive=False):
        pass
for r in RAICES[:3]:
    for p in glob.glob(r + r"\**\config.json", recursive=True):
        try:
            t = leer(p)
        except Exception:
            continue
        if "ranking_chinchineros" in t or "chinchineros.json" in t:
            j = json.loads(t)
            f = j.get("ftp") or {}
            print("CONFIG: " + p)
            print("  ftp.host=%s ftp.user=%s ftp.pass=%s"
                  % (f.get("host"), f.get("user"), f.get("pass")))
            visto[p] = True
if not visto:
    print("NONE: no encontre config con ranking_chinchineros en Desktop/BOT")
    # busqueda amplia: cualquier json con clave ftp en Desktop (1 solo nivel)
    for p in glob.glob(r"C:\Users\javen\Desktop\**\*.json", recursive=True):
        try:
            t = leer(p)
        except Exception:
            continue
        if '"host"' in t and "qsl" in t.lower() and ("user" in t or "usuario" in t):
            print("POSIBLE: " + p)
