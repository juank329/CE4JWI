# -*- coding: utf-8 -*-
# sube_solo_banderas_bb.py  (ASCII puro)
# Sube por FTP SOLO el archivo banderas corregido (BB->CN) leyendo credenciales
# desde subir_v18.py sin exponerlas.  CWD-independiente.
import ftplib, io, os, re

REPO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
SUBI = os.path.join(REPO, "subir_v18.py")
DESTINO = os.path.join(REPO, "recursos", "banderas_20260915.js")

t = io.open(SUBI, "r", encoding="utf-8").read()
m = re.search(r'HOST\s*=\s*"([^"]+)"\s*;\s*USER\s*=\s*"([^"]+)"\s*;\s*PASS\s*=\s*"([^"]+)"', t)
if not m:
    raise SystemExit("no encuentro HOST/USER/PASS en subir_v18.py")
host, user, pwd = m.group(1), m.group(2), m.group(3)

if not os.path.exists(DESTINO):
    raise SystemExit("NO EXISTE: " + DESTINO)

ftp = ftplib.FTP(host)
ftp.login(user, pwd)
ftp.set_pasv(True)
rel = os.path.relpath(DESTINO, REPO).replace("\\", "/")
with open(DESTINO, "rb") as fh:
    ftp.storbinary("STOR " + rel, fh)
ftp.quit()
print("SUBIDO_OK=" + rel)
