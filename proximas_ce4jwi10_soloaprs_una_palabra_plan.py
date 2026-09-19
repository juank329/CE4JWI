# -*- coding: utf-8 -*-
# PROXIMAS XR4MAU/modos -> CE4JWI-10 SOLO APRS. La frase (CQ X) = UNA palabra
# del TITULO de la actividad. SOLO toca status PR\u00d3XIMAMENTE (nunca final).
# USO: python -X utf8 proximas_ce4jwi10_soloaprs_una_palabra_plan.py [publicar]
import io, os, re, sys, glob, hashlib, datetime

RO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
RES = os.path.join(RO, "recursos")

def rt(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()

def wt(p, s):
    with io.open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(s)

IMG_NUEVA = "public/CE4JWI -10 SOLO APRS.webp"

def palabra_del_titulo(titulo):
    # UNA palabra del nombre: la 1a letra de la actividad (ej: RADIAL->RADIO)
    t = titulo.upper()
    for pal in re.findall(r"[A-Z\u00c0-\u017f0-9]+", t):
        p = pal
        if p in ("DIA", "DEL", "DE", "LA", "EL", "EN", "NACIONAL",
                 "MUNDIAL", "INTERNACIONAL", "CHILENO", "CHILENA", "2026",
                 "ESPECIAL", "POR", "D\u00cdA", "CE4JWI", "XR4MAU", "ADN",
                 "TG", "73040", "SOLO", "APRS", "Y", "A"):
            continue
        if p == "TRABAJADOR" or p == "RADIAL":
            return "RADIO"
        return p
    return "RADIO"

def main():
    publicar = "publicar" in sys.argv
    print("== PROXIMAS -> CE4JWI-10 SOLO APRS / frase-1-palabra [%s] ==" %
          ("PUBLICAR" if publicar else "PLAN"))

    p = os.path.join(RES, "actividades.js")
    t = rt(p)
    print("actividades.js: %d B | FFFD: %d" % (len(t.encode("utf-8")), t.count("\ufffd")))
    if t.count("\ufffd"):
        print(">>> ABORTO: mojibake. No se toca.")
        return

    # dividir en bloques { id: N, ... },
    bloques = []
    for m in re.finditer(r"\{\s*\n\s*id:\s*(\d+),", t):
        ini = m.start()
        fin = t.find("},", m.end()) + 2
        bloques.append((ini, fin, m.group(1)))

    a_tocar = []
    for ini, fin, idm in bloques:
        b = t[ini:fin]
        if "PR\xd3XIMAMENTE" not in b and "PROXIMAMENTE" not in b:
            continue
        if "FINALIZAD" in b or "FINALIZADO" in b:
            continue
        # solo las que involucran XR4MAU / modos / frase
        if not re.search(r"XR4MAU|modos|modo adn|modo adn", b, re.I):
            continue
        tit = re.search(r'title:\s*"([^"]*)"', b).group(1)
        img = re.search(r'image:\s*"([^"]*)"', b)
        frase_actual = ""
        mf = re.search(r"\((?:CQ|frase)\s+([A-Z\u00c0-\u017f0-9]+)\)", b, re.I) or \
             re.search(r"[Cc]ontacto por APRS \(([A-Z\u00c0-\u017f0-9]+)\)", b) or \
             re.search(r"CQ\s+(CQ|[A-Z\u00c0-\u017f0-9]+)", b)
        if mf:
            frase_actual = mf.group(1)
        nueva_palabra = palabra_del_titulo(tit)
        a_tocar.append((idm, tit, img.group(1) if img else "-", frase_actual, nueva_palabra))

    print("\nBloques PR\u00d3XIMAS a cambiar (XR4MAU/modos): %d" % len(a_tocar))
    for idm, tit, img, fa, npal in a_tocar:
        print("  id %-3s %-46s frase:%s -> %s" % (idm, tit[:46], fa or "-", npal))
        print("       img: %s -> %s" % (img[:60], IMG_NUEVA))

    if not a_tocar:
        print(">>> NADA que cambiar.")
        return
    if not publicar:
        print("\n>>> PLAN: NO se publica. Para publicar: ... publicar")
        return

    # aplicar
    t2 = t
    cambios = 0
    for ini, fin, idm in reversed(bloques):
        b = t[ini:fin]
        if "PR\xd3XIMAMENTE" not in b and "PROXIMAMENTE" not in b:
            continue
        if not re.search(r"XR4MAU|modos", b, re.I):
            continue
        b2 = b
        if re.search(r'image:\s*"[^"]*modos[^"]*"', b2, re.I) or \
           re.search(r'image:\s*"[^"]*XR[^"]*"', b2, re.I) or \
           re.search(r'image:\s*"[^"]*4MAU[^"]*"', b2, re.I):
            b2 = re.sub(r'image:\s*"[^"]*"', 'image: "%s"' % IMG_NUEVA, b2, count=1)
        b2 = re.sub(r"XR4MAU-10|XR4MAU-7|XR4MAU", "CE4JWI-10", b2)
        # frase actual -> UNA palabra del titulo
        tit = re.search(r'title:\s*"([^"]*)"', b2).group(1)
        npal = palabra_del_titulo(tit)
        def reemplaza_frase(m):
            frag = m.group(0)
            fra_in = m.group(1)
            return frag
        # quitar menciones DMR/ADN del texto
        b2 = re.sub(r"\s+y\s+DMR[^.]*\.", ".", b2, count=1)
        b2 = re.sub(r"\s+y\s+DMR[^.]*", "", b2, count=1)
        b2 = re.sub(r"\s*DMR[^.]*ADN Systems\.", ".", b2, count=1, flags=re.I)
        b2 = re.sub(r"\s+por\s+APRS[^)]*\)", " por APRS (SOLO APRS)", b2, count=1)
        # frase = (CQ <palabra>) con UNA sola palabra
        b2 = re.sub(r"CQ\s+([A-Z\u00c0-\u017f0-9]+)", "CQ %s" % npal, b2, count=5)
        b2 = re.sub(r"\(S[^\"]*SOLO[^\"]*\)", "(CQ %s)" % npal, b2, count=3)
        # asegurar SOLO APRS + imagen en descripcion
        b2 = re.sub(r'description:\s*"([^"]*)"',
                    lambda m: 'description: "%s. Solo APRS (SOLO APRS)."' % m.group(1).rstrip("."),
                    b2, count=1)
        if b2 == b:
            cambios += count
        t2 = t2[:ini] + b2 + t2[fin:]

    t2 = t2.replace("CQ CYJWI", "CQ %s" % (palabra_del_titulo("")))
    wt(p, t2)
    print("\nactividades.js ACTUALIZADO (%d B | FFFD: %d)" %
          (len(t2.encode("utf-8")), t2.count("\ufffd")))
    if t2.count("\ufffd"):
        print("!!! MOJIBAKE despues de guardar -> REVISAR, no subir")

if __name__ == "__main__":
    main()
