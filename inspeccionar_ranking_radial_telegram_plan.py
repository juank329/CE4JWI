# -*- coding: utf-8 -*-
# INSPECCION: como el ranking radial 2026 se vuelca a .json y como se envia
# por Telegram (patron CE4JWI-10, que ya funciona). SOLO LECTURA.
import io, os, re, glob

RO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"

def rt(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()

def main():
    print("== 1) pagina radial: referencias a ranking / .json / telegram ==")
    h = rt(os.path.join(RO, "dia_nacional_del_trabajador_radial_2026.html"))
    print("  FFFD: %d" % h.count("\ufffd"))
    for kw in ("rank", ".json", "telegram", "XR4MAU", "CE4JWI-10", "frase", "frases"):
        i = h.lower().find(kw.lower())
        print("  %-8s @%6d -> %s" % (kw, i, h[max(0, i - 60):i + 110].replace("\n", " ") if i >= 0 else "-"))

    print("\n== 2) mismo bloque en actividades id: 73 (radial) ==")
    t = rt(os.path.join(RO, "recursos", "actividades.js"))
    j = t.find("id: 73,")
    print(t[j:j + 900])

    print("\n== 3) ranking .json ya existentes (patron CE4JWI-10 para comparar) ==")
    js = [f for f in glob.glob(os.path.join(RO, "**", "*.json"), recursive=True)]
    for f in js:
        try:
            s = rt(f)
            print("  %7d B  FFFD:%d  %s" % (len(s.encode("utf-8")), s.count("\ufffd"), os.path.relpath(f, RO)))
        except Exception:
            continue

    print("\n== 4) scripts py con envio telegram (sendMessage / token) ==")
    for f in glob.glob(os.path.join(RO, "**", "*.py"), recursive=True):
        try:
            c = rt(f)
        except Exception:
            continue
        sm = "sendMessage" in c
        tok = bool(re.search(r"[0-9]{6,9}:AA[A-Za-z0-9_-]{30,}", c))
        rank = "rank" in c.lower()
        if sm or tok or rank:
            print("  %-40s FFFD:%d sendMessage:%s token:%s rank:%s" % (
                os.path.relpath(f, RO), c.count("\ufffd"),
                ("S" if sm else "-"), ("S" if tok else "-"), ("S" if rank else "-")))

if __name__ == "__main__":
    main()
