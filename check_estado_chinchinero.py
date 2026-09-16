# -*- coding: utf-8 -*-
"""CE4JWI - checker read-only. Imprime (ASCII, sin modificar NADA):
   1) repo que TIENE .git + index.html
   2) los_chinchineros_2026.html: existe? mojibake? cambio de roles "chinchinero"?
   3) actividades.js: id 87 ya presente?
   4) cachebust actividades_*.js que referencian los 107 HTML (el viejo)
   5) credenciales FTP reales (las que usa el bot que ya sube ranking_chinchineros.json)
"""
import glob
import hashlib
import io
import json
import os
import re

MOJIBAKE_RE = re.compile(r"\u00c3[^\u0000-\u007f]")


def mojibake(t):
    return len(MOJIBAKE_RE.findall(t))


def leer(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()


POSIBLES = [
    r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI",
    r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI",
    r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI",
]
repo = None
for c in POSIBLES:
    if os.path.isdir(os.path.join(c, ".git")) and os.path.isfile(os.path.join(c, "index.html")):
        repo = c
        break
if not repo:
    # fallback: buscar cualquier .git dir con index.html cerca
    for base in set(POSIBLES):
        if not os.path.isdir(base):
            continue
        for d in os.listdir(base):
            cand = os.path.join(base, d)
            if os.path.isdir(os.path.join(cand, ".git")):
                repo = cand
                break
        if repo:
            break
if not repo:
    raise SystemExit("NO encuentro repo .git + index.html")

print("REPO: %s" % repo)

# 2) clon
dst = os.path.join(repo, "los_chinchineros_2026.html")
if os.path.isfile(dst):
    t = leer(dst)
    n = mojibake(t)
    tiene_frase = "CHINCHINERO" in t
    tiene_rank = "ranking_chinchineros.json" in t
    tiene_img = "LOS CHINCHINEROS.webp" in t
    print("CLON: SI  (%d B) mojibake=%d  frase=%s  ranking=%s  img=%s"
          % (os.path.getsize(dst), n, tiene_frase, tiene_rank, tiene_img))
    m_title = re.search(r"<title>([^<]+)</title>", t)
    print("  title: %s" % (m_title.group(1) if m_title else "?"))
else:
    print("CLON: NO")

# 3) id 87
a = leer(os.path.join(repo, "recursos", "actividades.js"))
print("ID87 en actividades.js: %s  (mojibake=%d)"
      % (bool(re.search(r"\bid\s*:\s*87\b", a)), mojibake(a)))

# 4) cachebust viejos referenciados
vistos = {}
for fn in os.listdir(repo):
    if not fn.lower().endswith(".html"):
        continue
    h = leer(os.path.join(repo, fn))
    m = re.search(r"actividades_[0-9]{14}_[0-9a-f]{8}\.js", h)
    if m:
        vistos[m.group(0)] = vistos.get(m.group(0), 0) + 1
print("CACHEBUST en HTML: %s" % ", ".join("%s(x%d)" % (k, v) for k, v in vistos.items()))

# 5) credenciales FTP reales
found = []
for base in (r"C:\Users\javen\Desktop", r"C:\Users\javen\OneDrive\Escritorio",
             r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"):
    if not os.path.isdir(base):
        continue
    for p in glob.glob(os.path.join(base, "**", "bot_aprs_ce4jwi10", "config*.json"), recursive=True):
        try:
            c = json.loads(leer(p))
        except Exception:
            continue
        f = c.get("ftp") or c.get("configuracion_ftp") or c
        h = f.get("host") or f.get("ftp_host") or f.get("ftp")
        u = f.get("user") or f.get("ftp_user") or f.get("usuario")
        p2 = f.get("pass") or f.get("ftp_pass") or f.get("clave")
        if h and u and p2:
            found.append((p, h, u, p2))
for p, h, u, p2 in found:
    print("FTP: %s\n     host=%s user=%s pass=%s" % (p, h, u, p2))
if not found:
    print("FTP: no encontre config del bot -> no puedo subir (quedara en disco para git)")
