# -*- coding: utf-8 -*-
"""Cierra el arreglo: desde la fuente YA corregida (ids 66/73/90 conmemorativas, 89 intacto)
regenera el bundle cachebust, re-apunta los HTML y hace commit+push.
Sin FTP (ya subido y verificado)."""
import io, os, re, glob, hashlib, datetime, subprocess

RO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
RES = os.path.join(RO, "recursos")
SRC = os.path.join(RES, "actividades.js")

def rt(p):
    with io.open(p, encoding="utf-8") as f:
        return f.read()
def wt(p, s):
    with io.open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(s)

def sha(s):
    return hashlib.sha256(s.encode("utf-8")).hexdigest()[:8]

def nbundle(t):
    return "actividades_%s_%s.js" % (datetime.date.today().strftime("%Y%m%d"), sha(t))

t = rt(SRC)
print("FUENTE %d B | FFFD %d | id:90 %d | id:66 %d | id:73 %d | id:89 %d" % (
    len(t.encode("utf-8")), t.count("\ufffd"), t.count("id: 90"),
    t.count("id: 66"), t.count("id: 73"), t.count("id: 89")))

def img(id_):
    m = re.search(r"\{\s*id:\s*%d\b.*?image:\s*\"([^\"]+)\"" % id_, t, re.S)
    return m.group(1) if m else None

for i in (66, 73, 89, 90):
    im = img(i)
    print("   id:%2d  image=%-46s | conmem=%s" % (
        i, im, (im or "").lower().count("magallanes") or ("PROVINCIA DE TALCA" in (im or "").upper()) or ("RADIAL" in (im or "").upper()) or ("SOLO APRS" in (im or "").upper())))

nb = nbundle(t)
bp = os.path.join(RES, nb)
if not os.path.exists(bp):
    wt(bp, t)
    print("NUEVO bundle: %s (%d B)" % (nb, len(t.encode("utf-8"))))
else:
    print("bundle YA existe: %s (sin cambios de contenido)" % nb)

# re-apuntar HTML
camb = 0
for h in glob.glob(os.path.join(RO, "*.html")):
    hh = rt(h)
    m = re.search(r"actividades_[0-9]{8}_[0-9a-f]{8}\.js", hh)
    if not m or m.group(0) == nb or "\ufffd" in hh:
        continue
    wt(h, hh.replace(m.group(0), nb))
    camb += 1
print("HTML re-apuntados: %d" % camb)

# git
print("---- git ----")
for c in ["git add -A"]:
    subprocess.call(c, shell=True, cwd=RO)
r = subprocess.run(["git", "-c", "core.autocrlf=false", "commit", "-q", "-m",
    "Imagenes conmemorativas en tarjetas activas: Talca(66), Radial(73), Magallanes(90) - deja Ejercito(89) FINALIZADO intacto"],
    cwd=RO, capture_output=True)
print("commit:", r.returncode)
for c in ["git pull --rebase --autostash", "git push"]:
    r = subprocess.run(c, cwd=RO, shell=True, capture_output=True)
    out = r.stdout.decode("utf-8", "replace").strip().splitlines()
    print(("  $ %s" % c))
    for l in out[-3:]:
        print("   ", l)
