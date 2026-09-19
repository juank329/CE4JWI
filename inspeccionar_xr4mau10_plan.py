# -*- coding: utf-8 -*-
# INSPECCION XR4MAU-10: estado en actividades.js, imagenes en public/, y su
# conexion con el bot de Telegram (solo lectura, no publica nada).
import io, os, re, glob, hashlib, datetime

RO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
RES = os.path.join(RO, "recursos")

def rt(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()

def main():
    t = rt(os.path.join(RES, "actividades.js"))
    print("actividades.js: %d B | FFFD: %d" % (len(t.encode("utf-8")), t.count("\ufffd")))

    print("\n== bloques que mencionan XR4MAU-10 / XR4MAU ==")
    n = 0
    for m in re.finditer(r'id:\s*(\d+),\s*title:\s*"([^"]*)"', t):
        i = m.start()
        b = t[i:i + 3000]
        if "XR4MAU" not in b:
            continue
        mm = re.search(r'(image:\s*"[^"]*")', b)
        ms = re.search(r'status:\s*"([^"]*)"', b)
        md = re.search(r'url:\s*"([^"]*)"', b)
        solo = "SOLO APRS" in b or "Solo APRS" in b or "solo por APRS" in b or "SOLO POR APRS" in b
        print("  id %-3s %-45s solo-aprs:%s %s" % (m.group(1), m.group(2)[:45], "SI" if solo else "-", ("img=%s" % mm.group(1)[8:50]) if mm else ""))
        n += 1
    print("  bloques XR4MAU: %d" % n)

    print("\n== imagenes xr4mau en public/ ==")
    for f in sorted(glob.glob(os.path.join(RO, "public", "*"))):
        nm = os.path.basename(f).lower()
        if "xr4mau" in nm or "apr" in nm:
            print("  %8d B  %s" % (os.path.getsize(f), os.path.basename(f)))
    # imagenes con "solo" y "-10"
    for f in sorted(glob.glob(os.path.join(RO, "public", "*"))):
        nm = os.path.basename(f)
        if "SOLO" in nm.upper():
            print("  [solo] %8d B  %s" % (os.path.getsize(f), nm))

    print("\n== paginas html xr4mau ==")
    for f in sorted(glob.glob(os.path.join(RO, "*.html"))):
        if "xr4mau" in os.path.basename(f).lower() or "4mau" in os.path.basename(f).lower():
            print("  %s" % os.path.basename(f))

    print("\n== bot de telegram / aprs: archivos python ==")
    for f in sorted(glob.glob(os.path.join(RO, "**", "*.py"), recursive=True)):
        nm = os.path.basename(f).lower()
        if any(k in nm for k in ("bot", "tele", "aprs", "tg", "xr4", "rank", "qsl")):
            try:
                c = rt(f)
            except Exception:
                continue
            tok = bool(re.search(r'[0-9]{6,9}:AA[A-Za-z0-9_-]{33}', c))
            chat = bool(re.search(r'-10{5,6}', c)) or "CHAT" in c.upper()
            xr = "XR4MAU" in c
            print("  %-38s %6d B FFFD:%d tg-token:%s xr4mau:%s" % (os.path.basename(f), os.path.getsize(f), c.count("\ufffd"), "S" if tok else "-", "S" if xr else "-"))

if __name__ == "__main__":
    main()
