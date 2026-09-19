# -*- coding: ascii -*-
# PROXIMAMENTE (XR4MAU/modos) -> CE4JWI-10 SOLO APRS, frase = UNA PALABRA
# sacada del NOMBRE de la actividad. NO toca FINALIZADO. NO publica en plan.
# USO: python -X utf8 proximas_ce4jwi10_frase_nombre_plan.py [publicar]
import io, os, re, sys

RO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
RES = os.path.join(RO, "recursos")

def rt(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()

def wt(p, s):
    with io.open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(s)

STOP = ("DIA", "DEL", "DE", "LA", "EL", "EN", "NACIONAL", "INTERNACIONAL",
        "MUNDIAL", "CHILENO", "CHILENA", "ESPECIAL", "ESCOLAR", "2026",
        "PROXIMAMENTE", "ACTIVACION", "POR", "X", "Y", "A", "LOS", "LAS")

def palabra_frase(nombre):
    # OJO: los títulos estan en MAYUSCULAS en el archivo.
    for p in re.findall(r"[A-Z\u00c0-\u017f]+", nombre):
        if p not in STOP:
            return p
    return "RADIO"

def main():
    publicar = "publicar" in sys.argv
    print("== PROXIMAMENTE -> CE4JWI-10 SOLO APRS | frase=1 palabra del nombre [%s] ==" %
          ("PUBLICAR" if publicar else "PLAN"))
    p = os.path.join(RES, "actividades.js")
    t = rt(p)
    print("actividades.js: %d B | FFFD: %d" % (len(t.encode("utf-8")), t.count("\ufffd")))
    if t.count("\ufffd"):
        print(">>> MOJIBAKE: aborto.")
        return

    # dividir por bloques
    bloq = []
    for i, m in enumerate(re.finditer(r"\{\s*\n\s*id:\s*\d+,", t)):
        fin = t.find("},", m.end()) + 2
        bloq.append((m.start(), fin))
    if not bloq:
        # formato alterno: "{ id: N,"
        for i, m in enumerate(re.finditer(r"\{\s*id:\s*\d+,", t)):
            fin = t.find("},", m.end()) + 2
            bloq.append((m.start(), fin))

    tocados = []
    for ini, fin in bloq:
        b = t[ini:fin]
        if '"PR' not in b or 'XIMAMENTE' not in b:
            continue
        # solo las que mencionan XR4MAU o modos
        if not re.search(r"XR4MAU|modos|[Mm]odos", b):
            continue
        m_id = re.search(r"id:\s*(\d+)", b)
        m_tit = re.search(r'title:\s*"([^"]*)"', b)
        m_img = re.search(r'image:\s*"([^"]*)"', b)
        if not m_tit:
            continue
        idn = m_id.group(1)
        tit = m_tit.group(1)
        img = m_img.group(1) if m_img else "-"
        frase = palabra_frase(tit)
        # imagen nueva
        img_n = "public/CE4JWI -10 SOLO APRS.webp"
        # frase actual (si la hay)
        m_fr = re.search(r"\(CQ\s+([A-Z\u00c0-\u017f0-9]+)\)", b)
        frase_act = m_fr.group(1) if m_fr else "-"
        tocados.append((idn, tit, img, img_n, frase_act, frase))

    print("\n-- PRÓXIMAMENTE XR4MAU/modos a tocar: %d --" % len(tocados))
    for idn, tit, img, img_n, fa, fn in tocados:
        print("  id %-4s %-42s frase'%s'->'%s'"
              % (idn, tit[:42], fa, fn))
        print("       img %s" % img[:58])
        print("       img -> %s" % img_n)

    if not tocados:
        print(">>> NADA (o formato distinto - revisar con otro script).")
        return
    if not publicar:
        print("\n>>> PLAN OK. Para publicar: python -X utf8 ... plan.py publicar")
        return

    # aplicar
    t2 = t
    for ini, fin, idn, tit, img, img_n, fa, fn in tocados:
        pass
    # (aplicacion con reemplazo por bloque)
    t2 = t
    aplicados = 0
    for ini, fin in reversed(bloq):
        b = t[ini:fin]
        b3 = b
        if '"PR' not in b or 'XIMAMENTE' not in b or not re.search(r"XR4MAU|modos", b):
            continue
        m_tit = re.search(r'title:\s*"([^"]*)"', b)
        m_img = re.search(r'image:\s*"([^"]*)"', b)
        if not m_tit:
            continue
        frase = palabra_frase(m_tit.group(1))
        if m_img and m_img.group(1).lower().count("modos"):
            b3 = b3.replace(m_img.group(1), "public/CE4JWI -10 SOLO APRS.webp")
        b3 = b3.replace("XR4MAU-10", "CE4JWI-10").replace("XR4MAU-7", "CE4JWI-10")
        b3 = b3.replace("XR4MAU", "CE4JWI-10")
        # frase: (CQ algo) -> (CQ FRASE)
        m_fr = re.search(r"\(\s*CQ\s+[A-Z\u00c0-\u017f0-9]+\s*\)", b3)
        if m_fr:
            b3 = b3.replace(m_fr.group(0), "(CQ %s)" % frase)
        # quitar DMR
        b3 = re.sub(r"\s*(y|,) DMR TG 73040 ADN Systems\.?", ".", b3, flags=re.I)
        b3 = re.sub(r"\s*y DMR TG 73040 ADN Systems(\.)?", ".", b3, flags=re.I)
        t2 = t2[:ini] + b3 + t2[fin:]
        aplicados += 1

    # cachebust + guardar
    import hashlib, datetime, glob
    cb_nuevo = cachebust_new(t2)
    wt(os.path.join(RES, "actividades.js"), t2)
    wt(os.path.join(RES, cb_nuevo), t2)
    print("\n>> cachebust: %s" % cb_nuevo)
    # re-apuntar HTML
    n_ok = 0
    for fhtml in glob.glob(os.path.join(RO, "*.html")):
        h = rt(fhtml)
        m = re.search(r"actividades_\d{8}_[0-9a-f]{8}\.js", h)
        if m and m.group(0) != cb_nuevo:
            h2 = h.replace(m.group(0), cb_nuevo)
            if h2.count("\ufffd") == 0:
                wt(fhtml, h2)
                n_ok += 1
    print(">> HTML re-apuntados: %d | FFFD total: %d" % (n_ok, t2.count("\ufffd")))
    print(">> bloques aplicados: %d" % aplicados)

    publicar_ftp_git(publicar)

def cachebust_new(txt):
    import hashlib, datetime
    h = hashlib.sha256(txt.encode("utf-8")).hexdigest()[:8]
    return "actividades_%s_%s.js" % (datetime.date.today().strftime("%Y%m%d"), h)

def publicar_ftp_git(publicar):
    if not publicar:
        return
    import subprocess, sys
    # FTP
    ftp = os.path.join(RO, "subir_v18.py")
    if os.path.exists(ftp):
        subprocess.run([sys.executable, "-X", "utf8", ftp], cwd=RO)
    # git
    for cmd in (["git", "add", "-A"],
                ["git", "commit", "-m", "PROXIMAS CE4JWI-10 SOLO APRS (frase del nombre)"],
                ["git", "pull", "--rebase"],
                ["git", "push"]):
        subprocess.run(cmd, cwd=RO)
    print(">> FTP + git hechos.")

if __name__ == "__main__":
    main()
