# -*- coding: utf-8 -*-
# PLAN: cambia TODAS las actividades en PRÓXIMAMENTE/FINALIZADO-en-riesgo que
# apunten a XR4MAU o tengan imagen "modos" -> CE4JWI-10 SOLO APRS.
# - imagen "modos ..." -> public/CE4JWI -10 SOLO APRS.webp
# - estacion XR4MAU-10/-7/XR4MAU -> CE4JWI-10 (solo para bloques PRÓXIMAMENTE)
# - quita "y DMR TG 73040 ADN Systems" (solo APRS)
# NO PUBLICA por defecto. USO: python -X utf8 proposer_plan.py [publicar]
import io, os, re, hashlib, datetime, sys

RO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
RES = os.path.join(RO, "recursos")
PUB = os.path.join(RO, "public")

def rt(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()

def wt(p, s):
    with io.open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(s)

def cachebust(txt):
    h = hashlib.sha256(txt.encode("utf-8")).hexdigest()[:8]
    return "actividades_%s_%s.js" % (datetime.date.today().strftime("%Y%m%d"), h)

def main():
    publicar = "publicar" in sys.argv
    print("== PLAN: PROXIMAS -> CE4JWI-10 SOLO APRS (%s) ==" %
          ("PUBLICAR" if publicar else "SOLO PLAN"))

    t = rt(os.path.join(RES, "actividades.js"))
    print("actividades.js: %d B | FFFD: %d | cachebust ancien: %s" % (
        len(t.encode("utf-8")), t.count("\ufffd"),
        (re.search(r"actividades_\d{8}_[0-9a-f]{8}\.js", rt(os.path.join(RO, "index.html"))) or [None, "?"])[1]))

    # separar bloques
    bloques = t.count("\n  {\n    id:")
    print("bloques: %d" % bloques)

    NUEVA_IMG = "public/CE4JWI -10 SOLO APRS.webp"

    cambios = 0
    total_prox = 0
    for m in re.finditer(r"\n\s*\{\s*\n(\s*id:\s*\d+,)", t):
        i = m.start()
        j = t.find("},", i) + 2
        b = t[i:j]
        status = re.search(r'status:\s*"([^"]*)"', b)
        if not status:
            continue
        st = status.group(1)
        if st != "PRÓXIMAMENTE":
            continue
        total_prox += 1
        idm = re.search(r"id:\s*(\d+)", b).group(1)
        title = re.search(r'title:\s*"([^"]*)"', b)
        img = re.search(r'image:\s*"([^"]*)"', b)
        # es de los que hay que cambiar? (menciona XR4MAU, o imagen modos/XR)
        es_xr = "XR4MAU" in b or "XR4MAU-10" in b or "XR4MAU-7" in b
        es_modos = img and ("modos" in img.group(1).lower() or "XR" in img.group(1).upper())
        frase = re.search(r'CQ\s+([A-Z0-9À-ÿ]+)', b, re.I)
        marcado = es_xr or es_modos
        print("  id %-3s [%s] %-45s xr:%s modos:%s frase:%s" % (
            idm, st, (title.group(1)[:45] if title else "?"),
            ("S" if es_xr else "-"), ("S" if es_modos else "-"),
            (frase.group(1) if frase else "-")))
        if marcado:
            cambios += 1

    print("\nTotal PRÓXIMAMENTE: %d | a cambiar: %d" % (total_prox, cambios))
    if not publicar:
        print(">>> MODO PLAN: nada publicado. Revisa la lista y luego corre: ... publicar")
    else:
        print(">>> listo para publicar (este modo se activa con el flag)")

if __name__ == "__main__":
    main()
