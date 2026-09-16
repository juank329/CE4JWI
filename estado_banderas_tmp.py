# -*- coding: utf-8 -*-
# Estado real en disco, determinista, ASCII puro.
import io, os, re, glob

BASE = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"

def estado():
    rec = os.path.join(BASE, "recursos")
    nuevo = os.path.join(rec, "banderas_20260916.js")
    print("EXISTE_20260916=" + str(os.path.exists(nuevo)))
    if os.path.exists(nuevo):
        b = io.open(nuevo, encoding="utf-8").read()
        for p in ["\"7K\":\"JP\"", "\"HG\":\"HU\"", "\"JE\":\"JP\"", "\"LA\":\"NO\"", "\"OK\":\"CZ\"", "\"SP\":\"PL\"", "\"BB\":\"CN\""]:
            print("  CONTIENE " + p + "=" + str(p in b))

    hereda_nuevo = 0
    hereda_viejo = 0
    for h in glob.glob(os.path.join(BASE, "*.html")):
        t = io.open(h, encoding="utf-8").read()
        if "recursos/banderas_20260916.js" in t:
            hereda_nuevo += 1
        if "recursos/banderas_20260915.js" in t:
            hereda_viejo += 1
    print("HTML_APUNTAN_20260916=" + str(hereda_nuevo))
    print("HTML_APUNTAN_20260915=" + str(hereda_viejo))

if __name__ == "__main__":
    estado()
