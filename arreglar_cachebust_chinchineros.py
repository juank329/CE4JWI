# -*- coding: utf-8 -*-
# arreglar_cachebust_chinchineros.py  (ASCII puro + \uXXXX, sin heredocs)
# [1] detecta cachebust que refiere index.html
# [2] cachebust NUEVO desde recursos/actividades.js (que ya tiene id 87)
#     con el MISMO esquema de nombre que ya se usa (actividades_<ts14>_<h8>.js)
# [3] reemplaza el viejo por el nuevo en TODOS los *.html
# [4] FTP (credenciales leidas de subir_v18.py)
import ftplib, hashlib, io, os, re, shutil, sys, time

REPO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
REC  = os.path.join(REPO, "recursos")
ACT  = os.path.join(REC, "actividades.js")
INDEX= os.path.join(REPO, "index.html")
RE   = re.compile(r"actividades_\d{14}_[0-9a-f]{8}\.js")
RE_M = re.compile("[\u00c0-\u00c3][^\u0000-\u007f]")


def leer(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()


def escribir(p, s):
    with io.open(p, "w", encoding="utf-8", newline="") as f:
        f.write(s)


def moji(s):
    return len(RE_M.findall(s))


def main():
    a = leer(ACT)
    if not re.search(r"\bid\s*:\s*87\b", a):
        raise SystemExit("actividades.js NO tiene id 87 - ABORTO")
    print("[1/4] id 87 OK en actividades.js, mojibake=%d" % moji(a))

    t = leer(INDEX)
    m = RE.search(t)
    if not m:
        raise SystemExit("no encuentro cachebust en index.html")
    viejo = m.group(0)
    print("[2/4] cachebust actual en HTML:", viejo)

    ts = time.strftime("%Y%m%d%H%M%S")
    h8 = hashlib.sha256(a.encode("utf-8")).hexdigest()[:8]
    nuevo = "actividades_%s_%s.js" % (ts, h8)
    np = os.path.join(REC, nuevo)
    if not os.path.exists(np):
        shutil.copy2(ACT, np)
    print("[3/4] cachebust nuevo:", nuevo, "(id 87 incluido)")

    camb = 0
    for fn in os.listdir(REPO):
        if not fn.lower().endswith(".html"):
            continue
        p = os.path.join(REPO, fn)
        h = leer(p)
        if viejo in h and viejo != nuevo:
            h2 = h.replace(viejo, nuevo)
            if moji(h2):
                raise SystemExit("mojibake en %s - ABORTO" % fn)
            escribir(p, h2)
            camb += 1
    print("[4/4] html actualizados: %d (mojibake=0)" % camb)
    if len(sys.argv) > 1 and sys.argv[1] == "ftp":
        subir_ftp([np] + [os.path.join(REPO, f) for f in os.listdir(REPO) if f.lower().endswith(".html")])
    else:
        print("      corre con 'ftp' para subir")


def subir_ftp(files):
    t = leer(os.path.join(REPO, "subir_v18.py"))
    m = re.search(r'HOST\s*=\s*"([^"]+)";\s*USER\s*=\s*"([^"]+)";\s*PASS\s*=\s*"([^"]+)"', t)
    if not m:
        raise SystemExit("no encuentro credenciales en subir_v18.py")
    host, user, pwd = m.group(1), m.group(2), m.group(3)
    ftp = ftplib.FTP(host)
    ftp.login(user, pwd)
    ftp.set_pasv(True)
    ok, err = 0, []
    for p in files:
        rel = os.path.relpath(p, REPO).replace("\\", "/")
        try:
            with open(p, "rb") as f:
                ftp.storbinary("STOR " + rel, f)
            ok += 1
        except Exception as e:
            err.append((rel, str(e)[:60]))
    ftp.quit()
    print("FTP: total=%d OK=%d errores=%d" % (len(files), ok, len(err)))
    for r, e in err[:10]:
        print("   ERR", r, e)


if __name__ == "__main__":
    main()
