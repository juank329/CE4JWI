#!/usr/bin/env python3
# -*- coding: us-ascii -*-
"""Genera el ranking en tiempo real de la actividad conjunta CONDORITO
(Los Personajes de la Historieta Chilena) uniendo los ADIF de:
  - CA4NDW-7  -> YAYITA (Ref 01, log_yayita.adi)      + TREMEBUNDA (Ref 03, log_tremebunda.adi)
  - CE4JWI-10 -> CONDORITO (Ref 02, log_condorito.adi) + CUASIMODO (Ref 04, log_cuasimodo.adi)

El ranking SUMA y SE VAN AGREGANDO personajes: un corresponsal muestra un
chip por cada personaje con que contacto (historicos y nuevos). Al cambiar
de referencia se AGREGA el personaje nuevo; los anteriores NUNCA se borran.
El total de QSO siempre crece. Lo que SI se reinicia en 0 (-> QSL 01) por
referencia es la numeracion de las QSL del panel (contador_qsl.json).

# Bots locales (verificacion manual de rutas, NO se leen desde aqui):
#   CA4NDW-7  -> C:/Users/javen/OneDrive/Desktop/condorito/bot_aprs_ca4ndw   (frase TREMEBUNDA, log_tremebunda.adi a qsl.net/ca4ndw)
#   CE4JWI-10 -> C:/Users/javen/OneDrive/Desktop/BOT/bot_ce4jwi10_telegram    (frase CUASIMODO, log_cuasimodo.adi a qsl.net/ce4jwi)
Sube el ranking conjunto (ARCHIVO_RANKING) a AMBAS webs (ce4jwi y ca4ndw).

Uso:
  python generar_ranking_condorito.py            # baja, une y sube
  python generar_ranking_condorito.py --no-subir # solo genera el JSON local
  python generar_ranking_condorito.py --final    # congela (congelado:true) y guarda final.json
"""
import io, os, re, json, sys, datetime, ftplib

# ===== CONFIG (cambiar rutas remotas de cada log si difieren) =====
SITIOS = [
    {"host": "ftp.qsl.net", "user": "ce4jwi", "pass": "Sayayin@CE4JWI",  "label": "CE4JWI"},
    {"host": "ftp.qsl.net", "user": "ca4ndw", "pass": "1014radio",       "label": "CA4NDW"},
]
PERSONAJES = [
    {"personaje": "YAYITA",     "host": "ftp.qsl.net", "user": "ca4ndw", "pass": "1014radio",
     "logs": ["log_yayita.adi"]},
    {"personaje": "CONDORITO",  "host": "ftp.qsl.net", "user": "ce4jwi", "pass": "Sayayin@CE4JWI",
     "logs": ["log_condorito.adi"]},
    {"personaje": "TREMEBUNDA", "host": "ftp.qsl.net", "user": "ca4ndw", "pass": "1014radio",
     "logs": ["log_tremebunda.adi"]},
    {"personaje": "CUASIMODO",  "host": "ftp.qsl.net", "user": "ce4jwi", "pass": "Sayayin@CE4JWI",
     "logs": ["log_cuasimodo.adi"]},
    {"personaje": "YUYITO",     "host": "ftp.qsl.net", "user": "ca4ndw", "pass": "1014radio",
     "logs": ["log_yuyito.adi"]},
    {"personaje": "CONE",       "host": "ftp.qsl.net", "user": "ce4jwi", "pass": "Sayayin@CE4JWI",
     "logs": ["log_cone.adi"]},
]
NOMBRE = "LOS PERSONAJES DE LA HISTORIETA CHILENA CONDORITO"
CLAVE = "condorito"
PERSONAJE_REF = {"YAYITA": "01", "CONDORITO": "02", "TREMEBUNDA": "03", "CUASIMODO": "04",
                 "YUYITO": "05", "CONE": "06"}
