#!/usr/bin/env python3
# -*- coding: us-ascii -*-
"""Genera el ranking JSON de una actividad desde un .adi (manual).
Uso:
  python generar_ranking_manual.py <ruta.log.adi> <Nombre Actividad> [--final] [--salida RUTA]
"""
import sys, os, re, json, datetime, io

def leer_adif(ruta):
    if not os.path.exists(ruta):
        sys.exit("ERROR: no existe: " + ruta)
    data = io.open(ruta, "r", encoding="utf-8", errors="replace").read()
    registros = []
    actual = {}
    # Los <EOR>/<EOH> de los bots vienen sin dato (pelados): capturarlos tambien
    patron = re.compile(r"<(EOR|EOH)>|<([A-Z0-9_]+):\d+(?::[^>]*)?>([^<]*)")
    for m in patron.finditer(data):
        if m.group(1):
            if actual.get("CALL"):
                registros.append(actual)
            actual = {}
        else:
            clave, valor = m.group(2).upper(), m.group(3).strip()
            actual[clave] = valor
    if actual.get("CALL"):
        registros.append(actual)
    return registros

def principal():
    args = sys.argv[1:]
    if len(args) < 2:
        sys.exit("Uso: python generar_ranking_manual.py <log.adi> <Nombre> [--final] [--salida RUTA]")
    ruta_adi = args[0]
    nombre = args[1]
    final = "--final" in args
    salida = None
    if "--salida" in args:
        salida = args[args.index("--salida") + 1]
    clave = nombre.strip().lower()
    clave = re.sub(r"[^a-z0-9]+", "", clave)
    if not clave:
        clave = "actividad"
    regs = leer_adif(ruta_adi)
    if not regs:
        sys.exit("ERROR: no se encontraron contactos en el .adi")
    qsos = {}
    for r in regs:
        call = r.get("CALL", "").upper().strip()
        if not call:
            continue
        q = qsos.setdefault(call, {"total": 0, "ultima_fecha": "", "ultima_hora": ""})
        q["total"] += 1
        fecha = r.get("QSO_DATE", "")
        hora = r.get("TIME_ON", "")
        if fecha and hora:
            f = "%s/%s/%s" % (fecha[6:8], fecha[4:6], fecha[0:4])
            h = "%s:%s:%s" % (hora[0:2], hora[2:4], hora[4:6])
            tupla = (fecha, hora)
            prev = (q["ultima_fecha"].replace("/", ""), q["ultima_hora"].replace(":", ""))
            if tupla > prev:
                q["ultima_fecha"], q["ultima_hora"] = f, h
    filas = []
    orden = sorted(qsos.items(), key=lambda kv: (-kv[1]["total"], kv[0]))
    for call, q in orden:
        filas.append({
            "call": call,
            "total": q["total"],
            "modos": ["PKT"],
            "ultima": {"fecha": q["ultima_fecha"], "hora": q["ultima_hora"]},
        })
    total_contactos = sum(q["total"] for q in qsos.values())
    ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-4)))
    doc = {
        "ok": True,
        "actividad": clave,
        "nombre": nombre.upper(),
        "actualizado": ahora.strftime("%Y-%m-%dT%H:%M:%S-04:00"),
        "totalContactos": total_contactos,
        "participantes": len(filas),
        "filas": filas,
    }
    if final:
        doc["congelado"] = True
        carpeta = os.path.join("ranking-data", clave)
        if not os.path.isdir(carpeta):
            os.makedirs(carpeta)
        destino = os.path.join(carpeta, "final.json")
    else:
        destino = "ranking_%s.json" % clave
    if salida:
        destino = salida
    with io.open(destino, "w", encoding="utf-8") as f:
        f.write(json.dumps(doc, ensure_ascii=True, indent=2))
    print("OK: %s" % destino)
    print("Contactos: %d  /  Estaciones: %d" % (total_contactos, len(filas)))

if __name__ == "__main__":
    principal()