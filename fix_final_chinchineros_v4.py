# -*- coding: utf-8 -*-
# fix_final_chinchineros_v4.py  (ASCII puro + \\uXXXX, sin heredoc)
# PIPELINE FINAL AUTOCONTENIDO - una sola pasada:
#  [1] clon el_organillero_2026.html -> los_chinchineros_2026.html (reemplazos full)
#  [2] asegurar id 87 en recursos/actividades.js
#  [3] cachebust: elegir/en disco el actividades_*.js que tenga id 87,
#      si no existe crearlo (actividades_<ts14>_<h8>.js) y reemplazar la
#      referencia vieja en TODOS los *.html
#  [4/--local] imprime resumen; con arg "ftp" sube via subir_v18.py (ya con creds)
import ftplib, glob, hashlib, io, os, re, shutil, sys, time

REPO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"  # ruta real (git)
ORIG = os.path.join(REPO, "el_organillero_2026.html")
DEST = os.path.join(REPO, "los_chinchineros_2026.html")
REC  = os.path.join(REPO, "recursos")
ACT  = os.path.join(REC, "actividades.js")
SUBI = os.path.join(REPO, "subir_v18.py")

RE_CAC = re.compile(r"actividades_\d{14}_[0-9a-f]{8}\.js")
RE_MOJI = re.compile("[\u00c0-\u00c3][^\u0000-\u007f]")


def mojibake(s):
    return len(RE_MOJI.findall(s))


def leer(p, enc="utf-8"):
    with io.open(p, "r", encoding=enc) as f:
        return f.read()


def escribir(p, s, enc="utf-8"):
    with io.open(p, "w", encoding=enc, newline="") as f:
        f.write(s)


# ---------- [1] clon ----------
def paso1():
    t = leer(ORIG)
    pares = [
        ("El Organillero 2026", "Los Chinchineros 2026"),
        ("El Organillero", "Los Chinchineros"),
        ("ORGANILLERO", "CHINCHINERO"),
        ("Organillero", "Chinchinero"),
        ("organillero", "chinchinero"),
        ("el_organillero_2026.html", "los_chinchineros_2026.html"),
        ("public/El Organillero.webp", "public/LOS CHINCHINEROS.webp"),
        ("ranking_organillero.json", "ranking_chinchineros.json"),
        ("15 Septiembre 2026", "16 Septiembre 2026"),
    ]
    for a, b in pares:
        t = t.replace(a, b)
    if mojibake(t):
        raise SystemExit("[1] mojibake en clon - ABORTO")
    escribir(DEST, t)
    print("[1/4] clon OK %d B mojibake=0" % os.path.getsize(DEST))


# ---------- [2] id 87 ----------
def paso2():
    a = leer(ACT)
    if re.search(r"\bid\s*:\s*87\b", a):
        print("[2/4] id 87 ya presente")
        return
    # bloque nuevo en ASCII + \\uXXXX
    b = (
        "{\n"
        "  id: 87,\n"
        '  title: "Los Chinchineros 2026",\n'
        '  image: "public/LOS CHINCHINEROS.webp",\n'
        '  status: "EN VIVO",\n'
        "  description:\n"
        '    "Activaci\\u00f3n especial Los Chinchineros. Solo APRS con la frase CHINCHINERO a la '
        "estaci\\u00f3n CE4JWI-10. QSL conmemorativa autom\\u00e1tica y ranking en tiempo real.\",\n"
        '  date: "16 Septiembre 2026",\n'
        '  url: "los_chinchineros_2026.html",\n'
        "},\n"
    )
    b = b.replace("\\u00f3", "\u00f3").replace("\\u00e1", "\u00e1").replace("\\u00e9", "\u00e9")
    if mojibake(b):
        raise SystemExit("[2] mojibake en bloque - ABORTO")
    # insertar antes del cierre ]
    m = re.search(r"\n\s*\]\s*$", a, re.M)
    if not m:
        raise SystemExit("[2] no encuentro cierre ] en actividades.js")
    a2 = a[: m.start()] + "\n  " + b + "]" + a[m.end():]
    if mojibake(a2):
        raise SystemExit("[2] mojibake tras insertar - ABORTO")
    escribir(ACT, a2)
    print("[2/4] id 87 insertado, mojibake=0")


