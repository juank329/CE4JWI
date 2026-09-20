# -*- coding: utf-8 -*-
"""Corrige TODAS las tarjetas cuya imagen es la generica 'modos/SOLO APRS'
en CE4JWI/recursos/actividades.js, asignandoles su imagen conmemorativa de public/."""
import io, os, re, glob

RO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
RES = os.path.join(RO, "public")
SRC = os.path.join(RO, "recursos", "actividades.js")

def rt(p):
    with io.open(p, encoding="utf-8") as f:
        return f.read()

def wt(p, s):
    with io.open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(s)

def base_img(nombre):
    """quita 'public/' y normaliza sin extension para emparejar con archivos."""
    n = os.path.basename(nombre)
    return os.path.splitext(n)[0]

disponibles = [os.path.basename(f) for f in glob.glob(os.path.join(RES, "*"))]
norm = {}
for d in disponibles:
    clave = base_img(d).lower()
    norm.setdefault(clave, d)

t = rt(SRC)
print("FUENTE %d B | FFFD %d" % (len(t.encode("utf-8")), t.count("\ufffd")))

generica = "CE4JWI -10 SOLO APRS.webp"
cambios = []
para_repair = re.finditer(
    r"\{\s*id:\s*(\d+).*?title:\s*\"([^\"]+)\".*?image:\s*\"([^\"]+)\"",
    t, re.S)

def token_de_title(title):
    """obtener palabra(s) distintiva(s) minuscula para pre-emparejar imagen."""
    x = re.sub(r"[^a-z\u00e0-\u00ff ]", " ", title.lower().replace("\u00f3", "o"))
    palabras = [w for w in x.split() if len(w) > 2]
    return palabras

buscar_por_db = globals().get("DB_CONMEMORATIVAS")
if buscar_por_db is None:
    # fallback: elegir de disponibles el que contenga mas tokens del titulo
    def buscar_por_db(tokens, title_lower):
        mejor, mejor_score = None, 0
        for clave, arch in norm.items():
            score = sum(1 for tk in tokens if tk in clave.replace("-", " ").replace(".", " "))
            if score > mejor_score:
                mejor, mejor_score = arch, score
        return mejor if mejor_score >= 2 else None

resultados = []
for m in para_repair:
    iid, title, img = int(m.group(1)), m.group(2), m.group(3)
    if os.path.basename(img).lower() == generica.lower():
        tokens = token_de_title(title)
        best = buscar_por_db(tokens, title.lower())
        resultados.append((iid, title, img, best))

print("TARJETAS con imagen generica 'SOLO APRS': %d" % len(resultados))
for iid, title, img, best in resultados:
    print("  id:%d | %s\n        img actual=%s\n        conmemorativa=%s" % (iid, title, os.path.basename(img), best))
