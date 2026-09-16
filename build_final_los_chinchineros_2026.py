# -*- coding: utf-8 -*-
"""
CE4JWI - FINAL build "Los Chinchineros 2026" (id 87) - clon de el_organillero_2026.html.

Todo el texto no-ASCII que ESTE script aporta va como escapes \uXXXX (ASCII puro),
los acentos del cuerpo clonado se copian del HTML original sin retipearlos, y al
final se valida mojibake (regex del hook) en cada archivo escrito -> aborta si != 0.

Pasos (--local = solo disco; --ftp = ademas subir por FTP lo que cambio):
  [1] clon completo el_organillero_2026.html -> los_chinchineros_2026.html
  [2] id 87 en recursos/actividades.js
  [3] cachebust nuevo recursos/actividades_<ts>_<hash8>.js + referencias en todos los HTML
  [4] FTP (sube: pagina nueva + cachebust nuevo + todos los html que cambiaron)
"""
import ftplib
import glob
import hashlib
import io
import os
import re
import shutil
import sys
import time

REPO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
PAG_ORG = "el_organillero_2026.html"
PAG_DST = "los_chinchineros_2026.html"
JS_ACT = os.path.join(REPO, "recursos", "actividades.js")
RECURSOS = os.path.join(REPO, "recursos")

MOJIBAKE_RE = re.compile(r"\u00c3[^\u0000-\u007f]")  # misma regex del hook pre-commit


def leer(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()


def escribir(p, t):
    with io.open(p, "w", encoding="utf-8", newline="") as f:
        f.write(t)


def mojibake(t):
    return len(MOJIBAKE_RE.findall(t))


def ftp_creds():
    """Saca host/user/pass de las constantes reales en subir_v18.py (las que YA
    suben ranking_chinchineros.json). Nada hardcodeado en este script."""
    p = os.path.join(REPO, "subir_v18.py")
    t = leer(p)
    host = re.search(r'HOST\s*=\s*"([^"]+)"', t)
    user = re.search(r'USER\s*=\s*"([^"]+)"', t)
    pwd = re.search(r'PASS\s*=\s*"([^"]+)"', t)
    if not (host and user and pwd):
        raise SystemExit("no pude leer credenciales de subir_v18.py")
    return (host.group(1), user.group(1), pwd.group(1))


def main():
    modo = "ftp" if (len(sys.argv) > 1 and sys.argv[1] == "--ftp") else "local"

    # ---------------- [1] pagina ----------------
    t = leer(os.path.join(REPO, PAG_ORG))
    for a, b in [
        ("Los Chinchineros 2026", "Los Chinchineros 2026"),  # idempotente
        ("El Organillero 2026", "Los Chinchineros 2026"),
        ("El Organillero", "Los Chinchineros"),
        ("ORGANILLERO", "CHINCHINERO"),
        ("Organillero", "Chinchinero"),
        ("organillero", "chinchinero"),
        ("public/El Organillero.webp", "public/LOS CHINCHINEROS.webp"),
        ("ranking_organillero.json", "ranking_chinchineros.json"),
        ("15 Septiembre 2026", "16 Septiembre 2026"),
        ("el_organillero_2026.html", "los_chinchineros_2026.html"),
        ("activacion_aprs_organillero", "activacion_aprs_chinchinero"),
    ]:
        t = t.replace(a, b)
    n = mojibake(t)
    if n:
        raise SystemExit("mojibake=%d en pagina - ABORTO" % n)
    escribir(os.path.join(REPO, PAG_DST), t)
    print("[1/4] %s (%d B) mojibake=%d" % (PAG_DST, os.path.getsize(os.path.join(REPO, PAG_DST)), n))

    # ---------------- [2] id 87 ----------------
    a = leer(JS_ACT)
    if re.search(r"\bid\s*:\s*87\b", a):
        print("[2/4] id 87 ya presente")
    else:
        bloque = (
            "  {\n"
            "    id: 87,\n"
            '    title: "Los Chinchineros 2026",\n'
            '    image: "public/LOS CHINCHINEROS.webp",\n'
            '    status: "EN VIVO",\n'
            "    description:\n"
            '      "Activaci\u00f3n especial Los Chinchineros 2026. Solo APRS con la frase '
            "CHINCHINERO a la estaci\u00f3n CE4JWI-10. QSL conmemorativa autom\u00e1tica y "
            "ranking en tiempo real.\",\n"
            '    date: "16 Septiembre 2026",\n'
            '    url: "los_chinchineros_2026.html",\n'
            "  },\n"
        )
        # insertar antes del cierre "]"
        m = re.search(r",\n(\s*\]\s*)$", a, re.S)
        if not m:
            raise SystemExit("no encuentro el cierre ] en actividades.js")
        a2 = a[: m.start() + 1] + "\n" + bloque.rstrip(",\n") + ",\n" + a[m.start() + 1 :]
        n2 = mojibake(a2)
        if n2:
            raise SystemExit("mojibake=%d en actividades.js - ABORTO" % n2)
        escribir(JS_ACT, a2)
        print("[2/4] id 87 insertado (mojibake=0)")

    # ---------------- [3] cachebust ----------------
    a = leer(JS_ACT)
    viejos = sorted(
        f for f in os.listdir(RECURSOS)
        if re.match(r"^actividades_\d{14}_[0-9a-f]{8}\.js$", f)
    )
    if not viejos:
        raise SystemExit("sin cachebust actividades_*.js en recursos")
    viejo = viejos[-1]
    h8 = hashlib.sha256(a.encode("utf-8")).hexdigest()[:8]
    ts = time.strftime("%Y%m%d%H%M%S")
    nuevo = "actividades_%s_%s.js" % (ts, h8)
    if viejo == nuevo:
        raise SystemExit("el cachebust no cambio - algo mal")
    shutil.copy2(JS_ACT, os.path.join(RECURSOS, nuevo))
    print("[3/4] cachebust %s -> %s" % (viejo, nuevo))
    cambiados = 0
    for fn in os.listdir(REPO):
        if not fn.lower().endswith(".html"):
            continue
        p = os.path.join(REPO, fn)
        h = leer(p)
        if viejo in h:
            h2 = h.replace(viejo, nuevo)
            n3 = mojibake(h2)
            if n3:
                raise SystemExit("mojibake=%d al actualizar %s - ABORTO" % (n3, fn))
            escribir(p, h2)
            cambiados += 1
    print("      html actualizados al cachebust nuevo: %d" % cambiados)

    if modo == "local":
        print("MODO LOCAL: listo para revisar. Correr con --ftp para subir.")
        return

    # ---------------- [4] FTP ----------------
    host, user, pwd = ftp_creds()
    subir = [os.path.join(REPO, PAG_DST), os.path.join(RECURSOS, nuevo)]
    for fn in os.listdir(REPO):
        if fn.lower().endswith(".html"):
            subir.append(os.path.join(REPO, fn))
    ftp = ftplib.FTP(host)
    ftp.login(user, pwd)
    ftp.set_pasv(True)
    ok = 0
    errores = []
    for p in subir:
        rel = os.path.relpath(p, REPO).replace("\\", "/")
        try:
            with open(p, "rb") as fh:
                ftp.storbinary("STOR " + rel, fh)
            ok += 1
        except Exception as e:
            errores.append((rel, str(e)[:60]))
    ftp.quit()
    print("[4/4] FTP %s: OK=%d errores=%d" % (host, ok, len(errores)))
    for r, e in errores[:10]:
        print("   ERR %s -> %s" % (r, e))


if __name__ == "__main__":
    main()
