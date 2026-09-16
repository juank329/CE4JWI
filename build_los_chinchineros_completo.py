# -*- coding: utf-8 -*-
# build_los_chinchineros_completo.py
# pipeline FINAL autocontenido, ASCII + jumps \uXXXX, sin heredoc, sin mojibake.
# [1] clon el_organillero_2026.html -> los_chinchineros_2026.html
# [2] insertar id 87 en recursos/actividades.js
# [3] cachebust nuevo actividades_<ts>_<h8>.js y reemplazo en TODOS los .html
# [4] FTP (credenciales leidas de subir_v18.py)
import ftplib, hashlib, io, os, re, shutil, sys, time

REPO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
REC = os.path.join(REPO, "recursos")
ACT = os.path.join(REC, "actividades.js")
ORIG = os.path.join(REPO, "el_organillero_2026.html")
DEST = os.path.join(REPO, "los_chinchineros_2026.html")
SUBI = os.path.join(REPO, "subir_v18.py")

RE_CACHE = re.compile(r"actividades_\d{14}_[0-9a-f]{8}\.js")
RE_MOJI = re.compile("[\u00c0-\u00c3][^\u0000-\u007f]")


def mojibake(s):
    return len(RE_MOJI.findall(s))


def leer(p, enc="utf-8"):
    with io.open(p, "r", encoding=enc) as f:
        return f.read()


def escribir(p, s, enc="utf-8"):
    with io.open(p, "w", encoding=enc, newline="") as f:
        f.write(s)


def creds_ftp():
    t = leer(SUBI)
    m = re.search(r'HOST\s*=\s*"([^"]+)";\s*USER\s*=\s*"([^"]+)";\s*PASS\s*=\s*"([^"]+)"', t)
    if not m:
        raise SystemExit("no encuentro HOST/USER/PASS en subir_v18.py")
    return m.group(1), m.group(2), m.group(3)


def main(modo):
    # ---------------- [1] clon ----------------
    t = leer(ORIG)
    reemplazos = [
        ("El Organillero 2026", "Los Chinchineros 2026"),
        ("El Organillero", "Los Chinchineros"),
        ("ORGANILLERO", "CHINCHINERO"),
        ("Organillero", "Chinchinero"),
        ("el_organillero_2026.html", "los_chinchineros_2026.html"),
        ("public/El Organillero.webp", "public/LOS CHINCHINEROS.webp"),
        ("ranking_organillero.json", "ranking_chinchineros.json"),
        ("15 Septiembre 2026", "16 Septiembre 2026"),
    ]
    for a, b in reemplazos:
        t = t.replace(a, b)
    if mojibake(t):
        raise SystemExit("[1] mojibake en clon - ABORTO")
    escribir(DEST, t)
    print("[1/4] clon OK %d B mojibake=0" % os.path.getsize(DEST))

    # ---------------- [2] id 87 ----------------
    a = leer(ACT)
    if re.search(r"\bid\s*:\s*87\b", a):
        print("[2/4] id 87 ya presente")
    else:
        bloque = (
            "{\n"
            "  id: 87,\n"
            '  title: "Los Chinchineros 2026",\n'
            '  image: "public/LOS CHINCHINEROS.webp",\n'
            '  status: "EN VIVO",\n'
            "  description:\n"
            '    "Activaci\u00f3n especial Los Chinchineros. Solo APRS con la frase CHINCHINERO a la estaci\u00f3n CE4JWI-10. QSL conmemorativa autom\u00e1tica y ranking en tiempo real.",\n'
            '  date: "16 Septiembre 2026",\n'
            '  url: "los_chinchineros_2026.html",\n'
            "},\n"
        )
        if mojibake(bloque):
            raise SystemExit("[2] mojibake en bloque - ABORTO")
        m = re.search(r"\n\s*\]\s*$", a, re.M)
        if not m:
            raise SystemExit("[2] no encuentro cierre ] en actividades.js")
        a2 = a[: m.start()] + "\n  " + bloque + "]" + a[m.end() :]
        if mojibake(a2):
            raise SystemExit("[2] mojibake tras insertar - ABORTO")
        escribir(ACT, a2)
        print("[2/4] id 87 insertado, mojibake=0")

    # ---------------- [3] cachebust ----------------
    a = leer(ACT)
    viejos = sorted(
        f
        for f in os.listdir(REC)
        if re.match(r"^actividades_\d{14}_[0-9a-f]{8}\.js$", f)
    )
    if not viejos:
        raise SystemExit("[3] no hay cachebust actividades_* en recursos/")
    viejo = viejos[-1]
    ts = time.strftime("%Y%m%d%H%M%S")
    h8 = hashlib.sha256(a.encode("utf-8")).hexdigest()[:8]
    nuevo = "actividades_%s_%s.js" % (ts, h8)
    if viejo == nuevo:
        raise SystemExit("[3] cachebust sin cambio - ABORTO")
    nuevo_path = os.path.join(REC, nuevo)
    if not os.path.exists(nuevo_path):
        shutil.copy2(ACT, nuevo_path)
    print("[3/4] cachebust %s -> %s" % (viejo, nuevo))
    cambiados = 0
    for fn in os.listdir(REPO):
        if not fn.lower().endswith(".html"):
            continue
        p = os.path.join(REPO, fn)
        h = leer(p)
        if viejo in h:
            h2 = h.replace(viejo, nuevo)
            if mojibake(h2):
                raise SystemExit("[3] mojibake cachebust %s - ABORTO" % fn)
            escribir(p, h2)
            cambiados += 1
    print("      html actualizados al cachebust nuevo: %d" % cambiados)

    if modo != "ftp":
        print("[4/4] LISTO (local). Ejecutar con 'ftp' como arg para subir.")
        return

    # ---------------- [4] FTP ----------------
    host, user, pwd = creds_ftp()
    archivos = [DEST, os.path.join(REC, nuevo)] + [
        os.path.join(REPO, fn) for fn in os.listdir(REPO) if fn.lower().endswith(".html")
    ]
    ftp = ftplib.FTP(host)
    ftp.login(user, pwd)
    ftp.set_pasv(True)
    ok, errores = 0, []
    for p in archivos:
        rel = os.path.relpath(p, REPO).replace("\\", "/")
        try:
            with open(p, "rb") as fh:
                ftp.storbinary("STOR " + rel, fh)
            ok += 1
        except Exception as e:
            errores.append((rel, str(e)[:60]))
    ftp.quit()
    print("[4/4] FTP %s: total=%d OK=%d errores=%d" % (host, len(archivos), ok, len(errores)))
    for r, e in errores[:10]:
        print("    ERR", r, "->", e)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "local")
