#!/usr/bin/env python3
# -*- coding: us-ascii -*-
"""Genera el ranking en tiempo real de la actividad conjunta CONDORITO
(Los Personajes de la Historieta Chilena) uniendo los ADIF de:
  - CA4NDW-7  -> personaje YAYITA     (log_yayita.adi     en qsl.net/ca4ndw)
  - CE4JWI-10 -> personaje CONDORITO  (log_condorito.adi  en qsl.net/ce4jwi)

Sube ranking_condorito.json a AMBAS webs (ce4jwi y ca4ndw).

Uso:
  python generar_ranking_condorito.py            # baja, une y sube
  python generar_ranking_condorito.py --no-subir # solo genera ranking_condorito.json
  python generar_ranking_condorito.py --final    # congela (congelado:true) y guarda final.json
"""
import io, os, re, json, sys, datetime, ftplib

# ===== CONFIG (cambiar rutas remotas de cada log si difieren) =====
SITIOS = [
    {"host": "ftp.qsl.net", "user": "ce4jwi", "pass": "Sayayin@CE4JWI",  "label": "CE4JWI"},
    {"host": "ftp.qsl.net", "user": "ca4ndw", "pass": "1014radio",       "label": "CA4NDW"},
]
PERSONAJES = [
    {"personaje": "YAYITA",    "host": "ftp.qsl.net", "user": "ca4ndw", "pass": "1014radio", "log": "log_yayita.adi"},
    {"personaje": "CONDORITO", "host": "ftp.qsl.net", "user": "ce4jwi", "pass": "Sayayin@CE4JWI", "log": "log_condorito.adi"},
]
NOMBRE = "LOS PERSONAJES DE LA HISTORIETA CHILENA CONDORITO"
CLAVE = "condorito"
# ===================================================================

def bajar_adif(cfg):
    """Descarga el .adi remoto. Devuelve (texto, error)."""
    try:
        ftp = ftplib.FTP(cfg["host"])
        ftp.login(cfg["user"], cfg["pass"])
        ftp.set_pasv(True)
        buf = []
        def cb(d):
            buf.append(d)
        ftp.retrbinary("RETR " + cfg["log"], cb)
        ftp.quit()
        return b"".join(buf).decode("utf-8", errors="replace"), None
    except Exception as e:
        return "", str(e)[:120]

def parsear(texto):
    regs = []
    actual = {}
    for m in re.finditer(r"<([A-Z0-9]+):\d+(?::[^>]*)?>([^<]*)", texto):
        clave, valor = m.group(1).upper(), m.group(2).strip()
        if clave == "EOR" or clave == "EOH":
            if actual.get("CALL"):
                regs.append(actual)
            actual = {}
        else:
            actual[clave] = valor
    if actual.get("CALL"):
        regs.append(actual)
    return regs

def acumular(qsos, regs, tag):
    para = {"tag": tag, "n": 0}
    for r in regs:
        call = r.get("CALL", "").upper().strip()
        if not call:
            continue
        q = qsos.setdefault(call, {"total": 0, "ultima_fecha": "", "ultima_hora": ""})
        q["total"] += 1
        para["n"] += 1
        fecha = r.get("QSO_DATE", "")
        hora = r.get("TIME_ON", "")
        if fecha and hora:
            f = "%s/%s/%s" % (fecha[6:8], fecha[4:6], fecha[0:4])
            h = "%s:%s:%s" % (hora[0:2], hora[2:4], hora[4:6])
            prev = (q["ultima_fecha"].replace("/", ""), q["ultima_hora"].replace(":", ""))
            if (fecha, hora) > prev:
                q["ultima_fecha"], q["ultima_hora"] = f, h
    return para

def principal():
    args = sys.argv[1:]
    subir = "--no-subir" not in args
    final = "--final" in args

    qsos = {}
    resumen = []
    for cfg in PERSONAJES:
        texto, err = bajar_adif(cfg)
        if err:
            resumen.append("[%s] ERROR %s" % (cfg["personaje"], err))
            continue
        if not texto.strip():
            resumen.append("[%s] vacio (aun sin contactos)" % cfg["personaje"])
            continue
        regs = parsear(texto)
        p = acumular(qsos, regs, cfg["personaje"])
        resumen.append("[%s] %d QSOs" % (cfg["personaje"], p["n"]))

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
        "actividad": CLAVE,
        "nombre": NOMBRE,
        "actualizado": ahora.strftime("%Y-%m-%dT%H:%M:%S-04:00"),
        "totalContactos": total_contactos,
        "participantes": len(filas),
        "filas": filas,
    }
    if final:
        doc["congelado"] = True

    with io.open("ranking_condorito.json", "w", encoding="utf-8") as f:
        f.write(json.dumps(doc, ensure_ascii=True, indent=2))
    print("ranking_condorito.json generado | FFFD:", doc is not None and 0)
    for linea in resumen:
        print(linea)
    print("Total contactos: %d | Estaciones: %d" % (total_contactos, len(filas)))

    if final:
        carpeta = os.path.join("ranking-data", CLAVE)
        if not os.path.isdir(carpeta):
            os.makedirs(carpeta)
        with io.open(os.path.join(carpeta, "final.json"), "w", encoding="utf-8") as f:
            f.write(json.dumps(doc, ensure_ascii=True, indent=2))
        print("final.json guardado en ranking-data/%s/" % CLAVE)

    if not subir:
        print("--no-subir: no se sube por FTP")
        return

    with open("ranking_condorito.json", "rb") as fh:
        datos = fh.read()
    for st in SITIOS:
        try:
            ftp = ftplib.FTP(st["host"])
            ftp.login(st["user"], st["pass"])
            ftp.set_pasv(True)
            ftp.storbinary("STOR ranking_condorito.json", io.BytesIO(datos))
            ftp.quit()
            print("Subido a %s: /ranking_condorito.json" % st["label"])
        except Exception as e:
            print("ERROR subiendo a %s: %s" % (st["label"], str(e)[:120]))

if __name__ == "__main__":
    principal()