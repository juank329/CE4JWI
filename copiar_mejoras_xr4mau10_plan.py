# -*- coding: utf-8 -*-
# COPIA LAS MEJORAS de CE4JWI-10 (ranking .json + envio telegram) a XR4MAU-10
# para la actividad Radial 2026 (id 73). Default = PLAN (no publica).
# USO: python -X utf8 copiar_mejoras_xr4mau10_plan.py publicar
import io, os, re, glob, hashlib, datetime, sys

RO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"

def rt(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()

def wt(p, s):
    with io.open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(s)

def main():
    publicar = "publicar" in sys.argv
    print("== COPIA MEJORAS CE4JWI-10 -> XR4MAU-10 (Radial id73) [%s] ==" %
          ("PUBLICAR" if publicar else "PLAN"))

    # 0) como publica hoy CE4JWI-10: ranking .json + telegram dentro del repo
    print("\n-- flujo actual que ya funciona (CE4JWI-10 / actividades finalizadas) --")
    for jf in sorted(glob.glob(os.path.join(RO, "ranking-data", "**", "final.json"), recursive=True)):
        nombre = os.path.dirname(os.path.relpath(jf, RO)).replace(os.sep, "/")
        print("  ranking-data/%s/final.json" % nombre)

    # 1) bloque id 73 en actividades.js (radial) con su config actual
    t = rt(os.path.join(RO, "recursos", "actividades.js"))
    print("\n-- actividades.js: bloque id 73 (radial) --")
    i = t.find("id: 73,")
    print(t[i:i + 800].replace("\n", "\n  "))

    # 2) html radial: como hara ranking (que archivo .json lee / llama)
    hp = os.path.join(RO, "dia_nacional_del_trabajador_radial_2026.html")
    h = rt(hp) if os.path.exists(hp) else ""
    print("\n-- html radial: marcadores de ranking/.json/telegram --")
    for kw in ("ranking", ".json", "frases", "XR4MAU", "SOLO APRS", "frase"):
        idx = h.find(kw)
        print("  %-9s @%d: %s" % (kw, idx, h[max(0, idx - 40):idx + 70].replace("\n", " ") if idx >= 0 else "-"))

    # 3) hay un ranking-data para radial? (para saber si hay que crear el twin)
    tiene_radial = os.path.exists(os.path.join(RO, "ranking-data", "trabajador-radial"))
    print("\n-- ranking-data/trabajador-radial existe: %s" % tiene_radial)

    # 4) si publica: cachebust + git (pasos finales)
    if publicar:
        print("\n>>> PUBLICAR: no implementado aun (solo diagnostico). Revision con --plan primero.")
    else:
        print("\n>>> PLAN: esto es lo que existe hoy. Para los pasos de edicion, dime que"
              "\n>>> archivo .json/telegram tocar (o digo como conectarlo igual que CE4JWI-10).")

if __name__ == "__main__":
    main()
