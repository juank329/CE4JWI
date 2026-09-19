# -*- coding: utf-8 -*-
# PROXIMAS SOLO APRS -> CE4JWI-10. La frase = UNA palabra tomada del NOMBRE
# de la actividad (escrita todo menos palabras vacias). NO toca FINALIZADO.
# Usage: python -X utf8 proximas_solo_aprs_frase_nombre_plan.py [publicar]
import io, os, re, sys, glob, hashlib, datetime, subprocess

RO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
RES = os.path.join(RO, "recursos")
IMG_NUEVA = "public/CE4JWI -10 SOLO APRS.webp"
VACIAS = set("DE DEL LA LAS EL EN Y A AL POR CON CQ DIA DÍA NACIONAL "
             "MUNDIAL INTERNACIONAL CHILENO CHILENA ESPECIAL 2026 ACTIVACION "
             "PRÓXIMAMENTE PROXIMAMENTE SOLO APRS".upper().split())

def rt(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()

def wt(p, s):
    with io.open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(s)

def una_palabra(nombre):
    for w in re.findall(r"[A-ZÁ-ÚÑ0-9]+", nombre.upper()):
        if w in VACIAS:
            continue
        return w.title() if False else w
    return "APRS"

def cachebust(t):
    h = hashlib.sha256(t.encode("utf-8")).hexdigest()[:8]
    return "actividades_%s_%s.js" % (datetime.date.today().strftime("%Y%m%d"), h)

def main():
    publicar = "publicar" in sys.argv
    print("== PROXIMAS -> CE4JWI-10 / SOLO APRS / frase=una palabra del nombre [%s] =="
          % ("PUBLICAR" if publicar else "PLAN"))

    p = os.path.join(RES, "actividades.js")
    t = rt(p)
    print("actividades.js: %d B | FFFD: %d" % (len(t.encode("utf-8")), t.count("\ufffd")))

    # dividir en bloques { id: N, ... }
    ini_ids = list(re.finditer(r"\{\s*\n?\s*id:\s*\d+,", t))
    if not ini_ids:
        print(">>> no pude dividir bloques; revisa formato")
        return
    bloques = []
    for i, m in enumerate(ini_ids):
        fin = t.find("},", m.end())
        fin = t.find("}", fin) + 1
        ini = m.start()
        bloques.append((ini, fin))
        if i and bloques[-2][1] > ini:
            bloques[-2] = (bloques[-2][0], ini - 1)
    # reajustar: cada bloque termina justo antes del siguiente id
    bloq = []
    for i, (ini, fin) in enumerate(bloques):
        j = bloques[i + 1][0] if i + 1 < len(bloques) else len(t)
        bloq.append((ini, j))

    tocados = []
    for ini, fin in bloq:
        b = t[ini:fin]
        if "PR\xd3XIMAMENTE" not in b and "PR\u00d3XIMAMENTE" not in b:
            continue
        if "XR4MAU" not in b and "modos" not in b.lower() and "XR" not in b:
            continue
        tit = re.search(r'title:\s*"([^"]*)"', b).group(1)
        frase = una_palabra(tit)
        img = re.search(r'image:\s*"([^"]*)"', b)
        img_ant = img.group(1) if img else "-"
        tocados.append((ini, fin, tit, frase, img_ant))

    print("\n-- PRÓXIMAS XR4MAU/modos a pasar a CE4JWI-10 SOLO APRS: %d --" % len(tocados))
    for ini, fin, tit, frase, img_ant in tocados:
        print("   %-48s frase:%s\n      img %s -> %s"
              % (tit[:48], frase, os.path.basename(img_ant), os.path.basename(IMG_NUEVA)))

    if not tocados:
        print(">>> NADA que tocar (sin XR4MAU/modos en PRÓXIMAS).")
        return
    if not publicar:
        print("\n>>> PLAN. Para publicar: ... publicar")
        return

    # aplicar en orden inverso
    t2 = t
    for ini, fin, tit, frase, img_ant in reversed(tocados):
        b = t[ini:fin]
        b2 = b
        # imagen
        mimg = re.search(r'image:\s*"([^"]*)"', b2)
        if mimg:
            b2 = b2.replace(mimg.group(1), IMG_NUEVA)
        # XR4MAU/XR -> CE4JWI-10
        b2 = re.sub(r"XR4MAU-10|XR4MAU-7|XR4MAU", "CE4JWI-10", b2)
        # quitar DMR / TG 73040 ADN
        b2 = re.sub(r" y DMR TG 73040 ADN Systems\.", ".", b2, flags=re.I)
        b2 = re.sub(r" DMR TG 73040 ADN Systems\.", ".", b2, flags=re.I)
        b2 = re.sub(r"\bDMR\b[^.]*\.", ".", b2)
        # frase: toda aparicion (CQ X...) -> (CQ FRASE)
        b2 = re.sub(r"\(CQ[^)]*\)", "(CQ %s)" % frase, b2)
        # imagen en description
        b2 = re.sub(r'image:\s*"public/[^"]*"', 'image: "%s"' % IMG_NUEVA, b2, count=1)
        if b2.count("\ufffd"):
            print(">>> MOJIBAKE: aborto sin publicar")
            return
        t2 = t2[:ini] + b2 + t2[fin:]

    wt(p, t2)
    print("\n>> actividades.js ACTUALIZADO (%d B | FFFD: %d)" % (len(t2.encode("utf-8")), t2.count("\ufffd")))

    cb = cachebust(t2)
    wt(os.path.join(RES, cb), t2)
    print(">> cachebust nuevo: %s" % cb)

    # re-apuntar HTML
    n = 0
    for f in glob.glob(os.path.join(RO, "*.html")):
        h = rt(f)
        m = re.search(r"actividades_\d{8}_[0-9a-f]{8}\.js", h)
        if m and m.group(0) != cb:
            h2 = h.replace(m.group(0), cb)
            if not h2.count("\ufffd"):
                wt(f, h2)
                n += 1
    print(">> HTML re-apuntados: %d" % n)

    print("\n>>> Falta: FTP + git (subir_v18 / git add/commit/push).")
    if os.path.exists(os.path.join(RO, "subir_v18.py")):
        r = subprocess.run([sys.executable, "-X", "utf8", "subir_v18.py"],
                           cwd=RO, capture_output=True, text=True, encoding="utf-8")
        print(r.stdout[-2000:])
    for cmd in (["git", "add", "-A"], ["git", "commit", "-m", "PROXIMAS SOLO APRS CE4JWI-10 frase del nombre"],
                ["git", "pull", "--rebase"], ["git", "push"]):
        subprocess.run(cmd, cwd=RO)

if __name__ == "__main__":
    main()
