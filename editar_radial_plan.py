# -*- coding: utf-8 -*-
# DIA NACIONAL DEL TRABAJADOR RADIAL 2026 (id 73): ranking SOLO APRS.
# Cambia la imagen a "CE4JWI-10 SOLO APRS.webp" y el texto a solo APRS
# con frase RADIO / ADIF. Default = plan (no publica).
# USO: python -X utf8 editar_radial_plan.py            (PLAN - no publica)
#      python -X utf8 editar_radial_plan.py publicar   (PUBLICA)
import io, os, re, hashlib, datetime, sys

RO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
RES = os.path.join(RO, "recursos")

def rt(p):
    return io.open(p, "r", encoding="utf-8").read()

def wt(p, s):
    io.open(p, "w", encoding="utf-8", newline="\n").write(s)

def nuevo_cachebust(texto):
    h = hashlib.sha256(texto.encode("utf-8")).hexdigest()[:8]
    d = datetime.date.today().strftime("%Y%m%d")
    return "actividades_%s_%s.js" % (d, h)

def main():
    publicar = "publicar" in sys.argv
    modo = "PUBLICAR" if publicar else "PLAN (no publica)"
    print("== EDICION RADIAL id73 -> SOLO APRS (modo: %s) ==" % modo)

    t = rt(os.path.join(RES, "actividades.js"))
    print("actividades.js: %d bytes | FFFD: %d" % (len(t.encode("utf-8")), t.count("\ufffd")))

    # imagen vieja en el bloque radial
    vieja = "public/dia nacional del trabajador radial 2026.webp"
    nueva = "public/CE4JWI-10 SOLO APRS.webp"
    n_img = t.count(vieja)
    print("imagen vieja (radial webp): %d ocurrencia(s)" % n_img)
    print("imagen nueva ya presente: %d" % t.count(nueva))

    # descripcion radial -> solo APRS con RADIO/ADIF
    viejo_txt = "Activaci\u00f3n especial por el D\u00eda Nacional del Trabajador Radial. Contacto por APRS (CQ RADIO) y DMR TG 73040 ADN Systems. QSL autom\u00e1tica."
    nuevo_txt = "Activaci\u00f3n especial por el D\u00eda Nacional del Trabajador Radial. Contacto SOLO por APRS (CQ RADIO / ADIF). QSL autom\u00e1tica."
    n_txt = t.count(viejo_txt)
    print("texto viejo (radial): %d ocurrencia(s)" % n_txt)

    diffs = t.count(vieja) + t.count(viejo_txt)
    if publicar and diffs:
        t2 = t.replace(vieja, nueva).replace(viejo_txt, nuevo_txt)
        wt(os.path.join(RES, "actividades.js"), t2)
        cb_new = nuevo_cachebust(t2)
        print(">>> PUBLICADO: actividades.js actualizado (FFFD final: %d)" % t2.count("\ufffd"))
        print(">>> proximo cachebust:", cb_new)
    else:
        print(">>> PLAN: cambios a realizar = imagen(%d) + texto(%d) [total %d]" %
              (n_img, n_txt, diffs))
        if not publicar:
            print(">>> Para publicar: python -X utf8 editar_radial_plan.py publicar")

    # imagen que usa la pagina html radial (referencia en public/ o en el html)
    html_radial = os.path.join(RO, "dia_nacional_del_trabajador_radial_2026.html")
    print("html radial existe:", os.path.exists(html_radial))
    if os.path.exists(html_radial):
        h = rt(html_radial)
        print("html FFFD:", h.count("\ufffd"))
        for m in re.finditer(r'["\']([^"\']*\.(?:webp|jpg|jpeg|png))["\']', h):
            print("  html vista: %s" % m.group(1))

    # existe la imagen SOLO APRS en public/?
    cand = os.path.join(RO, "public", "CE4JWI-10 SOLO APRS.webp")
    print("imagen SOLO APRS en public/: %s (%d bytes)" %
          (os.path.exists(cand), os.path.getsize(cand) if os.path.exists(cand) else 0))

if __name__ == "__main__":
    main()
