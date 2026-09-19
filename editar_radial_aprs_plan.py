# -*- coding: utf-8 -*-
# DIA NACIONAL DEL TRABAJADOR RADIAL 2026 (id 73): cambio a SOLO APRS.
# - Ranking (actividades.js id 73): imagen a "CE4JWI -10 SOLO APRS.webp",
#   solo APRS, frase "RADIO / ADIF" (ranking y pagina html).
# Default = PLAN. USO: python -X utf8 editar_radial_aprs_plan.py [publicar]
import io, os, re, hashlib, datetime, sys

RO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
RES = os.path.join(RO, "recursos")

def rt(p):
    return io.open(p, "r", encoding="utf-8").read()

def wt(p, s):
    io.open(p, "w", encoding="utf-8", newline="\n").write(s)

IMG_NUEVA = "public/CE4JWI -10 SOLO APRS.webp"
IMG_NUEVA_TRUE = os.path.join(RO, "public", "CE4JWI -10 SOLO APRS.webp")

def mostrar_bloque_ranking(t, bloque_id):
    i = t.find("id: %d," % bloque_id)
    if i < 0:
        print("  id %d NO encontrado" % bloque_id)
        return None
    j = t.find("},", i)
    blk = t[i:j + 2]
    print("  --- bloque id %d ---" % bloque_id)
    print(blk[:1400])
    return blk

def main():
    publicar = "publicar" in sys.argv
    print("== RADIAL id73 -> SOLO APRS (modo: %s) ==" % ("PUBLICAR" if publicar else "PLAN"))

    t = rt(os.path.join(RES, "actividades.js"))
    print("actividades.js: %d B | FFFD: %d" % (len(t.encode("utf-8")), t.count("\ufffd")))

    blk77 = mostrar_bloque_ranking(t, 73)

    # existencias de imagen
    print("imagen SOLO APRS en public/: %s (%d B)" %
          (os.path.exists(IMG_NUEVA_TRUE),
           os.path.getsize(IMG_NUEVA_TRUE) if os.path.exists(IMG_NUEVA_TRUE) else 0))

    # html radial
    h = os.path.join(RO, "dia_nacional_del_trabajador_radial_2026.html")
    ht = rt(h) if os.path.exists(h) else None
    print("html radial existe: %s | FFFD: %d" % (os.path.exists(h), ht.count("\ufffd") if ht else -1))
    if ht:
        for m in re.finditer(r'["\']([^"\']*\.(?:webp|png|jpg|jpeg))["\']', ht):
            print("  html imagen: %s" % m.group(1))
        for m in re.finditer(r'[^\n]*(RADIO|ADIF|ADN|APRS|DMR)[^\n]*', ht):
            linea = m.group(0).strip()
            if len(linea) < 160:
                print("  html> %s" % linea)

    # bloque ranking que referencia esta actividad (dicen 'src para el ranking')
    for m in re.finditer(r'(ranking:\s*\{[^}]*\})', t):
        b = m.group(1)
        if re.search(r'radial|RADIO|APRS', b):
            print("  ranking> %s" % b[:600])

if __name__ == "__main__":
    main()
