# -*- coding: utf-8 -*-
# CAMBIA LAS PROXIMAS (status PRXIMAMENTE) -> CE4JWI-10 / SOLO APRS.
# - image "modos..." o "XR..." -> public/CE4JWI -10 SOLO APRS.webp
# - texto: XR4MAU(-10|-7) -> CE4JWI-10 ; quita DMR TG 73040 -> solo APRS
# - nuevo cachebust + re-apuntar TODOS los *.html
# USO: python -X utf8 cambiar_proximas_ce4jwi10_plan.py [plan|publicar]
import io, os, re, hashlib, datetime, sys

RO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
RES = os.path.join(RO, "recursos")

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
    print("== PROXIMAS -> CE4JWI-10 SOLO APRS [%s] ==" % ("PUBLICAR" if publicar else "PLAN"))

    t = rt(os.path.join(RES, "actividades.js"))
    print("actividades.js: %d B | FFFD: %d || antes de tocar: %s" % (
        len(t.encode("utf-8")), t.count("\ufffd"), cachebust(t)[-12:]))

    img_nueva = "public/CE4JWI -10 SOLO APRS.webp"
    img_viejas = ("modos", "XR", "MODOS", "XR4MAU", "modo")

    n_bloques = 0
    for m in re.finditer(r"\n  \{\n    id: (\d+),", t):
        i = m.start()
        j = t.find("},", i) + 2
        b = t[i:j]
        if "PR\xd3XIMAMENTE" not in b and "PR\u00d3XIMAMENTE" not in b and "PROXIMAMENTE" not in b:
            continue
        # solo tocar si usa imagen de modos/XR o menciona XR4MAU
        toca = ("XR4MAU" in b) or ("modos" in b.lower())
        if not toca:
            continue
        n_bloques += 1
        img = re.search(r'image:\s*"([^"]*)"', b)
        desc = re.search(r'description:\s*"([^"]*)"', b)
        print("\n  id %s [%s]" % (m.group(1),
              re.search(r'title:\s*"([^"]*)"', b).group(1)[:50]))
        print("    img ANTES : %s" % (img.group(1) if img else "-"))
        print("    img NUEVA : %s" % img_nueva)
        if desc:
            print("    desc ANTES: %s" % desc.group(1)[:140])
        # ejemplo de la nueva descripcion (sin XR4MAU ni DMR)
        nd = b
        nd = re.sub(r"XR4MAU(-10|-7)?", "CE4JWI-10", nd)
        nd = re.sub(r"y DMR[^\"'.]*?\.", ".", nd)
        nd = re.sub(r" DMR[^\"'.]*?\.", ".", nd)
        nd2 = re.search(r'description:\s*"([^"]*)"', nd)
        if nd2:
            print("    desc NUEVA: %s" % nd2.group(1)[:140])

    print("\n== bloques PROXIMAS a tocar: %d ==" % n_bloques)

    if not publicar:
        print("\n>>> PLAN: no se publica nada. Para publicar: ... publicar")
        return

    if n_bloques == 0:
        print(">>> NADA que cambiar (sin PROXIMAS con XR4MAU/modos).")
        return

    # Aplicar
    t2 = t
    def transf(b):
        img = re.search(r'image:\s*"([^"]*)"', b)
        nd = b
        if img and ("modos" in img.group(1).lower() or "XR" in img.group(1)):
            nd = nd.replace(img.group(1), img_nueva)
        nd = re.sub(r"XR4MAU(-10|-7)?", "CE4JWI-10", nd)
        nd = re.sub(r"y DMR[^\"'.]*?\.", ".", nd)
        nd = re.sub(r" DMR[^\"'.]*?\.", ".", nd)
        return nd

    # reconstruir por rangos de bloque preciso
    partes = []
    pos = 0
    for m in re.finditer(r"\n  \{\n    id: (\d+),", t):
        i = m.start()
        j = t.find("},", i) + 2
        b = t[i:j]
        if ("PR\xd3XIMAMENTE" in b or "PR\u00d3XIMAMENTE" in b or "PROXIMAMENTE" in b) and (
                "XR4MAU" in b or "modos" in b.lower()):
            b = transf(b)
        partes.append(t[pos:i])
        pos = j
    partes.append(t[pos:])
    t2 = "".join(partes)
    print("\nacividades.js tras transformar: FFFD=%d (%d B)"
          % (t2.count("\ufffd"), len(t2.encode("utf-8"))))
    if t2.count("\ufffd") > 0:
        print(">>> ABORTO: mojibake detectado. No se publica.")
        return

    # cachebust nuevo y guardar copia en recursos
    cb = cachebust(t2)
    wt(os.path.join(RES, cb), t2)
    wt(os.path.join(RES, "actividades.js"), t2)
    print(">>> cachebust nuevo: %s" % cb)

    # re-apuntar los *.html
    nhtml = 0
    for f in os.listdir(RO):
        if not f.lower().endswith(".html"):
            continue
        hp = os.path.join(RO, f)
        h = rt(hp)
        m = re.search(r"(actividades_\d{8}_[0-9a-f]{8}\.js)", h)
        if m and m.group(1) != cb:
            nhtml += 1
            h = h.replace(m.group(1), cb)
            wt(hp, h)
    print(">>> HTML re-apuntados: %d / (todas las paginas)" % nhtml)

    print("\n>>> LISTO (local + cachebust). Falta: FTP + git (subir_v18 / commit push).")

if __name__ == "__main__":
    main()