# ---------- [3] cachebust ----------
def paso3():
    a = leer(ACT)
    # cachebusts en disco
    viejos = sorted(glob.glob(os.path.join(REC, "actividades_*.js")))
    if not viejos:
        raise SystemExit("[3] no hay cachebust actividades_* en recursos/")
    # eligir UNO que ya tenga id 87
    elegido = None
    for p in viejos:
        if re.search(r"\bid\s*:\s*87\b", leer(p)):
            elegido = p
            break
    if elegido is None:
        # crear cachebust nuevo desde base
        ts = time.strftime("%Y%m%d%H%M%S")
        h8 = hashlib.sha256(a.encode("utf-8")).hexdigest()[:8]
        nuevo = "actividades_%s_%s.js" % (ts, h8)
        np = os.path.join(REC, nuevo)
        if not os.path.exists(np):
            shutil.copy2(ACT, np)
        elegido = np
    nuevo = os.path.basename(elegido)
    # referencia vieja en los html (la mas comun)
    ref_vieja = None
    for fn in os.listdir(REPO):
        if not fn.lower().endswith(".html"):
            continue
        h = leer(os.path.join(REPO, fn))
        for m in RE_CAC.finditer(h):
            ref_vieja = m.group(0)
            break
        if ref_vieja:
            break
    if not ref_vieja:
        raise SystemExit("[3] no encuentro ninguna referencia actividades_*.js en html")
    # reemplazar en todos
    cambiados = 0
    for fn in os.listdir(REPO):
        if not fn.lower().endswith(".html"):
            continue
        p = os.path.join(REPO, fn)
        h = leer(p)
        if ref_vieja != nuevo and ref_vieja in h:
            h2 = h.replace(ref_vieja, nuevo)
            if mojibake(h2):
                raise SystemExit("[3] mojibake al cachebustear %s - ABORTO" % fn)
            escribir(p, h2)
            cambiados += 1
    print("[3/4] cachebust %s -> %s  (html actualizados: %d)" % (ref_vieja, nuevo, cambiados))


# ---------- [4] ftp ----------
def paso4(modo):
    if modo != "ftp":
        print("[4/4] LISTO. Pasa 'ftp' como arg para subir con subir_v18.py")
        return
    # reutiliza subir_v18.py que ya tiene creds y sube html + cachebust?
    # subir_v18.py sube html raiz y algunos recursos fijos; mejor correrlo tal cual.
    print("[4/4] ejecutando subir_v18.py para FTP...")
    code = leer(SUBI)
    if mojibake(code):
        raise SystemExit("[4] mojibake en subir_v18.py - ABORTO")
    exec(compile(code, SUBI, "exec"))


def main():
    modo = sys.argv[1] if len(sys.argv) > 1 else "local"
    paso1()
    paso2()
    paso3()
    paso4(modo)
    # tambien subir el cachebust nuevo si no lo cubre subir_v18
    if modo == "ftp":
        # subir_v18.py solo sube raiz html + recursos fijos (actividades_<ts>* no).
        # Subimos ademas el cachebust nuevo via FTP explicito (necesario para que cargue).
        host = user = pwd = None
        m = re.search(r'HOST\s*=\s*"([^"]+)".*?USER\s*=\s*"([^"]+)".*?PASS\s*=\s*"([^"]+)"', leer(SUBI), re.S)
        if m:
            host, user, pwd = m.group(1), m.group(2), m.group(3)
        if host:
            import ftplib as ft
            for fn in glob.glob(os.path.join(REC, "actividades_*.js")):
                rel = os.path.relpath(fn, REPO).replace("\\", "/")
                if "recursos/" in "/" + rel:
                    ftp = ft.FTP(host, user, pwd)
                    ftp.set_pasv(True)
                    with open(fn, "rb") as fh:
                        ftp.storbinary("STOR " + rel, fh)
                    ftp.quit()
                    print("   FTP STOR", rel)
    print("FINAL_OK")


if __name__ == "__main__":
    main()
