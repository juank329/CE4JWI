# -*- coding: ascii -*-
# PUBLICAR estado actual de actividades.js a la web:
# 1) genera cachebust nuevo a partir del hash del archivo
# 2) re-apunta TODOS los .html al cachebust nuevo
# 3) corre subir_v18.py (FTP)
# 4) git add/commit/pull --rebase/push
# NO toca datos de actividades.js, solo lo publica.
import io, os, re, sys, glob, hashlib, datetime, subprocess

RO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
RES = os.path.join(RO, "recursos")

def rt(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()

def wt(p, s):
    with io.open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(s)

def cachebust(t):
    h = hashlib.sha256(t.encode("utf-8")).hexdigest()[:8]
    return "actividades_%s_%s.js" % (datetime.date.today().strftime("%Y%m%d"), h)

def main():
    p = os.path.join(RES, "actividades.js")
    t = rt(p)
    print("== PUBLICAR estado actual [%s] ==" % ("PUBLICAR" if "publicar" in sys.argv else "PLAN"))
    print("actividades.js: %d B | FFFD: %d" % (len(t.encode("utf-8")), t.count("\ufffd")))
    if t.count("\ufffd") or t.count("\ufffd"):
        print(">>> MOJIBAKE: aborto.")
        return

    cb = cachebust(t)
    cb_p = os.path.join(RES, cb)
    ya = os.path.exists(cb_p)
    if not ya:
        wt(cb_p, t)
        print(">> cachebust nuevo: %s" % cb)
    else:
        print(">> cachebust ya existe (idem): %s" % cb)

    n = 0
    for f in glob.glob(os.path.join(RO, "*.html")):
        h = rt(f)
        m = re.search(r"actividades_\d{8}_[0-9a-f]{8}\.js", h)
        if m:
            if m.group(0) != cb:
                wt(f, h.replace(m.group(0), cb))
                n += 1
    print(">> HTML re-apuntados a %s: %d" % (cb, n))

    if "publicar" not in sys.argv:
        print(">>> PLAN: NO se publica. Repite con 'publicar'.")
        return

    ftp = os.path.join(RO, "subir_v18.py")
    if os.path.exists(ftp):
        r = subprocess.run([sys.executable, "-X", "utf8", ftp], cwd=RO,
                           capture_output=True, text=True, encoding="utf-8", errors="replace")
        print(">> FTP (ultimas lineas):\n" + (r.stdout[-1500:] if r.stdout else "") + (r.stderr[-800:] if r.stderr else ""))
    for cmd in (["git", "add", "-A"],
                ["git", "commit", "-m", "Publica CE4JWI-10 SOLO APRS (proximas)"],
                ["git", "pull", "--rebase"],
                ["git", "push"]):
        rp = subprocess.run(cmd, cwd=RO, capture_output=True, text=True,
                            encoding="utf-8", errors="replace")
        print(">> git %s: %s" % (cmd[1].upper(), rp.returncode))
        print((rp.stdout or rp.stderr).strip()[-400:])

if __name__ == "__main__":
    main()
