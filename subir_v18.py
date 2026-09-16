# -*- coding: utf-8 -*-
# Sube por FTP absolute paths: idioma_20260918.js (motor i18n v2 corregido)
# + TODOS los HTML + componentes_20260917.js. CWD-independiente.
import ftplib, io, os

HOST = "ftp.qsl.net"; USER = "ce4jwi"; PASS = "Sayayin@CE4JWI"
BASE = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"

files = []
idioma = os.path.join(BASE, "recursos", "idioma_20260918.js")
componentes = os.path.join(BASE, "recursos", "componentes_20260917.js")
if os.path.exists(idioma):
    files.append(idioma)
else:
    print("NO EXISTE idioma:", idioma)
if os.path.exists(componentes):
    files.append(componentes)
else:
    print("NO EXISTE componentes:", componentes)

for el in os.listdir(BASE):
    if el.lower().endswith(".html"):
        files.append(os.path.join(BASE, el))

individuales = []
for a in ["index.html", "404.html"]:
    p = os.path.join(BASE, a)
    if os.path.exists(p) and p not in files:
        files.append(p)

ftp = ftplib.FTP(HOST); ftp.login(USER, PASS); ftp.set_pasv(True)
ok = 0; err = []
for f in files:
    try:
        with open(f, "rb") as fh:
            data = fh.read()
        rel = os.path.relpath(f, BASE).replace("\\", "/")
        ftp.storbinary("STOR " + rel, io.BytesIO(data))
        ok += 1
    except Exception as e:
        err.append((os.path.basename(f), str(e)[:80]))
ftp.quit()
print("TOTAL", len(files), "OK", ok, "errores", len(err))
for e in err[:20]:
    print("ERR", e)
