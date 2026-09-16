# -*- coding: utf-8 -*-
# reparar_hero_organillo_chinchineros_determinista.py  (ASCII + \\uXXXX, guardas mojibake)
# Objetivo: quitar el ultimo resto "organillo" del parrafo hero (Sobre la Actividad)
# en los_chinchineros_2026.html, dejando SOLO la mencion legitima del DATO
# (el chinchinero acompa\u00f1a al organillero). Second-pass tras el fix del DATO.
# Modos: local  |  ftp
import ftplib, io, os, re, sys

REPO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
CHIN = os.path.join(REPO, "los_chinchineros_2026.html")
SUBI = os.path.join(REPO, "subir_v18.py")

RE_MOJI = re.compile("[\u00c0-\u00c3][^\u0000-\u007f]")


def leer(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()


def escribir(p, s):
    with io.open(p, "w", encoding="utf-8", newline="") as f:
        f.write(s)


def creds():
    t = leer(SUBI)
    m = re.search(r'HOST\s*=\s*"([^"]+)";\s*USER\s*=\s*"([^"]+)";\s*PASS\s*=\s*"([^"]+)"', t)
    if not m:
        raise SystemExit("no creds en subir_v18.py")
    return m.group(1), m.group(2), m.group(3)


# ---- texto hero nuevo (chinchinero real: gran bombo + platillos, sin organillo) ----
HERO = (
    "ese personaje callejero que carga a la espalda un gran bombo con platillos - el "
    "\"chin-chin\" - y lo hace sonar con la m\u00fasica y el ritmo incansable de sus baquetas "
    "para alegrar calles, ferias y fondas, acompa\u00f1ando siempre al organillero y "
    "recorriendo la tradici\u00f3n del pueblo chileno."
)


def main():
    t = leer(CHIN)
    if RE_MOJI.search(t):
        raise SystemExit("mojibake presente en CHIN - ABORTO")

    # hero actual: entre "celebra a <strong>Los Chinchineros</strong>" y "Participa con"
    # capturamos el tramo que aun dice "con la musica de su organillo y las melodias populares"
    viejo = re.search(
        r"(La estaci[o\u00f3]n\s*<strong>Los Chinchineros</strong>,\s*)"
        r"(.{10,240}?)(Participa)", t, re.S
    )
    if not viejo:
        raise SystemExit("no encuentro parrafo hero - ABORTO")
    medio_viejo = viejo.group(2)
    if "organill" not in medio_viejo.lower():
        print("[1] hero ya sin organillo: PE")
        nuevo = t
    else:
        nuevo = (
            t[: viejo.start(2)]
            + HERO
            + t[viejo.end(2):]
        )
    if RE_MOJI.search(nuevo):
        raise SystemExit("mojibake tras hero - ABORTO")

    # contar organill* tras el fix
    restos = re.findall(r"organill\w*", nuevo, re.I)
    if len(restos) > 1:
        print("[2] AUN quedan %d organill* (esperado 1 legitimo): %r" % (len(restos), restos))
        raise SystemExit("[2] no converge - necesita revisar")

    escribir(CHIN, nuevo)
    print("[3/3] hero chinchinero OK, organill* restantes=%d, file=%d B" % (len(restos), len(nuevo.encode("utf-8"))))

    if len(sys.argv) > 1 and sys.argv[1] == "ftp":
        host, user, pwd = creds()
        ftp = ftplib.FTP(host)
        ftp.login(user, pwd)
        ftp.set_pasv(True)
        rel = "los_chinchineros_2026.html"
        with open(CHIN, "rb") as f:
            ftp.storbinary("STOR " + rel, f)
        ftp.quit()
        print("[FTP] subido", rel)
    else:
        print("[FTP] (local; pasa 'ftp' para subir)")


if __name__ == "__main__":
    main()
