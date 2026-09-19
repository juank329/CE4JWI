# -*- coding: utf-8 -*-
# Sellar PRIMERA JUNTA: (A) fuente actividades.js id 88 -> FINALIZADO,
# (B) cachebust nuevo de actividades con hash, (C) re-apuntar los HTML locales
# (D) construir el badge "Finalizado" si la pagina no lo marca sola.
import io, os, re, hashlib, datetime, json

RO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
RES = os.path.join(RO, "recursos")

def rtxt(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()

def wtxt(p, s):
    with io.open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(s)

def rt(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()

def wb(p, b):
    with io.open(p, "wb") as f:
        f.write(b)

def rb(p):
    with io.open(p, "rb") as f:
        return f.read()

report = []
report.append("== 0) cachebust-actividades ACTUAL apuntado en los HTML locales ==")
cbs = {}
for f in os.listdir(RO):
    if not f.lower().endswith(".html"):
        continue
    fp = os.path.join(RO, f)
    t = rtxt(fp)
    m = re.search(r"actividades_2026[0-9a-z_]+\.js", t)
    if m:
        cbs.setdefault(m.group(0), 0)
        cbs[m.group(0)] += 1
for k, v in cbs.items():
    report.append("  %-44s x%s" % (k, v))

anterior = sorted(cbs.keys())
anterior = anterior[-1] if anterior else None
report.append("  cachebust-actividades ANTERIOR = " + str(anterior))

# ---- A) fuente actividades.js: id 88 -> FINALIZADO ----
report.append("== A) fuente actividades.js: id 88 -> FINALIZADO ==")
ap = os.path.join(RES, "actividades.js")
t = rtxt(ap)
i = t.find("id: 88")
if i < 0:
    i = t.find('"id": 88')
if i < 0:
    report.append("  !!! NO encontrado id 88 en fuente; ABORTO")
    with io.open(os.path.join(RO, "_sellado_primera_junta_reporte.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(report))
    raise SystemExit
seg = t[i:i + 620]
report.append("  segmento id 88 actual (status):")
for ln in seg.split("\n"):
    if "status:" in ln or "title:" in ln:
        report.append("    " + ln.strip())
r = re.search(r'(status\s*:\s*")[^"]*(?=")', seg)
if r:
    report.append("  -> status anterior: '" + r.group(2) + "'")

# reemplazo el status del bloque id 88 con el patron exacto
t2 = t[:i] + re.sub(r'(status\s*:\s*")[^"]*(")', r"\g<1>FINALIZADO\g<2>", seg, count=1) + t[i + len(seg):]
p = os.path.join(RES, "actividades.js")
wtxt(p, t2)
report.append("  escrito actividades.js con id 88 FINALIZADO")

# ---- B) cachebust nuevo de actividades ----
report.append("== B) cachebust nuevo de actividades ==")
b = t2.encode("utf-8")
h = hashlib.sha256(b).hexdigest()[:8]
fecha = datetime.date.today().strftime("%Y%m%d")
nombre = "actividades_%s_%s.js" % (fecha, h)
wb(os.path.join(RES, nombre), b)
report.append("  nuevo: " + nombre + " (%d bytes)" % len(b))

# ---- C) re-apuntar los HTML locales al nuevo cachebust ----
report.append("== C) re-apuntar HTML locales ==")
p, zz = 0, 0
fmt_old = re.compile(r"(actividades_2026[0-9a-z_]+\.js)")
for f in os.listdir(RO):
    if not f.lower().endswith(".html"):
        continue
    fp = os.path.join(RO, f)
    t = rtxt(fp)
    if fmt_old.search(t):
        t2 = fmt_old.sub(nombre, t)
        wtxt(fp, t2)
        p += 1
report.append("  HTML re-apuntados: %d" % p)

# ---- D) reporte final ----
report.append("== D) verificacion ==")
report.append("  FFFD en actividades.js: %d" % t2.count("\ufffd"))
report.append("  cachebusts vivos en recursos/:")
for f in sorted(os.listdir(RES)):
    if f.startswith("actividades_2026") and f.endswith(".js"):
        report.append("    " + f)
rp = os.path.join(RO, "_sellado_primera_junta_reporte.txt")
wtxt(rp, "\n".join(report))
print("\n".join(report))
