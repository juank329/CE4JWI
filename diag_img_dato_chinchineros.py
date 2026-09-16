# -*- coding: utf-8 -*-
# diag_img_dato_chinchineros.py  (ASCII + \\uXXXX, guarda de mojibake)
# Objetivo: diagnosticar dos quejas
#   [A] falta la imagen principal en los_chinchineros_2026.html
#   [B] el bloque DATO describe la actividad ANTERIOR (organillero)
# Salida: hechos ASCII puros, sin escribir nada todavia.
import io, os, re

REPO = r"C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI"
CHIN = os.path.join(REPO, "los_chinchineros_2026.html")
ORGA = os.path.join(REPO, "el_organillero_2026.html")
PUB = os.path.join(REPO, "public")

MOJI = re.compile(r"[\u00c0-\u00c3][^\u0000-\u007f]")


def leer(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()


def main():
    t = leer(CHIN)
    # [A] todas las etiquetas <img ...> y la existencia del src en disco
    print("[A] IMGs en los_chinchineros_2026.html:")
    for m in re.finditer(r'<img\b[^>]*>', t):
        tag = m.group(0)
        srcm = re.search(r'src="([^"]+)"', tag)
        src = srcm.group(1) if srcm else "?"
        # normalizar a ruta absoluta local (lineas generadas como recursos/... o public/...)
        ruta = os.path.join(PUB, os.path.basename(src)) if "public" in src.lower() else os.path.join(REPO, src)
        existe = os.path.exists(ruta)
        print("   src=%r existe_local=%s bytes=%s" % (src, existe, os.path.getsize(ruta) if existe else "-"))

    print()
    print("[A2] archivos .webp en public/:")
    if os.path.isdir(PUB):
        for fn in sorted(os.listdir(PUB)):
            if fn.lower().endswith(".webp"):
                fp = os.path.join(PUB, fn)
                print("   %r (%d B)" % (fn, os.path.getsize(fp)))
    else:
        print("   DIRECTORIO public/ NO EXISTE")

    print()
    # [B] bloque DATO (etiqueta 'DATO') en chinchineros y en orden como referencia
    for nombre, p in (("CHINCHINEROS", CHIN), ("ORGANILLERO", ORGA)):
        s = leer(p)
        i = s.find("etiqueta\">DATO")
        if i < 0:
            i = s.find('>DATO<')
        print("[B] %s DATO encontrado=%s" % (nombre, i >= 0))
        if i >= 0:
            print("   contexto:", repr(s[i - 60:i + 700]))


if __name__ == "__main__":
    main()
