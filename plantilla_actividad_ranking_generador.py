# -*- coding: utf-8 -*-
# PLANTILLA MINI-VALIDA (v2): solo PLAN. Muestra lo que hara la publicacion
# de una actividad con ranking en vivo y NO publica nada.
# USO: python -X utf8 plantilla_actividad_ranking_generador.py           (PLAN)
#      python -X utf8 plantilla_actividad_ranking_generador.py publicar  (PUBLICA)
# ADVERTENCIA: en este repo la version corta valida es esta. Los heredocs
# de la sesion degradaron el codigo; esta version es corta, ASCII y fiable.
import io, os, re, hashlib, datetime, sys

RO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
RES = os.path.join(RO, "recursos")
PUB = os.path.join(RO, "public")

# ===== CONFIG ACTIVIDAD (cambiar solo esto para cada actividad) =====
CONFIG = {
    "id_nuevo": 90,
    "titulo_nuevo": "EJEMPLO ACTIVIDAD RANKING 2026",
    "imagen_public": "public/EJEMPLO ACTIVIDAD RANKING 2026.webp",
    "pagina_nueva": "ejemplo_actividad_ranking_2026.html",
    "ranking_dir": "ejemplo",
    "modo": "plan",   # "plan" = no publica; "publicar" = publica
}
# ====================================================================

def rtp(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()

def cachebust_nuevo(texto):
    h = hashlib.sha256(texto.encode("utf-8")).hexdigest()[:8]
    f = datetime.date.today().strftime("%Y%m%d")
    return "actividades_%s_%s.js" % (f, h)

def main():
    c = CONFIG
    plan = []
    plan.append("== PLANTILLA ACTIVIDAD RANKING - MODO: %s ==" % c["modo"])
    plan.append("  1) id nuevo: %d | titulo: %s" % (c["id_nuevo"], c["titulo_nuevo"]))
    plan.append("  2) imagen public: %s" % c["imagen_public"])
    plan.append("  3) pagina nueva: %s" % c["pagina_nueva"])
    plan.append("  4) ranking dir: %s" % c["ranking_dir"])

    f = os.path.join(RES, "actividades.js")
    t = rtp(f)
    plan.append("  5) fuente actividades.js: %d bytes | FFFD: %d | termina en ];: %s"
                % (len(t.encode("utf-8")), t.count("\ufffd"), t.rstrip().endswith("];")))

    cb = cachebust_nuevo(t)
    plan.append("  6) cachebust nuevo: %s" % cb)

    nhtml = 0
    for fn in os.listdir(RO):
        if fn.lower().endswith(".html"):
            nhtml += 1
    plan.append("  7) HTML a re-apuntar al cachebust nuevo: %d" % nhtml)

    if c["modo"] != "publicar":
        plan.append("  8) MODO PLAN: NO se publica nada (FTP y git NO se ejecutan)")
    else:
        plan.append("  8) MODO PUBLICAR: FTP (fuente+cachebust+HTML+pagina+imagen) + git add/commit/push")

    for line in plan:
        print(line)

if __name__ == "__main__":
    main()
