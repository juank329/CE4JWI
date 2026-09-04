#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
sync_calendario.py
------------------
Descarga el feed público iCal del Calendario de Google de CE4JWI y genera
recursos/eventos-calendario.json con el MISMO esquema que el calendario web
espera ({date, time, allDay, title, description, category}).

Se ejecuta vía GitHub Actions (workflow sync-calendario.yml) cada pocas horas.
El JSON generado es un "espejo" del Calendario de Google: NO se edita a mano;
solo se manda desde Google Calendar.

Los eventos siguen viniendo EXCLUSIVAMENTE de Google Calendar.
"""

import os
import json
import re
import datetime

REPO_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_JSON = os.path.join(REPO_DIR, "recursos", "eventos-calendario.json")

ICAL_URL = (
    "https://calendar.google.com/calendar/ical/"
    "f96d6d8a7b251e7bf0283bbc1059276e07026b7d0aef13b59e00df2dcb71d1a2"
    "@group.calendar.google.com/public/basic.ics"
)


def descargar(url, timeout=60):
    import urllib.request
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", errors="replace")


def unescape(s):
    return s.replace("\\,", ",").replace("\\;", ";").replace("\\n", " ")


def parsear_ical(texto):
    eventos = []
    lineas = texto.split("\r\n") if "\r\n" in texto else texto.split("\n")
    cur = None
    i = 0
    while i < len(lineas):
        linea = lineas[i]
        # iCal lines pueden estar plegadas: línea que empieza con espacio continúa la anterior
        while i + 1 < len(lineas) and lineas[i + 1].startswith(" "):
            linea += lineas[i + 1][1:]
            i += 1

        if linea.startswith("BEGIN:VEVENT"):
            cur = {}
        elif linea.startswith("END:VEVENT"):
            if cur and cur.get("summary") and cur.get("dtstart"):
                eventos.append(cur)
            cur = None
        elif cur is not None:
            idx = linea.find(":")
            if idx < 0:
                i += 1
                continue
            clave = linea[:idx].split(";")[0]
            valor = unescape(linea[idx + 1:])
            if clave == "SUMMARY":
                cur["summary"] = valor
            elif clave == "DESCRIPTION":
                cur["description"] = valor
            elif clave == "LOCATION":
                cur["location"] = valor
            elif clave == "DTSTART":
                cur["dtstart"] = valor
            elif clave == "DTEND":
                cur["dtend"] = valor
        i += 1
    return eventos


def normalizar(evs):
    out = []
    for e in evs:
        s = e["dtstart"]
        if "T" in s:
            fecha = f"{s[0:4]}-{s[4:6]}-{s[6:8]}"
            hora = f"{s[9:11]}:{s[11:13]}"
            all_day = False
        else:
            fecha = f"{s[0:4]}-{s[4:6]}-{s[6:8]}"
            hora = None
            all_day = True
        out.append({
            "date": fecha,
            "time": hora,
            "allDay": all_day,
            "title": e["summary"],
            "description": e.get("description", ""),
            "category": "actividad",
        })
    out.sort(key=lambda x: (x["date"] or "", x["time"] or ""))
    return out


def main():
    print("=== Sync Calendario Google -> JSON ===")
    try:
        texto = descargar(ICAL_URL)
    except Exception as ex:
        print(f"ERROR descargando iCal: {ex}")
        raise SystemExit(2)

    if "BEGIN:VEVENT" not in texto:
        print("ERROR: el iCal no trae eventos (¿feed no responde?). ABORTANDO.")
        raise SystemExit(3)

    eventos = normalizar(parsear_ical(texto))
    print(f"Eventos parseados: {len(eventos)}")

    contenido = json.dumps(eventos, ensure_ascii=False, separators=(",", ":"))
    anterior = open(OUT_JSON, encoding="utf-8").read() if os.path.exists(OUT_JSON) else None

    if anterior != contenido:
        with open(OUT_JSON, "w", encoding="utf-8") as f:
            f.write(contenido)
        print("actualizado: " + OUT_JSON)
        print("commit")
    else:
        print("sin cambios")
    return 0


if __name__ == "__main__":
    main()
