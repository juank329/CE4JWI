# -*- coding: utf-8 -*-
"""Corrige imagen generica 'CE4JWI -10 SOLO APRS.webp' -> conmemorativa real
en TODAS las tarjetas de recursos/actividades.js. Verifica que la conmemorativa
exista en public/ (match por titulo, anio preferente) antes de aplicarla."""
import io, os, re, unicodedata

RO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"  # canónica (write se resuelve aqui)
RES = os.path.join(RO, "recursos")
PUB = os.path.join(RO, "public")

def rt(p):
    with io.open(p, encoding="utf-8") as f:
        return f.read()

def wt(p, s):
    with io.open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(s)

def norma(s):
    s = s.lower().strip()
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[^a-z0-9\s]", " ", s)
    return re.sub(r"\s+", " ", s).strip()

GEN = "CE4JWI -10 SOLO APRS.webp"

def imagenes_disponibles():
    if not os.path.isdir(PUB):
        return {}
    out = {}
    for f in os.listdir(PUB):
        base, ext = os.path.splitext(f)
        if ext.lower() not in (".webp", ".jpg", ".jpeg", ".png", ".gif"):
            continue
        out[norma(base)] = os.path.join("public", f)
    return out

def tokens_no_anio(title):
    # quitar el año al comparar
    n = norma(title)
    n = re.sub(r"\b20\d\d\b", "", n)
    return n

def elegir_conmemorativa(title, imgs, actual):
    toks = tokens_no_anio(title)
    if not toks:
        return None
    # 1) match exacto incluyendo año correcto (preferido)
    cand = [v for k, v in imgs.items() if k == toks]
    if cand:
        return cand[0]
    # 2) tipo "token*" pero NO la genérica, priorizando los que contienen todos los tokens
    mejor, mejor_len = None, 0
    for k, v in imgs.items():
        if os.path.basename(v) == os.path.basename(actual):
            continue  # saltar la genérica
        if all(t in k for t in toks.split()):
            if len(k) > mejor_len:
                mejor, mejor_len = v, len(k)
    return mejor

def main():
    p = os.path.join(RES, "actividades.js")
    t = rt(p)
    print("FUENTE: %d B | FFFD %d | gen-facturas %d" % (len(t.encode("utf-8")), t.count("\ufffd"), t.count(GEN)))
    imgs = imagenes_disponibles()
    print("imagenes disponibles en public/: %d" % len(imgs))

    cambios = []
    # bloques { id: N, ... image: "..." ... }
    for m in re.finditer(r"\{\s*id:\s*(\d+)\s*,.*?title:\s*\"([^\"]+)\".*?image:\s*\"([^\"]+)\"", t, re.S):
        iid, title, img = int(m.group(1)), m.group(2), m.group(3)
        if os.path.basename(img) != GEN:
            continue
        corr = elegir_conmemorativa(title, imgs, img)
        if corr and os.path.exists(os.path.join(RO, corr.replace("/", "\\"))):
            cambios.append((iid, title, img, corr))

    if not cambios:
        print("Nada que corregir.")
        return

    print("\nCORRECCIONES a aplicar (%d):" % len(cambios))
    c = 0
    for iid, title, img_old, img_new in cambios:
        t2 = t.replace('image: "' + img_old + '"', 'image: "' + img_new + '"', 1)
        if t2 != t:
            t = t2
            c += 1
            print("  id:%d | %s\n        generica=%-34s -> conmemorativa=%s" % (iid, title, os.path.basename(img_old), os.path.basename(img_new)))
    if c:
        wt(p, t)
        print("\nguardado: %d/3 imagen(es) corregidas en actividades.js | FFFD final %d" % (c, t.count("\ufffd")))
    else:
        print("\nno se aplico ningun cambio (imagenes conmemorativas?): revisar matches")

if __name__ == "__main__":
    main()
