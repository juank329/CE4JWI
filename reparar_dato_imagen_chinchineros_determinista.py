# -*- coding: utf-8 -*-
# reparar_dato_imagen_chinchineros_determinista.py
# ASCII + \\uXXXX dentro de literales Python (el parser decodifica).
# Mojibake-guard en cada escritura. Modos: python <file>  (local, escribe disco)
#                                         python <file> ftp (local + sube por FTP)
import ftplib, hashlib, io, os, re, sys

REPO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
CHIN = os.path.join(REPO, "los_chinchineros_2026.html")
PUBL = os.path.join(REPO, "public")
SUBI = os.path.join(REPO, "subir_v18.py")

RE_MOJI = re.compile("[\u00c0-\u00c3][^\u0000-\u007f]")


def leer(p):
    return io.open(p, "r", encoding="utf-8").read()


def escribir(p, s):
    with io.open(p, "w", encoding="utf-8", newline="") as f:
        f.write(s)


def creds():
    t = leer(SUBI)
    m = re.search(r'HOST\s*=\s*"([^"]+)";\s*USER\s*=\s*"([^"]+)";\s*PASS\s*=\s*"([^"]+)"', t)
    if not m:
        raise SystemExit("no HOST/USER/PASS en subir_v18.py")
    return m.group(1), m.group(2), m.group(3)


# ---- [1] DATO chinchinero (puro, escritura via \uXXXX) ----
DATO_NUEVO = (
    "El chinchinero es uno de los personajes m\u00e1s queridos de la tradici\u00f3n popular"
    " chilena: cuelga a su espalda un gran bombo con platillos, el \"chin-chin\", y lo hace"
    " sonar con ritmo incansable para acompa\u00f1ar al organillero y alegrar calles, ferias"
    " y fondas. Es un s\u00edmbolo vivo del oficio callejero y la identidad de Chile."
)


def reparar_dato(t):
    m = re.search(r'<div class="nota">\s*<span class="etiqueta">DATO</span>\s*<p>.*?</p>', t, re.S)
    if not m:
        print("[1] bloque DATO no encontrado")
        return t, False
    nuevo = '<div class="nota">\n          <span class="etiqueta">DATO</span>\n          <p>%s</p>' % DATO_NUEVO
    return t[:m.start()] + nuevo + t[m.end():], True


def barrido_restos(t):
    hits = []
    for m in re.finditer(r"organill|Organill|ORGANILL|organillero", t):
        s = max(0, m.start() - 60)
        e = min(len(t), m.end() + 40)
        hits.append(t[s:e])
    # representar en \uXXXX para salida segura
    def esc(s):
        return "".join(ch if ord(ch) < 128 else "\\u%04X" % ord(ch) for ch in s)
    print("[2] restos organill* encontrados: %d" % len(hits))
    for h in hits[:8]:
        print("    ..." + esc(h) + "...")
    return hits


def imagen_ok(t):
    m = re.search(r'src="([^"]+\.webp)"', t)
    if not m:
        print("[3] sin img webp")
        return None
    src = m.group(1)
    archivo = os.path.basename(src)
    caminos = [f for f in os.listdir(PUBL) if f.lower().endswith(".webp")]
    exacto = archivo in caminos
    cand = [f for f in caminos if f.lower() == archivo.lower()]
    # si en disco es "CE4JWI -10 SOLO APRS.webp" (guion limpio) vs html con digito/signo,
    # reportamos; el fix del src se hace solo si hay candidato exacto-ignorecase UNICO.
    print("[3] src=%r  existe_local_exacto=%s  candidatos_ignorecase=%r" % (src, exacto, cand))
    return (src, exacto, cand)


def fix_src(t, info):
    if not info:
        return t, False
    src, exacto, cand = info
    if exacto:
        return t, False
    # si la solo difiere por causa de mojibake/tipografico, intentar uno unico
    if len(cand) == 1:
        nuevo_src = src[:-len(os.path.basename(src))] + cand[0]
        return t.replace(src, nuevo_src), True
    print("[3] sin candidato unico en public/ para %r -> no toco src" % src)
    return t, False


def ficha_webp_a_subir(info):
    if not info:
        return None
    src = info[0]
    archivo = os.path.basename(src)
    # preferir el nombre real en disco
    for f in os.listdir(PUBL):
        if f.lower() == archivo.lower():
            return os.path.join(PUBL, f)
    p = os.path.join(PUBL, archivo)
    return p if os.path.exists(p) else None


def main():
    t = leer(CHIN)
    if RE_MOJI.search(t):
        raise SystemExit("mojibake en CHIN antes de tocar - ABORTO")
    t2, d1 = reparar_dato(t)
    hits = barrido_restos(t2)
    if hits and not d1:
        # restos organill* presentes pero sin bloque DATO: no sobre-escribir a ciegas
        print("[1] WARN: hay restos organill* y no se pudo reemplazar el DATO")
    t3, d3 = fix_src(t2, imagen_ok(t2))
    if RE_MOJI.search(t3):
        raise SystemExit("mojibake tras reparar - ABORTO")
    escribir(CHIN, t3)
    print("[R] DATO reemplazado=%s src corregido=%s file=%d B mojibake=0" %
          (d1, d3, len(t3.encode("utf-8"))))

    if len(sys.argv) > 1 and sys.argv[1] == "ftp":
        host, user, pwd = creds()
        ftp = ftplib.FTP(host)
        ftp.login(user, pwd)
        ftp.set_pasv(True)
        subidos = []
        for p in [CHIN] + ([ficha_webp_a_subir(imagen_ok(t2))] if ficha_webp_a_subir(imagen_ok(t2)) else []):
            rel = os.path.relpath(p, REPO).replace("\\", "/")
            with open(p, "rb") as f:
                ftp.storbinary("STOR " + rel, f)
            subidos.append(rel)
        ftp.quit()
        print("[FTP] subidos: %s" % ", ".join(subidos))
    else:
        print("[FTP] (modo local; pasa argumento ftp para subir) LISTO LOCAL")


if __name__ == "__main__":
    main()
