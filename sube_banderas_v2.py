# -*- coding: utf-8 -*-
# sube_banderas_v2.py  (ASCII puro, sin mojibake)
# Sube por FTP el cachebust NUEVO de banderas + los HTML que lo referencian,
# leyendo credenciales desde subir_v18.py (patron de la casa, sin exponerlas).
import ftplib, glob, io, os, re

REPO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
SUBI = os.path.join(REPO, "subir_v18.py")


def creds():
    t = io.open(SUBI, encoding="utf-8").read()
    m = re.search(r'HOST\s*=\s*"([^"]+)"\s*;\s*USER\s*=\s*"([^"]+)"\s*;\s*PASS\s*=\s*"([^"]+)"', t)
    if not m:
        raise SystemExit("no HOST/USER/PASS en subir_v18.py")
    return m.group(1), m.group(2), m.group(3)


def main():
    nuevo = os.path.join(REPO, "recursos", "banderas_20260916.js")

    archivos = []
    if os.path.exists(nuevo):
        archivos.append(nuevo)
    else:
        print("OJO no existe:", nuevo)

    for h in glob.glob(os.path.join(REPO, "*.html")):
        t = io.open(h, encoding="utf-8").read()
        if "banderas_20260916.js" in t:
            archivos.append(h)

    host, user, pwd = creds()
    ftp = ftplib.FTP(host)
    ftp.login(user, pwd)
    ftp.set_pasv(True)

    ok = 0
    err = []
    for p in archivos:
        rel = os.path.relpath(p, REPO).replace("\\", "/")
        try:
            with open(p, "rb") as fh:
                ftp.storbinary("STOR " + rel, fh)
            ok += 1
        except Exception as e:
            err.append((rel, str(e)[:90]))
    ftp.quit()

    print("TOTAL=" + str(len(archivos)) + " OK=" + str(ok) + " ERR=" + str(len(err)))
    for r, e in err[:10]:
        print("ERR " + r + " -> " + e)


if __name__ == "__main__":
    main()
