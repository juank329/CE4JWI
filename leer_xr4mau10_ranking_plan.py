# -*- coding: utf-8 -*-
# LEE (plan, no publica): como estan conectados hoy el ranking .json y el
# envio Telegram para XR4MAU-10 / radial id73, y el patron CE4JWI-10.
# USO: python -X utf8 leer_xr4mau10_ranking_plan.py
import io, os, re, glob

RO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"

def rt(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()

def main():
    print("== 0) bloque id73 radial en actividades.js ==")
    t = rt(os.path.join(RO, "recursos", "actividades.js"))
    i = t.find("id: 73,")
    print(t[i:i + 650].replace("\n", "\n   "))

    print("\n== 1) html radial: como referencia el ranking (.json / frase / telegram) ==")
    hp = os.path.join(RO, "dia_nacional_del_trabajador_radial_2026.html")
    h = rt(hp) if os.path.exists(hp) else ""
    print("html FFFD: %d" % h.count("\ufffd"))
    for kw in ("ranking", ".json", "ranking-data", "telegram", "XR4MAU", "frase"):
        k = h.find(kw)
        print("   %-12s @%6d -> %s" % (kw, k, (h[max(0, k - 50):k + 120]).replace("\n", " ") if k >= 0 else "-"))

    print("\n== 2) bot telegram: archivos py con token / sendMessage / ranking-data ==")
    for f in sorted(glob.glob(os.path.join(RO, "**", "*.py"), recursive=True)):
        try:
            c = rt(f)
        except Exception:
            continue
        tok = bool(re.search(r"[0-9]{6,9}:AA[A-Za-z0-9_-]{30,}", c))
        sm = "sendMessage" in c
        rd = "ranking-data" in c or "final.json" in c
        tea = "CE4JWI-10" in c or "XR4MAU-10" in c
        if tok or sm or rd or tea:
            print("   %-44s FFFD:%d token:%s send:%s rankingjson:%s estaciones:%s"
                  % (os.path.basename(f), c.count("\ufffd"),
                     "S" if tok else "-", "S" if sm else "-",
                     "S" if rd else "-", "S" if tea else "-"))

    print("\n== 3) git estado (si hay bot externo el token no esta aca) ==")
    import subprocess
    try:
        o = subprocess.run(["git", "log", "--oneline", "-3"],
                           cwd=RO, capture_output=True, text=True).stdout
        print(o)
    except Exception as e:
        print("   err git:", e)

if __name__ == "__main__":
    main()
