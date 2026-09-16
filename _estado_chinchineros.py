# -*- coding: utf-8 -*-
import io, os, re, glob, json

REPO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
def leer(p):
    return io.open(p, "r", encoding="utf-8").read()

def mojibake(t):
    return len(re.findall(r"\u00c3[^\u0000-\u007f]", t))

# 1) estado del clon
p = os.path.join(REPO, "los_chinchineros_2026.html")
if os.path.exists(p):
    t = leer(p)
    print("PAG  OK  %dB  mojibake=%d" % (os.path.getsize(p), mojibake(t)))
else:
    print("PAG  FALTA")
    raise SystemExit(2)

# 2) actividades.js: tiene id 87?
a = leer(os.path.join(REPO, "recursos", "actividades.js"))
r87 = re.search(r"id:\s*87", a)
print("ACT  id87=%s  mojibake=%d  len=%d" % (bool(r87), mojibake(a), len(a)))

# 3) cachebust actual en los HTML
vistos = set()
for fn in os.listdir(REPO):
    if not fn.lower().endswith(".html"):
        continue
    h = leer(os.path.join(REPO, fn))
    m = re.search(r"actividades_\d{14}_[0-9a-f]{8}\.js", h)
    if m:
        vistos.add(m.group(0))
print("CACHE " + ", ".join(sorted(vistos)))

# 4) creenciales FTP: leer el config del bot que ya sube ranking_chinchineros.json
for p in sorted(set(glob.glob(r"C:\Users\javen\Desktop\**\bot_aprs_ce4jwi10\config.json", recursive=True)) +
                 set(glob.glob(r"C:\Users\javen\OneDrive\**\bot_aprs_ce4jwi10\config.json", recursive=True))):
    try:
        c = json.loads(leer(p))
    except Exception:
        continue
    print("CFG  " + p)
    f = c.get("ftp", c.get("configuracion_ftp", {}))
    print("     host=%s user=%s pass=%s" % (f.get("host"), f.get("usuario", f.get("user")), f.get("clave", f.get("pass"))))
    break
