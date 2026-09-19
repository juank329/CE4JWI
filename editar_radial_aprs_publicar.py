# -*- coding: utf-8 -*-
# EDITA la actividad radial 2026 -> SOLO APRS (imagen "CE4JWI -10 SOLO APRS.webp"),
# frase RADIO / ADIF, y la pagina/ranking a solo APRS. cachebust + archivo.
# USO: python -X utf8 editar_radial_aprs_publicar.py
import io, os, re, hashlib, datetime, subprocess, sys

RO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
RES = os.path.join(RO, "recursos")

def rt(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()

def wt(p, s):
    with io.open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(s)

def cachebust(texto):
    return "actividades_%s_%s.js" % (
        datetime.date.today().strftime("%Y%m%d"),
        hashlib.sha256(texto.encode("utf-8")).hexdigest()[:8])

def main():
    ap = os.path.join(RES, "actividades.js")
    t = rt(ap)
    print("leido actividades.js (%d B, FFFD %d)" % (len(t.encode("utf-8")), t.count("\ufffd")))

    # 1) bloque id 73 radial: imagen y descripcion
    iold_img = 'image: "public/dia nacional del trabajador radial 2026.webp"'
    inew_img = 'image: "public/CE4JWI -10 SOLO APRS.webp"'
    iold_txt = 'Activaci\u00f3n especial por el D\u00eda Nacional del Trabajador Radial. Contacto por APRS (CQ RADIO) y DMR TG 73040 ADN Systems. QSL autom\u00e1tica.'
    inew_txt = 'Activaci\u00f3n especial por el D\u00eda Nacional del Trabajador Radial. Contacto SOLO por APRS (CQ RADIO / ADIF). QSL autom\u00e1tica.'
    print("js imagen vieja: %d | nueva presente: %d | texto viejo: %d"
          % (t.count(iold_img), t.count(inew_img), t.count(iold_txt)))

    cambios = 0
    if t.count(iold_img):
        t = t.replace(iold_img, inew_img); cambios += 1
    if t.count(iold_txt):
        t = t.replace(iold_txt, inew_txt); cambios += 1
    print("actividades.js cambios aplicados: %d" % cambios)
    if cambios and t.count("\ufffd") == 0:
        wt(ap, t)
        print("actividades.js GUARDADO")

        # 2) cachebust en index.html
        ip = os.path.join(RO, "index.html")
        h = rt(ip)
        ncb = cachebust(t)
        print("nuevo cachebust:", ncb)
        h2, n = re.subn(r"actividades_\d{8}_[0-9a-f]{8}\.js", ncb, h)
        if n and h2.count("\ufffd") == 0:
            wt(ip, h2)
            print("index.html cachebust actualizado (%d)" % n)

    # 3) pagina radial: imagen modos -> SOLO APRS
    hp = os.path.join(RO, "dia_nacional_del_trabajador_radial_2026.html")
    if os.path.exists(hp):
        h = rt(hp)
        print("radial html FFFD: %d" % h.count("\ufffd"))
        a = 'public/modos adn-APRS XR.webp'
        b = 'public/CE4JWI -10 SOLO APRS.webp'
        n = h.count(a)
        if n:
            h2 = h.replace(a, b)
            h2 = h2.replace('Contacto por APRS (CQ RADIO) y DMR TG 73040 ADN Systems',
                            'Contacto SOLO por APRS (CQ RADIO / ADIF)')
            if h2.count("\ufffd") == 0:
                wt(hp, h2)
                print("radial html imagen modos->SOLO APRS (%d) + texto APRS-only" % n)

    print(">>> LISTO. FFFD en todos los archivos editados == 0.")

if __name__ == "__main__":
    main()
