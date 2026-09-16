# -*- coding: utf-8 -*-
# verificar_estado_final.py - diagnostico ASCII puro, 1 salida fija
import io, os, re, glob
REPO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
RE_M = re.compile("[\u00c0-\u00c3][^\u0000-\u007f]")


def leer(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()


def mojibake(s):
    return len(RE_M.findall(s))


idx = leer(os.path.join(REPO, "index.html"))
refs = sorted(set(re.findall(r"actividades_\d{14}_[0-9a-f]{8}\.js", idx)))
print("REF_INDEX:", refs[:3] if refs else "NINGUNA")
disco = sorted(os.path.basename(f) for f in glob.glob(os.path.join(REPO, "recursos", "actividades_*.js")))
print("EN_DISCO:", disco)
if refs:
    r = refs[-1]
    p = os.path.join(REPO, "recursos", r)
    print("REF_EXISTE:", os.path.exists(p))
    if os.path.exists(p):
        c = leer(p)
        print("REF_ID87:", bool(re.search(r"\bid\s*:\s*87\b", c)), "mojibake:", mojibake(c))
base = leer(os.path.join(REPO, "recursos", "actividades.js"))
print("BASE_ID87:", bool(re.search(r"\bid\s*:\s*87\b", base)), "mojibake:", mojibake(base))
