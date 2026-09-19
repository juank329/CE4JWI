# -*- coding: utf-8 -*-
# PLAN: lista las actividades con status PR\u00d3XIMAMENTE que mencionen
# XR4MAU / modos / DMR para cambiarlas a CE4JWI-10 SOLO APRS con la frase
# RADIO/ADIF (imagen public/CE4JWI -10 SOLO APRS.webp ya existe).
# USO: python -X utf8 plan_proximas_ce4jwi10_plan.py [publicar]
import io, os, re, sys, glob, hashlib, datetime

RO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"

def rt(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()

def wt(p, s):
    with io.open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(s)

IMG = "public/CE4JWI -10 SOLO APRS.webp"

def main():
    publicar = "publicar" in sys.argv
    print("== PROXIMAS -> CE4JWI-10 SOLO APRS [%s] ==" % ("PUBLICAR" if publicar else "PLAN"))

    p = os.path.join(RO, "recursos", "actividades.js")
    t = rt(p)
    print("actividades.js: %d B | FFFD: %d" % (len(t.encode("utf-8")), t.count("\ufffd")))

    # dividir en bloques por { id: N,
    bloques = []
    for m in re.finditer(r"\{\s*\n\s*id:\s*(\d+),", t):
        ini = m.start()
        fin = t.find("},", m.end()) + 2
        bloques.append((ini, fin, m.group(1)))

    tocados = []
    for ini, fin, idm in bloques:
        b = t[ini:fin]
        if '"PR\u00d3XIMAMENTE"' not in b and '"PR\xd3XIMAMENTE"' not in b:
            continue
        # solo los que mencionan XR4MAU / modos / DMR (los "modos" de la radial)
        if not re.search(r"XR4MAU|modos|DMR|ADN Systems|ADN Systems", b, re.I):
            continue
        tit = re.search(r'title:\s*"([^"]*)"', b).group(1)
        img = re.search(r'image:\s*"([^"]*)"', b)
        frase = ""
        mf = re.search(r"(CQ [A-Z\u00c0-\u017f]+)", b, re.I)
        if mf:
            frase = mf.group(1)
        tocados.append((idm, tit[:45], img.group(1)[:60] if img else "-", frase))

    print("\nPR\u00d3XIMAMENTE con XR4MAU/modos/DMR: %d" % len(tocados))
    for idm, tit, img, frase in tocados:
        print("  id %-4s %-46s img=%s frase=%s" % (idm, tit, img or "-", frase))

    if not tocados:
        print(">>> NADA que cambiar.")
        return

    if not publicar:
        print("\n>>> PLAN. Para publicar: ... publicar")
        return

    # aplicar
    t2 = t
    for ini, fin, idm in reversed(bloques):
        b = t[ini:fin]
        if '"PR\u00d3XIMAMENTE"' not in b and '"PR\xd3XIMAMENTE"' not in b:
            continue
        if not re.search(r"XR4MAU|modos|DMR|DMR", b, re.I):
            continue
        b2 = b
        # imagen -> CE4JWI -10 SOLO APRS.webp
        b2 = re.sub(r'image:\s*"[^"]*"', 'image: "%s"' % IMG, b2, count=1)
        # XR4MAU-10 / XR4MAU-7 -> CE4JWI-10 (solo en frase/descripcion)
        b2 = re.sub(r"XR4MAU-10", "CE4JWI-10", b2)
        b2 = re.sub(r"XR4MAU-7", "CE4JWI-10", b2)
        # quitar menciones DMR / ADN Systems
        b2 = re.sub(r"\s+y\s+DMR TG 73040 ADN Systems\.", ".", b2, flags=re.I)
        b2 = re.sub(r" DMR TG 73040 ADN Systems\.", ".", b2, flags=re.I)
        t2 = t2[:ini] + b2 + t2[fin:]

    if t2.count("\ufffd"):
        print(">>> ABORTO: mojibake. No publico.")
        return

    wt(p, t2)
    print("actividades.js actualizado (%d B)" % len(t2.encode("utf-8")))

    # cachebust + reapuntar HTML
    h = hashlib.sha256(t2.encode("utf-8")).hexdigest()[:8]
    d = datetime.date.today().strftime("%Y%m%d")
    cb = "actividades_%s_%s.js" % (d, h)
    wt(os.path.join(RO, "recursos", cb), t2)
    print("cachebust nuevo: %s" % cb)

    nhtml = 0
    for f in glob.glob(os.path.join(RO, "*.html")):
        hx = rt(f)
        m = re.search(r"actividades_\d{8}_[0-9a-f]{8}\.js", hx)
        if m and m.group(0) != cb:
            hx2 = hx.replace(m.group(0), cb)
            if not hx2.count("\ufffd"):
                wt(f, hx2)
                nhtml += 1
    print("HTML re-apuntados: %d" % nhtml)

    print("\n>>> LISTO local. Falta: FTP (subir_v18.py) + git commit/push.")

if __name__ == "__main__":
    main()
