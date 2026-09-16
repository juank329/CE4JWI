# -*- coding: utf-8 -*-
# sube_componentes_qrz_ok.py  (ASCII puro, CWD-independiente)
# Sube por FTP: recursos/componentes_20260918.js (QRZ form retirado) + TODOS los *.html.
# Credenciales leidas desde subir_v18.py sin exponerlas.
import ftplib, io, os, re, glob

REPO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
SUBI = os.path.join(REPO, "subir_v18.py")

t = io.open(SUBI, encoding="utf-8").read()
m = re.search(r'HOST\s*=\s*"([^"]+)"\s*;\s*USER\s*=\s*"([^"]+)"\s*;\s*PASS\s*=\s*"([^"]+)"', t)
if not m:
    raise SystemExit("no encuentro HOST/USER/PASS en subir_v18.py")
host, user, pwd = m.group(1), m.group(2), m.group(3)

nuevo = os.path.join(REPO, "recursos", "componentes_20260918.js")
if not os.path.exists(nuevo):
    raise SystemExit("NO EXISTE: " + nuevo)

archivos = [nuevo]
for h in sorted(glob.glob(os.path.join(REPO, "*.html"))):
    archivos.append(h)

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
        err.append((rel, str(e)[:80]))
ftp.quit()

print("TOTAL=" + str(len(archivos)) + " OK=" + str(ok) + " ERR=" + str(len(err)))
for r, e in err[:10]:
    print("   ERR " + r + " -> " + e)
