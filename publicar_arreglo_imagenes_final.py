# -*- coding: utf-8 -*-
"""Publica el arreglo de imagenes conmemorativas (ids 66,73,89[id89 respetado],90)
en actividades.js: regenera bundle cachebust, re-apunta TODOS los HTML, sube por
FTP (bundle + todos los HTML + index) y deja listo el commit. Imprime reporte final.
Ejecutar:  python -X utf8 publicar_arreglo_imagenes_final.py
"""
import io, os, re, glob, hashlib, datetime, ftplib

RO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
RES = os.path.join(RO, "recursos")
PUB = os.path.join(RO, "public")
SRC = os.path.join(RES, "actividades.js")

def rt(p):
    with io.open(p, encoding="utf-8") as f:
        return f.read()
def wt(p, s):
    with io.open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(s)

HOST, USER, PASS = "ftp.qsl.net", "ce4jwi", "Sayayin@CE4JWI"

def main():
    if not os.path.exists(SRC):
        print("FAIL ruta fuente"); return 1
    t = rt(SRC)
    print("FUENTE %d B | FFFD %d | id:90 %d | id:66 %d | id:73 %d | id:89 %d" % (
        len(t.encode("utf-8")), t.count("\ufffd"), t.count("id: 90"),
        t.count("id: 66"), t.count("id: 73"), t.count("id: 89")))

    fecha = datetime.date.today().strftime("%Y%m%d")
    nb = "actividades_%s_%s.js" % (
        fecha, hashlib.sha256(t.encode("utf-8")).hexdigest()[:8])
    nbp = os.path.join(RES, nb)
    bundle = t
    if not os.path.exists(nbp):
        wt(nbp, bundle)
        print("bundle nuevo: %s (%d B)" % (nb, len(bundle.encode("utf-8"))))
        bundle_changed = True
    else:
        print("bundle ya existente: %s" % nb)
        bundle_changed = False

    # re-apuntar HTML al nuevo bundle
    rep = 0
    for h in glob.glob(os.path.join(RO, "*.html")):
        try:
            hh = rt(h)
        except Exception:
            continue
        if "\ufffd" in hh:
            continue
        m = re.search(r"actividades_\d{8}_[0-9a-f]{8}\.js", hh)
        if not m:
            continue
        if m.group(0) == nb:
            continue
        wt(h, hh.replace(m.group(0), nb))
        rep += 1
    print("HTML re-apuntados: %d" % rep)

    # subir por FTP: bundle + todos HTML + index
    ftp = ftplib.FTP(HOST)
    ftp.login(USER, PASS)
    ftp.set_pasv(True)
    ok = 0; err = 0
    def subir(local, remoto, cwd):
        try:
            with io.open(local, "rb") as fh:
                ftp.storbinary("STOR " + remoto, fh)
            ok += 1
        except Exception as e:
            err += 1
    try:
        ftp.cwd("recursos")
        with io.open(nbp, "rb") as fh:
            ftp.storbinary("STOR " + nb, fh)
        ok += 1
        ftp.cwd("../")
        for h in glob.glob(os.path.join(RO, "*.html")):
            try:
                with io.open(h, "rb") as fh:
                    ftp.storbinary("STOR " + os.path.basename(h), fh)
                ok += 1
            except Exception:
                err += 1
    except Exception as e:
        print("FTP error:", e)
        err += 1
    finally:
        try:
            ftp.quit()
        except Exception:
            pass
    print("FTP subidos %d | errores %d" % (ok, err))
    print("LISTO. bundle=%s repetidos(servidor): revisar con git." % nb)
    return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())
