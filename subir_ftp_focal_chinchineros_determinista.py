# -*- coding: utf-8 -*-
# subir_ftp_focal_chinchineros_determinista.py  (ASCII + \\uXXXX, mojibake-guard)
# Sube al servidor FTP de CE4JWI exactamente lo que el index/paginas necesitan
# y que el batch anterior NO incluyo (imagenes .webp de public/ + el html corregido
# del DATO chinchinero + cachebust con id 87 + base actividades.js + ranking).
# Uso: python <script>          -> construye lista y muestra (sin subir)
#      python <script> ftp      -> ademas sube por FTP
import ftplib, io, os, re, sys

REPO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
CHIN = os.path.join(REPO, "los_chinchineros_2026.html")
CACH = os.path.join(REPO, "recursos", "actividades_20260916_8a9db2a5.js")
BASE = os.path.join(REPO, "recursos", "actividades.js")
RANK = os.path.join(REPO, "recursos", "ranking_chinchineros.json")
PUBL = os.path.join(REPO, "public")
SUBI = os.path.join(REPO, "subir_v18.py")

RE_MOJI = re.compile("[\u00c0-\u00c3][^\u0000-\u007f]")


def leer(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()


def comprobar():
    malos = []
    # [] texto del archivo central no debe tener mojibake
    if RE_MOJI.search(leer(CHIN)):
        malos.append("mojibake en %s" % os.path.basename(CHIN))
    # [] cachebust debe existir
    if not os.path.exists(CACH):
        malos.append("falta cachebust %s" % os.path.basename(CACH))
    # [] la imagen referenciada por la pagina debe existir y coincidir EXACTO
    t = leer(CHIN)
    m = re.search(r'src="([^"]+\.webp)"', t)
    if not m:
        malos.append("sin imagen webp en los_chinchineros_2026.html")
    else:
        src = m.group(1)
        archivo = os.path.basename(src)
        ruta_esperada = os.path.join(PUBL, archivo)
        if not os.path.exists(ruta_esperada):
            malos.append("la imagen %r no existe en public/ (falta o difiere el nombre)" % src)
    if malos:
        for x in malos:
            print("[!]", x)
        raise SystemExit("ABORTO por %d problema(s)" % len(malos))
    print("comprobaciones OK (mojibake=0, cachebust e imagen presentes)")


def lista_subida():
    piezas = [CHIN]
    # cachebust (el que apunta el index) + base + ranking, si existen
    for p in (CACH, BASE, RANK):
        if os.path.exists(p):
            piezas.append(p)
    # TODAS las imagenes public/*.webp (el batch anterior no las subio)
    for fn in sorted(os.listdir(PUBL)):
        if fn.lower().endswith(".webp"):
            piezas.append(os.path.join(PUBL, fn))
    return piezas


def creds():
    t = leer(SUBI)
    m = re.search(r'HOST\s*=\s*"([^"]+)";\s*USER\s*=\s*"([^"]+)";\s*PASS\s*=\s*"([^"]+)"', t)
    if not m:
        raise SystemExit("no encuentro HOST/USER/PASS en subir_v18.py")
    return m.group(1), m.group(2), m.group(3)


def ftp_subir(piezas):
    host, user, pwd = creds()
    ftp = ftplib.FTP(host)
    ftp.login(user, pwd)
    ftp.set_pasv(True)
    ok = 0
    fallos = []
    for p in piezas:
        rel = os.path.relpath(p, REPO).replace("\\", "/")
        try:
            with open(p, "rb") as f:
                ftp.storbinary("STOR " + rel, f)
            ok += 1
            print("   OK", rel)
        except Exception as e:
            fallos.append((rel, str(e)[:90]))
            print("   ERR", rel, "->", str(e)[:90])
    ftp.quit()
    print("FTP total=%d ok=%d fallos=%d" % (len(piezas), ok, len(fallos)))
    for r, e in fallos:
        print("   FALLO", r, e)
    return not fallos


def main():
    comprobar()
    piezas = lista_subida()
    print("piezas a subir: %d (incluye %d imagenes .webp de public/)" %
          (len(piezas), sum(1 for p in piezas if p.lower().endswith(".webp"))))
    if len(sys.argv) > 1 and sys.argv[1] == "ftp":
        ftp_subir(piezas)
    else:
        print("(sin subir; pasa 'ftp' como argumento)")


if __name__ == "__main__":
    main()
