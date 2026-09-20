# -*- coding: utf-8 -*-
"""Corrige TODAS las tarjetas PRÓXIMAMENTE/EN VIVO cuya imagen es la genérica
de modos ('public/CE4JWI -10 SOLO APRS.webp' o variante 'SOLO APRS') asignándoles
su imagen conmemorativa de MISMO AÑO si existe en public/.
Regla dura: NUNCA se tocan tarjetas FINALIZADO ni la HOT. Reporta cada cambio."""
import io, os, re, glob, unicodedata

RO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
PUB = os.path.join(RO, "public")
RES = os.path.join(RO, "recursos")
SRC = os.path.join(RES, "actividades.js")

def rt(p):
    with io.open(p, encoding="utf-8") as f:
        return f.read()
def wt(p, s):
    with io.open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(s)

def norm(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[^a-zA-Z0-9]+", " ", s.lower()).strip()
    return " ".join(s.split())

# imágenes conmemorativas disponibles (normalizadas por id/título-esperado)
conmem = {}
for f in os.listdir(PUB):
    if not f.lower().endswith((".webp", ".jpg", ".jpeg", ".png")):
        continue
    conmem[norm(f)] = os.path.join("public", f)

GEN = {"public/CE4JWI -10 SOLO APRS.webp",
       "public/CE4JWI -10 SOLO APRS.webp"}

t = rt(SRC)
print("FUENTE %d B | FFFD %d" % (len(t.encode("utf-8")), t.count("\ufffd")))

# bloques completos
bloques = re.finditer(r"\{\s*id:\s*(\d+).*?\n\s*\},", t, re.S)
cambios = []
for m in bloques:
    b = m.group(0)
    iid = int(m.group(1))
    ti = re.search(r'title:\s*"([^"]+)"', b)
    im = re.search(r'image:\s*"([^"]+)"', b)
    st = re.search(r'status:\s*"([^"]+)"', b)
    if not (ti and im and st):
        continue
    title, img, status = ti.group(1), im.group(1), st.group(1)
    if img not in GEN:
        continue
    if status in ("FINALIZADO", "FINALIZADA") or title.lower().startswith("hot"):
        continue  # regla dura
    # buscar conmemorativa del MISMO AÑO (tokens del título sin años previos)
    y = None
    ym = re.search(r"\b(20\d\d)\b", title)
    if ym:
        y = int(ym.group(1))
    toks = set(re.findall(r"[a-zA-Z\u00e0-\u00ff]+", norm(title)))
    toks.discard(str(y) if y else "")
    mejor, best = None, 0
    for k, v in conmem.items():
        if y and str(y) in k:
            score = sum(1 for tk in toks if tk in k)
            if score > best:
                mejor, best = v, score
    if mejor and best >= 3:
        cambios.append((iid, title, status, img, mejor))
        t = t.replace(img, mejor, 1)

if not cambios:
    print("Nada que corregir (0 tarjetas con imagen genérica de modos en PRÓXIMA/EN VIVO).")
else:
    wt(SRC, t)
    print("Corregidas %d tarjeta(s):" % len(cambios))
    for iid, title, status, old, new in cambios:
        print("  id:%3d | %s | %-12s" % (iid, title, status))
        print("        %-41s ->\n        %s" % (os.path.basename(old), new))
