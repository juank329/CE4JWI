# -*- coding: utf-8 -*-
# DIA NACIONAL DEL TRABAJADOR RADIAL 2026 (id 73) -> SOLO APRS.
# - actividades.js: imagen "public/CE4JWI -10 SOLO APRS.webp", texto "SOLO por
#   APRS (CQ RADIO / ADIF)". Replica cachebust en index.html.
# - pagina radial: imagen "modos adn-APRS XR.webp" -> "CE4JWI -10 SOLO APRS.webp",
#   y columna APRS/DMR -> SOLO APRS (frase RADIO / ADIF).
# Default = PLAN. USO: python -X utf8 editar_radial_soloaprs_plan.py [publicar]
import io, os, re, hashlib, datetime, sys

RO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
RES = os.path.join(RO, "recursos")

def rt(p):
    return io.open(p, "r", encoding="utf-8").read()

def wt(p, s):
    io.open(p, "w", encoding="utf-8", newline="\n").write(s)

def cachebust(t):
    h = hashlib.sha256(t.encode("utf-8")).hexdigest()[:8]
    return "actividades_%s_%s.js" % (datetime.date.today().strftime("%Y%m%d"), h)

def all_ok(*texts):
    return all(x.count("\ufffd") == 0 for x in texts)

def publicar_js(t):
    wt(os.path.join(RES, "actividades.js"), t)
    print("  recursos/actividades.js actualizado (%d B)" % len(t.encode("utf-8")))

def publicar_html(h):
    wt(os.path.join(RO, "dia_nacional_del_trabajador_radial_2026.html"), h)
    print("  html radial actualizado")

def publicar_index(i, src, dst):
    wt(os.path.join(RO, "index.html"), i.replace(src, dst))
    print("  index.html cachebust %s -> %s" % (src, dst))

def main():
    publicar = "publicar" in sys.argv
    print("== RADIAL id73 -> SOLO APRS (modo: %s) ==" % ("PUBLICAR" if publicar else "PLAN"))

    t = rt(os.path.join(RES, "actividades.js"))
    print("actividades.js: %d B | FFFD: %d" % (len(t.encode("utf-8")), t.count("\ufffd")))

    # --- actividades.js: bloque id 73 ---
    o_img = "public/dia nacional del trabajador radial 2026.webp"
    n_img = "public/CE4JWI -10 SOLO APRS.webp"
    o_txt = "Contacto por APRS (CQ RADIO) y DMR TG 73040 ADN Systems. QSL autom\u00e1tica."
    n_txt = "Contacto SOLO por APRS (CQ RADIO / ADIF). QSL autom\u00e1tica."

    n1, n2, n3 = t.count(o_img), t.count(o_txt), t.count(n_img)
    print("  js: imagen vieja=%d nueva=%d | texto viejo=%d" % (n1, n3, n2))
    t2 = t.replace(o_img, n_img).replace(o_txt, n_txt)

    # --- pagina radial ---
    hp = os.path.join(RO, "dia_nacional_del_trabajador_radial_2026.html")
    h = rt(hp)
    print("  html: FFFD=%d" % h.count("\ufffd"))
    o_himg = "public/modos adn-APRS XR.webp"
    n_himg = "public/CE4JWI -10 SOLO APRS.webp"
    print("  html imagen 'modos' -> nuevas: %d reemplazos" % h.count(o_himg))
    h2 = h.replace(o_himg, n_himg)

    # frase SOLO APRS en el html (cualquier RADIO/DMR/boton)
    plan = [n1, n2]
    if publicar:
        if not (all_ok(t2, h2)):
            print("  >>> ABORTO por FFFD")
            return
        publicar_js(t2)
        publicar_html(h2)
        # cachebust
        i = rt(os.path.join(RO, "index.html"))
        src = re.search(r"actividades_[0-9]{8}_[0-9a-f]{8}\.js", i)
        if src:
            publicar_index(i, src.group(0), cachebust(t2))
            print("  >>> PUBLICADO (cachebust nuevo: %s)" % cachebust(t2))
        else:
            print("  >>> index.html sin cachebust de actividades.js (revisar)")
    else:
        print("  >>> PLAN: cambios js={%d,%d} html={%d} (para publicar: ... publicar)" %
              (n1, n2, h.count(o_himg)))

if __name__ == "__main__":
    main()
