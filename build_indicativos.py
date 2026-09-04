#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_indicativos.py
--------------------
Actualiza automáticamente las licencias de radioaficionados de SUBTEL
(Chile) usadas por la web (buscador de indicativos + mapa).

Flujo:
  1) Descarga (autodescubrimiento por fecha) los 2 PDFs de SUBTEL:
       - Listado_NOV_GRAL_SUP_AAAA_MM.pdf  (Novicio/General/Superior)
       - Listado_Aspirantes_AAAA_MM.pdf     (Aspirantes)
     Si no puede descargar, usa los PDFs locales existentes en recursos/.
  2) Parsea las tablas de cada PDF.
  3) Deriva categoria/catKey por prefijo del indicativo y zona por dígito.
  4) Genera recursos/indicativos-data.js  y recursos/indicativos.json
     (mismo formato exacto que ya usa la web).
  5) Escribe /tmp/indicativos-commit.txt indicando si hubo cambios
     (para que GitHub Actions sólo haga commit si cambió algo).

Uso:
    python build_indicativos.py
"""

import os
import re
import sys
import json
import shutil
import tempfile
import datetime
import urllib.request
import urllib.error

# ---------------------------------------------------------------------------
# Configuración
# ---------------------------------------------------------------------------
REPO_DIR = os.path.dirname(os.path.abspath(__file__))
RECURSOS_DIR = os.path.join(REPO_DIR, "recursos")

LOCAL_NOV = os.path.join(RECURSOS_DIR, "Listado_NOV_GRAL_SUP")
LOCAL_ASP = os.path.join(RECURSOS_DIR, "Listado_Aspirantes")

OUT_JS = os.path.join(RECURSOS_DIR, "indicativos-data.js")
OUT_JSON = os.path.join(RECURSOS_DIR, "indicativos.json")
OUT_HIST = os.path.join(RECURSOS_DIR, "indicativos-historial.json")
OUT_HIST_JS = os.path.join(RECURSOS_DIR, "indicativos-historial.js")
FLAG_FILE = os.path.join(tempfile.gettempdir(), "indicativos-commit.txt")

# Con esta versión se recalcula el historial acumulado desde cero (útil si
# cambia la lógica de agrupación). Los datos de cada mes son la "fuente".
HIST_VERSION = 1

BASE_PDF = "https://www.subtel.gob.cl/wp-content/uploads"

MESES_ES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]
PAGINA_SUBTEL = (
    "https://www.subtel.gob.cl/inicio-concesionario/"
    "servicios-de-telecomunicaciones/servicios-de-radio-aficionados/"
)

# Mapas de categoría según prefijo de la señal distintiva
PREFIJO_CATEGORIA = {
    "CA": ("Novicio", "nov"),
    "CD": ("Aspirante", "asp"),
    "CE": ("General", "grl"),
    "XQ": ("Superior", "sup"),
}

# Las 16 regiones de Chile (nombres oficiales con acentos)
# NOTA: SUBTEL escribe "Nuble" sin ñ y "Biobio" sin acento; se incluyen variantes.
REGIONES = [
    "Región de Arica y Parinacota",
    "Región de Tarapacá",
    "Región de Antofagasta",
    "Región de Atacama",
    "Región de Coquimbo",
    "Región de Valparaíso",
    "Región Metropolitana de Santiago",
    "Región del Libertador General Bernardo O'Higgins",
    "Región del Maule",
    "Región de Ñuble",
    "Región de Nuble",
    "Región del Biobío",
    "Región del Biobio",
    "Región de la Araucanía",
    "Región de la Araucania",
    "Región de Los Ríos",
    "Región de Los Rios",
    "Región de Los Lagos",
    "Región de Aysén del General Carlos Ibáñez del Campo",
    "Región de Aysen del General Carlos Ibanez del Campo",
    "Región de Magallanes y de la Antártica Chilena",
    "Región de Magallanes y de la Antartica Chilena",
]

# Variantes ortográficas que el listado de SUBTEL usa distinto al mapa
COMUNAS_CORREGIDAS = {
    "Coyhaique": "Coyhaique",          # mantener (ver nota)
    "Calera": "La Calera",
    "San Vicente": "San Vicente de Tagua Tagua",
    "Ch illán": "Chillán",
    "V illarrica": "Villarrica",
    "V illa Alemana": "Villa Alemana",
    "Puerto V aras": "Puerto Varas",
    "Huasco": "Huasco",
}


def log(msg):
    print(msg, flush=True)


# ---------------------------------------------------------------------------
# Descarga de PDFs
# ---------------------------------------------------------------------------
def descargar(url, destino_tmp):
    """Descarga url a destino_tmp devolviendo True si OK."""
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            with open(destino_tmp, "wb") as f:
                shutil.copyfileobj(r, f)
        return True
    except (urllib.error.HTTPError, urllib.error.URLError, OSError):
        return False


def buscar_pdf(nombre_base, anio, mes):
    """
    Autodescubre la URL del PDF. El listado del mes M suele publicarse en la
    carpeta del mes M o M+1. Prueba combos de los últimos 3 meses.
    Devuelve (url_ok, data_bytes) o (None, None).
    """
    # (año, mes, carpeta, nombre_archivo) posibles
    intentos = []
    # El listado del mes M puede estar en carpeta M o M+1. Probamos 3 meses atrás.
    for delta_mes in range(0, 3):
        ym = anio * 12 + (mes - 1) - delta_mes
        y = ym // 12
        m = ym % 12 + 1
        base = f"{y:04d}/{m:02d}"
        nombre = f"{y:04d}_{m:02d}"
        # nombre del archivo lleva el mes del LISTADO (delta_mes)
        # carpeta puede ser la del listado o la siguiente
        intentos.append(f"{BASE_PDF}/{base}/{nombre_base}_{nombre}.pdf")

        # carpeta del mes siguiente (publicación tardía)
        ym_next = y * 12 + (m - 1) + 1
        yn = ym_next // 12
        mn = ym_next % 12 + 1
        base_next = f"{yn:04d}/{mn:02d}"
        intentos.append(f"{BASE_PDF}/{base_next}/{nombre_base}_{nombre}.pdf")

    # también intentar el mes actual del sistema y el siguiente
    hoy = datetime.date.today()
    for delta_mes in range(0, 3):
        ym = hoy.year * 12 + (hoy.month - 1) - delta_mes
        y = ym // 12
        m = ym % 12 + 1
        nombre = f"{y:04d}_{m:02d}"
        for carpeta_delta in (0, 1):
            ym2 = y * 12 + (m - 1) + carpeta_delta
            y2 = ym2 // 12
            m2 = ym2 % 12 + 1
            intentos.append(f"{BASE_PDF}/{y2:04d}/{m2:02d}/{nombre_base}_{nombre}.pdf")

    # dedupe manteniendo orden
    vistos = set()
    urls = []
    for u in intentos:
        if u not in vistos:
            vistos.add(u)
            urls.append(u)

    for u in urls:
        tmp = os.path.join(tempfile.gettempdir(), os.path.basename(u))
        if descargar(u, tmp):
            with open(tmp, "rb") as f:
                data = f.read()
            log(f"  OK {u} ({len(data)} bytes)")
            return data

    log(f"  no se autodescubrió: {nombre_base}")
    return None


def leer_pdf_local(nombre_base):
    """Busca un PDF local en recursos/ devolviendo (ruta, bytes) o (None, None)."""
    fmt = datetime.date.today()
    candidatos = []
    for delta in range(0, 4):
        ym = fmt.year * 12 + (fmt.month - 1) - delta
        y = ym // 12
        m = ym % 12 + 1
        p = f"{nombre_base}_{y:04d}_{m:02d}.pdf"
        candidatos.append(p)
    for c in candidatos:
        p = os.path.join(RECURSOS_DIR, c)
        if os.path.exists(p):
            with open(p, "rb") as f:
                return p, f.read()
    return None, None


def obtener_pdf(nombre_base, anio, mes):
    """Devuelve (ruta,nombre,anio,mes) del PDF realmente usado (descargado o local)."""
    # Prioridad: PDF local del mes exacto (ya lo tenemos → sin descargar). Luego
    # autodescubrimiento por red. Al final, cualquier PDF local disponible.
    local = os.path.join(RECURSOS_DIR, f"{nombre_base}_{anio:04d}_{mes:02d}.pdf")
    if os.path.exists(local):
        log(f"  usando PDF local del mes ({os.path.basename(local)})")
        with open(local, "rb") as f:
            return local, nombre_base, anio, mes, f.read()

    data = buscar_pdf(nombre_base, anio, mes)
    if data:
        tmp = os.path.join(tempfile.gettempdir(), f"{nombre_base}_{anio:04d}_{mes:02d}.pdf")
        return tmp, nombre_base, anio, mes, data

    _p, data = leer_pdf_local(nombre_base)
    if data:
        log(f"  usando PDF local en recursos/")
        mm = re.search(r"(\d{4})_(\d{2})", os.path.basename(_p))
        if mm:
            anio, mes = int(mm.group(1)), int(mm.group(2))
        return _p, nombre_base, anio, mes, data
    raise RuntimeError(f"No se pudo obtener {nombre_base}")


# ---------------------------------------------------------------------------
# Parsing de PDF
# ---------------------------------------------------------------------------
def extraer_texto_pdf(data):
    try:
        from pypdf import PdfReader
    except ImportError:
        import pdfplumber  # noqa: F401 (fallback)
        return None
    import io
    r = PdfReader(io.BytesIO(data))
    return "\n".join((p.extract_text() or "") for p in r.pages)


# Variantes ortográficas que SUBTEL escribe distinto y que se normalizan a la
# forma oficial con acentos (usada por el mapa y por la data actual).
VARIANTES_REGION = {
    "Región de Nuble": "Región de Ñuble",
    "Región del Biobio": "Región del Biobío",
    "Región de la Araucania": "Región de la Araucanía",
    "Región de Los Rios": "Región de Los Ríos",
    "Región de Aysen del General Carlos Ibanez del Campo":
        "Región de Aysén del General Carlos Ibáñez del Campo",
    "Región de Magallanes y de la Antartica Chilena":
        "Región de Magallanes y de la Antártica Chilena",
}


def _region_probe_list():
    """Patrones de región tolerantes a espacios internos (pypdf parte palabras,
    p.ej. 'Regi ón' o 'R egi ón'). Cada carácter puede ir con espacios."""
    probes = []
    for reg in REGIONES:
        expr = ''.join(r'\s*' + re.escape(ch) for ch in reg) + r'\s*'
        probes.append((re.compile(expr, re.IGNORECASE), reg))
    return probes


def _coincidir_region(texto):
    """Devuelve (nombre_region_normalizado, span) de la región más larga que
    matchea en texto, tolerando espacios internos partidos por el PDF."""
    mejor = None
    for probe, nombre in _region_probe_list():
        m = probe.search(texto)
        if m:
            largo = m.end() - m.start()
            if mejor is None or largo > mejor[0]:
                canon = VARIANTES_REGION.get(nombre, nombre)
                mejor = (largo, canon, m.start(), m.end())
    return mejor


def _pre_unir_lineas(texto):
    """Une líneas que pypdf partió a mitad de una licencia de 7+ dígitos.
    p.ej. '3971837' + '5 CE2PMO ... Región ... 23/12/2029'
          -> '3971837-5 CE2PMO ... Región ... 23/12/2029'.
    Solo une cuando la línea actual termina en dígitos (licencia sin guion,
    sin fecha) y la siguiente es la continuación de un registro."""
    lineas = texto.split("\n")
    out = []
    i = 0
    n = len(lineas)
    while i < n:
        l = lineas[i].strip()
        sig = lineas[i + 1].strip() if i + 1 < n else ""
        # ¿Línea actual es una licencia partida (dígitos sin guion ni fecha)?
        es_licencia_partida = (
            bool(l)
            and re.search(r"\d{5,8}$", l)
            and not re.search(r"\d{1,2}/\d{1,2}/\d{4}", l)
        )
        if es_licencia_partida and sig:
            # la siguiente debe verse como continuación: díg. verificación + indicativo
            if re.match(r"^[0-9K]\s+[A-Z]{2}\s*\d", sig) or re.match(r"^[0-9K]\s*[A-Z]{2}", sig):
                out.append(l + "-" + sig)
                i += 2
                continue
        out.append(l)
        i += 1
    return "\n".join(out)


def parsear_registros(texto, cat_default, cat_key_default):
    """Extrae (licencia, indicativo, nombre, region, comuna, vence)."""
    texto = _pre_unir_lineas(texto)
    lineas = texto.split("\n")
    registros = []
    pat_lic = re.compile(r"^\s*(\d{2,9}-[0-9K])\s+(.+)$")
    # fecha tolerante a espacios internos (SUBTEL a veces parte "06/07/ 2026")
    pat_fecha = re.compile(r"(\d{1,2})\s*/\s*(\d{1,2})\s*/\s*(\d{4})")

    # Juntar líneas de un mismo registro cortadas por pypdf (la segunda parte
    # no empieza con licencia). Acumulamos y seguimos mientras falte fecha.
    pendiente = None

    def _procesar(linea):
        nonlocal pendiente
        if pendiente is not None:
            linea = pendiente + " " + linea
            pendiente = None
        m = pat_lic.match(linea)
        if not m:
            return
        lic = m.group(1)
        resto = m.group(2)

        # buscar fecha (puede tener espacios internos)
        fm = pat_fecha.search(resto)
        if not fm:
            # posible fila partida: pypdf cortó comuna/fecha a la línea siguiente
            if pendiente is None:
                pendiente = linea
            return
        vence = f"{int(fm.group(1)):02d}/{int(fm.group(2)):02d}/{fm.group(3)}"
        antes = resto[: fm.start()]

        # encontrar región (tolera espacios partidos por pypdf)
        mejor = _coincidir_region(antes)
        if not mejor:
            return
        _largo, region, start_idx, end_idx = mejor

        cabecera = antes[:start_idx].strip()    # licencia indicativo nombre
        comuna_raw = antes[end_idx:].strip()    # lo que queda tras la región
        comuna = limpiar_comuna(comuna_raw)

        # desglosar cabecera: licencia(ya separada) + indicativo + nombre
        # El indicativo SIEMPRE es de la forma: 2 letras + zona(1 dígito) +
        # 3 letras finales (art. PDF). Puede venir partido por pypdf:
        #   "CE1WMM", "CE4 GM", "CE4GM", "CE 1WMM", "CE 4 GM" ...
        # Buscamos ese patrón estricto; el resto anterior es licencia
        # (ya extraída) y el resto posterior es el nombre.
        m_indi = re.search(r"([A-Z]{2})\s*(\d)\s*([A-Z]{3})", cabecera)
        if not m_indi:
            return
        indicativo = m_indi.group(1) + m_indi.group(2) + m_indi.group(3)
        nombre = cabecera[m_indi.end():].strip()
        if not nombre:
            return
        pref = indicativo[:2]
        if pref not in PREFIJO_CATEGORIA:
            # fallback al default del archivo (ej. podría no ir por prefijo)
            cat_txt = cat_default
            cat_key = cat_key_default
        else:
            cat_txt, cat_key = PREFIJO_CATEGORIA[pref]

        # zona = primer dígito del indicativo
        zm = re.search(r"\d", indicativo)
        zona = zm.group(0) if zm else ""

        registros.append({
            "licencia": lic,
            "indicativo": indicativo,
            "nombre": nombre,
            "categoria": cat_txt,
            "catKey": cat_key,
            "zona": zona,
            "region": region,
            "comuna": comuna,
            "vence": vence,
        })

    for linea in lineas:
        _procesar(linea)
    # descartar cualquier acumulada que no tuviera fecha al final del documento
    return registros


def limpiar_comuna(raw):
    """Corrige comunas partidas o con grafía distinta a la del mapa."""
    c = raw
    # Si pypdf fusionó un pie/encabezado de SUBTEL al final de la línea
    # (ocurre al cerrar una página), cortamos la comuna justo en ese marcador.
    marcadores_pie = [
        "CONTACTO:", "subtel.gob.cl", "anexo", "Informes_RA",
        "bcn.cl", "idNorma", "LISTADO DE", "Fecha Vencimiento",
        "La señal distintiva",
    ]
    for mk in marcadores_pie:
        ti = c.upper().find(mk.upper())
        if ti != -1:
            c = c[:ti]
            break
    c = c.strip()
    # Quitar la fecha de vencimiento que a veces queda pegada a la comuna
    # ("San Fernando 25/09/202 9" -> "San Fernando") tolerando espacios internos
    c = re.sub(r"\s+\d{1,2}\s*/\s*\d{1,2}\s*/\s*[\d\s]{2,6}\s*$", "", c).strip()
    # quitar espacios internos anómalos de tipo "Ch illán" -> "Chillán"
    c = re.sub(r"(?<=\b[A-Za-zÁÉÍÓÚÑáéíóúñ]) (?=[a-záéíóúñ])", "", c)
    c = re.sub(r"\s+", " ", c).strip()
    # corregir variantes
    return COMUNAS_CORREGIDAS.get(c, c)


# ---------------------------------------------------------------------------
# Escritura de salida
# ---------------------------------------------------------------------------
def ordenar(registros):
    # igual que la web: orden lexicográfico por indicativo
    return sorted(registros, key=lambda r: r["indicativo"])


def escribir(data_js, data_json, fecha_act="", anio_act=0, mes_act=0):
    need_commit = False

    def _fmt(regs):
        out = []
        for i, r in enumerate(regs):
            sep = "," if i < len(regs) - 1 else ""
            out.append("    {")
            out.append(f'        "indicativo":  "{r["indicativo"]}",')
            out.append(f'        "nombre":  "{r["nombre"]}",')
            out.append(f'        "categoria":  "{r["categoria"]}",')
            out.append(f'        "catKey":  "{r["catKey"]}",')
            out.append(f'        "zona":  "{r["zona"]}",')
            out.append(f'        "region":  "{r["region"]}",')
            out.append(f'        "comuna":  "{r["comuna"]}",')
            out.append(f'        "vence":  "{r["vence"]}",')
            out.append(f'        "licencia":  "{r["licencia"]}"')
            out.append("    }" + sep)
        return "\n".join(out)

    cuerpo = _fmt(data_js)
    contenido_js = "window.INDICATIVOS_DATA = [\n" + cuerpo + "\n];\n"
    contenido_js += (
        "\nwindow.INDICATIVOS_META = "
        + json.dumps({"actualizado": fecha_act, "anio": anio_act, "mes": mes_act},
                     ensure_ascii=False)
        + ";\n"
    )
    contenido_json = json.dumps(data_json, ensure_ascii=False, indent=4)

    old_js = open(OUT_JS, encoding="utf-8").read() if os.path.exists(OUT_JS) else None
    old_json = open(OUT_JSON, encoding="utf-8").read() if os.path.exists(OUT_JSON) else None

    if old_js != contenido_js:
        with open(OUT_JS, "w", encoding="utf-8") as f:
            f.write(contenido_js)
        need_commit = True
        log(f"  actualizado: {OUT_JS}")
    else:
        log(f"  sin cambios: {OUT_JS}")

    if old_json != contenido_json:
        with open(OUT_JSON, "w", encoding="utf-8") as f:
            f.write(contenido_json)
        need_commit = True
        log(f"  actualizado: {OUT_JSON}")
    else:
        log(f"  sin cambios: {OUT_JSON}")

    with open(FLAG_FILE, "w", encoding="utf-8") as f:
        f.write("commit\n" if need_commit else "none\n")

    return need_commit


# ---------------------------------------------------------------------------
# Historial por persona
# ---------------------------------------------------------------------------
def _norm(s):
    """Normaliza un texto para usarlo como clave de persona:
    minúsculas, sin acentos, sin espacios redundantes ni puntuación."""
    if not s:
        return ""
    import unicodedata
    nfkd = unicodedata.normalize("NFKD", str(s))
    sin_acentos = "".join(c for c in nfkd if not unicodedata.combining(c))
    return re.sub(r"[\s]+", " ", re.sub(r"[^a-z0-9]+", " ", sin_acentos.lower())).strip()


def _persona_key(r):
    """Clave que agrupa a la misma persona: nombre + comuna + región."""
    return "|".join([_norm(r.get("nombre", "")), _norm(r.get("comuna", "")), _norm(r.get("region", ""))])


def _cargar_historial():
    if os.path.exists(OUT_HIST):
        try:
            with open(OUT_HIST, encoding="utf-8") as f:
                obj = json.load(f)
            # formato actual: {version, actualizado, personas:{...}}
            if isinstance(obj, dict) and "personas" in obj:
                return obj["personas"]
            # formato viejo: campo por campo (personaKey -> [entradas])
            if isinstance(obj, dict):
                return obj
        except Exception:
            log(f"  AVISO: no pude leer {OUT_HIST}; empiezo historial vacío")
    return {}


def actualizar_historial(regs_actuales):
    """Acumula el historial de personas a lo largo de los meses.
    regs_actuales: lista de dicts del mes vigente (con indicativo, nombre,
    comuna, region, categoria, catKey, vence, licencia).

    Devuelve el dict de historial: personaKey -> lista ordenada de entradas.
    """
    hist = _cargar_historial()

    for r in regs_actuales:
        key = _persona_key(r)
        ind = r["indicativo"].strip().upper()
        entradas = hist.setdefault(key, [])
        # Verificamos si este indicativo ya está registrado para la persona
        existe = next((e for e in entradas if e["indicativo"] == ind), None)
        if existe:
            # Mantener la categoría/vencimiento más reciente
            existe["categoria"] = r["categoria"]
            existe["catKey"] = r["catKey"]
            existe["vence"] = r["vence"] or existe.get("vence", "")
            existe["licencia"] = r["licencia"] or existe.get("licencia", "")
        else:
            entradas.append({
                "indicativo": ind,
                "categoria": r["categoria"],
                "catKey": r["catKey"],
                "vence": r["vence"] or "",
                "licencia": r["licencia"] or "",
                "comuna": r.get("comuna", ""),
                "region": r.get("region", ""),
                "nombre": r.get("nombre", ""),
            })

    return hist


def escribir_historial(hist, fecha_act):
    """Escribe indicativos-historial.json y su versión JS. Devuelve True si hubo cambios."""
    need = False

    # Orden de las entradas: por indicativo para consistencia
    for key in hist:
        hist[key].sort(key=lambda e: e["indicativo"])

    objeto = {
        "version": HIST_VERSION,
        "actualizado": fecha_act,
        "personas": hist,
    }

    contenido_json = json.dumps(objeto, ensure_ascii=False, indent=2)

    old_json = open(OUT_HIST, encoding="utf-8").read() if os.path.exists(OUT_HIST) else None
    if old_json != contenido_json:
        with open(OUT_HIST, "w", encoding="utf-8") as f:
            f.write(contenido_json)
        need = True
        log(f"  actualizado: {OUT_HIST}")

    # Versión JS para carga con file://
    contenido_js = (
        "window.INDICATIVOS_HISTORIAL = "
        + json.dumps(objeto, ensure_ascii=False)
        + ";\n"
    )
    old_js = open(OUT_HIST_JS, encoding="utf-8").read() if os.path.exists(OUT_HIST_JS) else None
    if old_js != contenido_js:
        with open(OUT_HIST_JS, "w", encoding="utf-8") as f:
            f.write(contenido_js)
        need = True
        log(f"  actualizado: {OUT_HIST_JS}")

    return need


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    hoy = datetime.date.today()
    anio, mes = hoy.year, hoy.month
    if "--anio" in sys.argv:
        anio = int(sys.argv[sys.argv.index("--anio") + 1])
    if "--mes" in sys.argv:
        mes = int(sys.argv[sys.argv.index("--mes") + 1])
    log("=== Actualización de licencias SUBTEL ===")

    nov = obtener_pdf("Listado_NOV_GRAL_SUP", anio, mes)
    asp = obtener_pdf("Listado_Aspirantes", anio, mes)

    # Fecha del listado = la del PDF realmente usado (nombre _AAAA_MM)
    _, _, list_anio, list_mes, _nov = nov
    _, _, _, _, _asp = asp
    anio, mes = list_anio, list_mes

    log("Parseando PDFs...")
    txt_nov = extraer_texto_pdf(_nov)
    txt_asp = extraer_texto_pdf(_asp)

    if not (txt_nov and txt_asp):
        log("ERROR: no se pudo extraer texto de los PDFs (falta pypdf).")
        sys.exit(2)
    if len(txt_nov) < 1000 or len(txt_asp) < 1000:
        log("ERROR: texto extraído sospechosamente corto.")
        sys.exit(2)

    regs_nov = parsear_registros(txt_nov, "General", "grl")
    regs_asp = parsear_registros(txt_asp, "Aspirante", "asp")

    total = regs_nov + regs_asp
    log(f"Registros NOV/GRAL/SUP: {len(regs_nov)} | Aspirantes: {len(regs_asp)} | Total: {len(total)}")

    if len(total) < 5000:
        log(f"ERROR: solo {len(total)} registros (¿formato PDF cambió?). ABORTANDO para no romper.")
        sys.exit(3)

    ordenado = ordenar(total)
    fecha_act = f"{MESES_ES[mes - 1]} {anio}"

    # Historial acumulado por persona (para ver CD→CA→CE→XQ de cada uno)
    hist = actualizar_historial(ordenado)
    n_personas = len(hist)
    n_entradas = sum(len(v) for v in hist.values())
    log(f"Historial: {n_personas} personas | {n_entradas} entradas")

    need = escribir(ordenado, ordenado, fecha_act=fecha_act, anio_act=anio, mes_act=mes)
    need_hist = escribir_historial(hist, fecha_act)
    log("=== Listo ===")
    log("commit" if (need or need_hist) else "sin cambios")
    sys.exit(0)


if __name__ == "__main__":
    main()
