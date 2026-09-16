# -*- coding: utf-8 -*-
# sintonia_cachebust_determinista.py  (ASCII + \\uXXXX, autocontenido)
# ELIMINA la ambiguedad de esquema: usa el MISMO esquema de nombre
# que index.html usa HOY y produce un archivo real en disco con id 87.
import hashlib, io, os, re, shutil, sys, time

REPO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
RECU = os.path.join(REPO, "recursos")
BASE = os.path.join(RECU, "actividades.js")
INDEX= os.path.join(REPO, "index.html")
RE_MOJI = re.compile("[\u00c0-\u00c3][^\u0000-\u007f]")


def mojibake(s):
    return len(RE_MOJI.findall(s))


def leer(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()


def escribir(p, s):
    with io.open(p, "w", encoding="utf-8", newline="") as f:
        f.write(s)


def main():
    # [1] esquema y referencia exacta que usa index.html
    idx = leer(INDEX)
    m = re.search(r"actividades_[A-Za-z0-9_]+\.js", idx)
    if not m:
        raise SystemExit("index.html sin ref actividades_* - ABORTO")
    ref = m.group(0)
    print("[1/4] index ref:", ref)

    # [2] base debe tener id 87
    base = leer(BASE)
    if not re.search(r"\bid\s*:\s*87\b", base):
        raise SystemExit("actividades.js base SIN id 87 - ABORTO")
    if mojibake(base):
        raise SystemExit("mojibake en base - ABORTO")
    print("[2/4] base id87 OK, mojibake=0")

    # [3] derivar nuevo nombre con EL MISMO esquema
    #     esquema_actual = lo que hay tras "actividades_" hasta ".js"
    resto = ref[len("actividades_"):-len(".js")]
    m2 = re.match(r"(\d+)(_[0-9a-f]{8})?$", resto)
    if not m2:
        raise SystemExit("esquema raro en ref - no puedo derivar")
    ts = time.strftime("%Y%m%d%H%M%S")
    if m2.group(1) and len(m2.group(1)) >= 14:
        # esquema 14: actividades_<14>_<h8>.js
        parte_ts = ts
        sep_hash = "_" + hashlib.sha256(base.encode("utf-8")).hexdigest()[:8]
    else:
        # esquema 8: actividades_<8>_<h8>.js
        parte_ts = time.strftime("%Y%m%d")
        sep_hash = "_" + hashlib.sha256(base.encode("utf-8")).hexdigest()[:8]
    nuevo = "actividades_" + parte_ts + sep_hash + ".js"
    np = os.path.join(RECU, nuevo)
    if not os.path.exists(np):
        shutil.copy2(BASE, np)
    print("[3/4] nuevo:", nuevo)

    # [4] reemplazar ref por nuevo en todos los html (solo si distinto)
    camb = 0
    for fn in os.listdir(REPO):
        if not fn.lower().endswith(".html"):
            continue
        p = os.path.join(REPO, fn)
        h = leer(p)
        if ref in h and ref != nuevo:
            h2 = h.replace(ref, nuevo)
            if mojibake(h2):
                raise SystemExit("mojibake en %s - ABORTO" % fn)
            escribir(p, h2)
            camb += 1
    print("[4/4] html actualizados:", camb)
    print("LISTO", nuevo)


if __name__ == "__main__":
    main()