# Archivo del ranking CONJUNTO. El bot CE4JWI-10 escribe ranking_<clave>.json en
# cada QSO; usar un nombre propio evita que el bot pise el merge con CA4NDW-7.
ARCHIVO_RANKING = "ranking_condorito_conjunta.json"
# ===================================================================

def bajar_adif(cfg):
    """Descarga los .adi remotos (log historico + log actual del personaje).
    Devuelve (texto_unido, lista_errores); un log ausente NO anula al resto."""
    partes = []
    errores = []
    for log in cfg["logs"]:
        try:
            ftp = ftplib.FTP(cfg["host"])
            ftp.login(cfg["user"], cfg["pass"])
            ftp.set_pasv(True)
            buf = []
            def cb(d):
                buf.append(d)
            ftp.retrbinary("RETR " + log, cb)
            ftp.quit()
            texto = b"".join(buf).decode("utf-8", errors="replace")
            if texto.strip():
                partes.append(texto)
            else:
                errores.append("[%s] %s vacio" % (cfg["personaje"], log))
        except Exception as e:
            errores.append("[%s] %s error: %s" % (cfg["personaje"], log, str(e)[:80]))
    return "\n".join(partes), errores

def parsear(texto):
    """ADIF: los <EOR>/<EOH> vienen sin dato (pelados) en los logs de los
    bots; hay que capturarlos tambien para cerrar cada registro."""
    regs = []
    actual = {}
    pat = re.compile(r"<(EOR|EOH)>|<([A-Z0-9_]+):\d+(?::[^>]*)?>([^<]*)")
    for m in pat.finditer(texto):
        if m.group(1):
            if actual.get("CALL"):
                regs.append(actual)
            actual = {}
            continue
        clave, valor = m.group(2).upper(), m.group(3).strip()
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
        q = qsos.setdefault(call, {"total": 0, "ultima_fecha": "", "ultima_hora": "", "personajes": ""})
        q["total"] += 1
        if tag not in q["personajes"].split("|"):
            q["personajes"] = (q["personajes"] + "|" + tag).strip("|")
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
        texto, errores = bajar_adif(cfg)
        for e in errores:
            resumen.append(e)
        if not texto.strip():
            resumen.append("[%s] aun sin contactos" % cfg["personaje"])
            continue
        regs = parsear(texto)
        p = acumular(qsos, regs, cfg["personaje"])
        resumen.append("[%s] %d QSOs" % (cfg["personaje"], p["n"]))

    filas = []
    orden = sorted(qsos.items(), key=lambda kv: (-kv[1]["total"], kv[0]))
    for call, q in orden:
        personajes = []
        for nombre in sorted(q["personajes"].split("|"), key=lambda x: PERSONAJE_REF.get(x, "99")):
            if nombre:
                personajes.append({"ref": PERSONAJE_REF.get(nombre, ""), "nombre": nombre})
        filas.append({
            "call": call,
            "total": q["total"],
            "modos": ["PKT"],
            "ultima": {"fecha": q["ultima_fecha"], "hora": q["ultima_hora"]},
            "personajes": personajes,
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

    with io.open(ARCHIVO_RANKING, "w", encoding="utf-8") as f:
        f.write(json.dumps(doc, ensure_ascii=True, indent=2))
    print(ARCHIVO_RANKING + " generado | FFFD:", doc is not None and 0)
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

    with open(ARCHIVO_RANKING, "rb") as fh:
        datos = fh.read()
    for st in SITIOS:
        try:
            ftp = ftplib.FTP(st["host"])
            ftp.login(st["user"], st["pass"])
            ftp.set_pasv(True)
            ftp.storbinary("STOR " + ARCHIVO_RANKING, io.BytesIO(datos))
            ftp.quit()
            print("Subido a %s: /%s" % (st["label"], ARCHIVO_RANKING))
        except Exception as e:
            print("ERROR subiendo a %s: %s" % (st["label"], str(e)[:120]))

if __name__ == "__main__":
    principal()