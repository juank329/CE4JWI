# -*- coding: utf-8 -*-
# cachebust_sobre_el_cualquier.py  (ASCII puro + \uXXXX)
# Reemplaza en TODOS los .html del repo cualquier
#   recursos/actividades_[A-Za-z0-9_\.]+\.js
# por el cachebust que YA existe en disco y YA contiene id 87:
#   recursos/actividades_20260916024526_8a9db2a5.js
# Con mojibake-guard en cada lect/escritura y lista de archivos cambiados.
import io, os, re, sys

REPO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
NUEVO = "actividades_20260916024526_8a9db2a5.js"
RE_REF = re.compile(r"recursos/actividades_[A-Za-z0-9_.]+\.js")
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
    n = len(REPO)
    cambiados = []
    for fn in os.listdir(REPO):
        if not fn.lower().endswith(".html"):
            continue
        p = os.path.join(REPO, fn)
        h = leer(p)
        if mojibake(h):
            raise SystemExit("[ABORTO] mojibake en lectura de " + fn)
        m = RE_REF.search(h)
        if not m:
            continue
        viejo = m.group(0)
        if viejo.endswith(NUEVO):
            continue
        h2 = h.replace(viejo, "recursos/" + NUEVO)
        if mojibake(h2):
            raise SystemExit("[ABORTO] mojibake tras reemplazo en " + fn)
        escribir(p, h2)
        cambiados.append((fn, viejo))
    print("HTML_CAMBIADOS=%d" % len(cambiados))
    for fn, v in cambiados:
        print("  ", fn, " <- ", v, " -> ", "recursos/" + NUEVO)


if __name__ == "__main__":
    main()
