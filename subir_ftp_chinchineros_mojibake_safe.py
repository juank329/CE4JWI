# -*- coding: utf-8 -*-
# subir_ftp_chinchineros_mojibake_safe.py  (ASCII + \uXXXX, CWD-independiente)
# Sube por FTP: recursos/actividades_20260916_8a9db2a5.js (cachebust con id 87)
#               + recursos/actividades.js (base)
#               + TODOS los *.html del repo real.
# Credenciales identicas a subir_v18.py (leidas de ese archivo, sin modificar).
import ftplib, io, os, re, sys

REPO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
RECU = os.path.join(REPO, "recursos")
SUBI = os.path.join(REPO, "subir_v18.py")

MOJI_RE = re.compile(r"actividades_[0-9a-f]{2}([^\\x00-\\x7f])")


def leer(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()


def creds():
    t = leer(SUBI)
    m = re.search(r'HOST\s*=\s*"([^"]+)";\s*USER\s*=\s*"([^"]+)";\s*PASS\s*=\s*"([^"]+)"', t)
    if not m:
        raise SystemExit("no encuentro HOST/USER/PASS en subir_v18.py")
    return m.group(1), m.group(2), m.group(3)


def ftp_subir():
    host, user, pwd = creds()
    archivos = []
    nuevo = os.path.join(RECU, "actividades_20260916_8a9db2a5.js")
    if not os.path.exists(nuevo):
        raise SystemExit("NO EXISTE cachebust nuevo: " + nuevo)
    archivos.append(nuevo)
    base = os.path.join(RECU, "actividades.js")
    if os.path.exists(base):
        archivos.append(base)
    for fn in os.listdir(REPO):
        if fn.lower().endswith(".html"):
            archivos.append(os.path.join(REPO, fn))

    ftp = ftplib.FTP(host)
    ftp.login(user, pwd)
    ftp.set_pasv(True)
    ok, err = 0, []
    for p in archivos:
        rel = os.path.relpath(p, REPO).replace("\\", "/")
        try:
            with open(p, "rb") as f:
                ftp.storbinary("STOR " + rel, f)
            ok += 1
        except Exception as e:
            err.append((rel, str(e)[:80]))
    ftp.quit()
    print("FTP total=%d OK=%d errores=%d" % (len(archivos), ok, len(err)))
    for r, e in err[:10]:
        print("   ERR", r, "->", e)


if __name__ == "__main__":
    ftp_subir()
