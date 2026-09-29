# TUTORIAL: CÓMO HACER EL RANKING DE UNA ACTIVIDAD (MANUAL)

> Guía paso a paso para cuando no esté opencode disponible.
> Léela completa una vez, y luego usa el **Checklist final** (sección 10) cada vez.

---

## 1. QUÉ ES EL RANKING Y DE DÓNDE SALE

Cada actividad especial (CUECA, HUASO, COPIHUE, etc.) genera contactos:

1. El **bot de APRS** (un programa Python) escucha radio. Cuando alguien envía
   "CQ CUECA", el bot anota ese contacto en un archivo `.adi` (formato ADIF).
2. Con esos contactos se construye un archivo **`.json`** = la "tabla" del ranking:
   quién contactó, cuántas veces, y la última vez.
3. Ese `.json` se **sube por FTP al sitio web**.
4. La **página HTML** de la actividad lo lee y dibuja la tabla automáticamente.

Tu trabajo manual es hacer el paso 2, 3 y 4 (lo que opencode normalmente hace).

---

## 2. LAS RUTAS Y ARCHIVOS MÁS IMPORTANTES (TABLA DE REFERENCIA)

| Qué es | Dónde está (en tu PC) | En el sitio web (URL) |
|---|---|---|
| Repositorio del sitio | `C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI\` | — |
| Bots (suite CE4JWI) | `C:\Users\javen\OneDrive\Desktop\BOT\bot_aprs_ce4jwi\` (CE4JWI-7/CUECA) | — |
| Bots (suite CE4JWI-10) | `C:\Users\javen\OneDrive\Desktop\BOT\bot_aprs_ce4jwi10\` (CE4JWI-10/HUASO) | — |
| Catálogo de actividades | `recursos/actividades.js` | `https://qsl.net/ce4jwi/recursos/actividades.js` |
| Cachebust actual de actividades | `recursos/actividades_20260916_42968cfe.js` | `https://qsl.net/ce4jwi/recursos/actividades_20260916_42968cfe.js` |
| Ranking que se está generando (vivo) | — (solo en web) | `https://qsl.net/ce4jwi/ranking_cueca.json` |
| Ranking congelado | `ranking-data/copihue/final.json` | `https://qsl.net/ce4jwi/ranking-data/copihue/final.json` |
| Plantilla para crear una página de ranking | `plantilla_ranking.html` | — |
| Página real de ejemplo (vivo) | `dia_nacional_de_la_cueca_2026.html` | `https://qsl.net/ce4jwi/dia_nacional_de_la_cueca_2026.html` |
| Página real de ejemplo (congelado) | `flor_nacional_el_copihue_2026.html` | `https://qsl.net/ce4jwi/flor_nacional_el_copihue_2026.html` |
| Script para subir todo por FTP | `subir_v18.py` (tiene usuario/clave FTP) | — |
| Este tutorial | `TUTORIAL_RANKING.md` | — |
| Script generador manual (lo creas con la sección 11) | `generar_ranking_manual.py` | — |

### FTP
- Servidor: `ftp.qsl.net`
- Usuario: `ce4jwi`
- Clave: (está dentro de `subir_v18.py`, búscala con "FTP_PASS" o similar)
- La carpeta raíz del sitio es `qsl.net/ce4jwi/` → en FTP, el contenido de esa
  carpeta es lo que ves por internet (`index.html`, `recursos/`, `ranking-data/`, ...).

---

## 3. LOS DOS TIPOS DE RANKING

### Tipo A: RANKING VIVO (mientras la actividad corre)
- El JSON se llama `ranking_cueca.json` (una palabra clave, en minúscula, sin espacios).
- Está en la **raíz del sitio web**.
- La página lo lee con: `fetch("ranking_cueca.json", { cache: "no-cache" })`.
- Solo sirve para mostrar "quién lleva más".

### Tipo B: RANKING CONGELADO (cuando la actividad termina)
- Queda como copia definitiva en `ranking-data/<clave>/final.json`.
- La página lo lee con: `fetch("ranking-data/copihue/final.json", { cache: "no-cache" })`.
- Es un "sello" permanente de cómo quedó el ranking final.

---

## 4. FORMATO DEL JSON DE RANKING (APRÉNDELO DE MEMORIA)

Este es el molde exacto que deben tener TODOS los rankings:

```json
{
  "ok": true,
  "actividad": "cueca",
  "nombre": "DIA NACIONAL DE LA CUECA 2026",
  "actualizado": "2026-09-17T11:02:19-04:00",
  "totalContactos": 66,
  "participantes": 66,
  "filas": [
    {
      "call": "XR4MAU",
      "total": 1,
      "modos": ["PKT"],
      "ultima": { "fecha": "16/09/2026", "hora": "23:03:57" }
    },
    {
      "call": "LW7EDH",
      "total": 2,
      "modos": ["PKT"],
      "ultima": { "fecha": "17/09/2026", "hora": "00:12:30" }
    }
  ]
}
```

Reglas del formato:
- `ok`: siempre `true` (booleano, sin comillas).
- `actividad`: clave corta en minúscula, sin espacios ni tildes (ej: `cueca`).
- `nombre`: nombre de la actividad (puede llevar mayúsculas).
- `actualizado`: fecha/hora con zona horaria `-04:00`. Formato ISO:
  `AAAA-MM-DDTHH:MM:SS-04:00`. El `T` es literal.
- `totalContactos`: cuántos QSO (contactos) en total.
- `participantes`: cuántas estaciones distintas (cada *call* cuenta 1 sola vez).
- `filas`: lista, **ordenada de mayor a menor** por `total`.
  - `call`: el indicativo (ce4jwi, xr4mau, ...). Siempra mayúsculas.
  - `total`: cuántos QSO hizo esa estación.
  - `modos`: lista con el modo (casi siempre `["PKT"]`).
  - `ultima.fecha` con formato `DD/MM/AAAA` y `ultima.hora` con `HH:MM:SS`.

---

## 5. EL PLAN EN 5 PASOS (RESUMEN)

1. **Leer el log** del bot (`.adi`) y **contar** los QSO por call.
2. **Generar el `.json`** con el script (sección 11) o a mano.
3. **Subir el `.json` por FTP** al sitio.
4. **Crear/ajustar la página HTML** (si no existe) y **registrar la actividad**
   en `recursos/actividades.js`.
5. **Subir todo por FTP** al sitio y **verificar** en internet.

---

## 6. PASO 1 — DÓNDE ESTÁN LOS CONTACTOS (EL ARCHIVO .ADI)

Los bots guardan los contactos en un archivo de texto con formato ADIF.

- Bot CE4JWI-7 (frase **CUECA**): `C:\Users\javen\OneDrive\Desktop\BOT\bot_aprs_ce4jwi\log_cueca.adi`
- Bot CE4JWI-10 (frase **HUASO**): `C:\Users\javen\OneDrive\Desktop\BOT\bot_aprs_ce4jwi10\log_huaso.adi`
- XR4MAU, CHINCHINEROS, etc., siguen el mismo patrón: buscas la carpeta del bot y el `.adi`.

Para **ver** el archivo: ábrelo con el Bloc de notas. Verás bloques como:

```
<QSO_DATE:8:20260916> <TIME_ON:6:233303> <CALL:6:XR4MAU> <MODE:3:PKT>
```

- `QSO_DATE`: fecha `AAAAMMDD`
- `TIME_ON`: hora `HHMMSS`
- `CALL`: indicativo del que contactó
- Cada bloque así es **un contacto** (un QSO).

> Si no quieres contar a mano: usa el script de la sección 11, que lo hace todo.

---

## 7. PASO 2 — GENERAR EL JSON DEL RANKING

### Opción 1: Con el script (RECOMENDADA)
1. Crea el archivo `generar_ranking_manual.py` (código completo en la sección 11).
2. Ábrelo con Python así (desde PowerShell, en la carpeta del repositorio):

   ```
   cd C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI
   python generar_ranking_manual.py "C:\Users\javen\OneDrive\Desktop\BOT\bot_aprs_ce4jwi\log_cueca.adi" Cueca
   ```

   Esto crea el archivo `ranking_cueca.json` en la raíz del repositorio.
   (El `2do argumento` "Cueca" es el nombre; la clave se saca en minúscula: `cueca`.)

3. Para **congelar** (ranking definitivo después de terminar):
   ```
   python generar_ranking_manual.py "C:\...\log_cueca.adi" Cueca --final
   ```
   Esto crea el archivo en `ranking-data/cueca/final.json`.

### Opción 2: A mano (si no hay Python)
- Abre el `.adi` y apunta en una hoja cada CALL que aparezca.
- Cuenta cuántas veces aparece cada call (= `total`).
- Ordena de mayor a menor.
- Rellena un JSON con el molde de la sección 4.
- Guárdalo con codificación UTF-8 y nombre `ranking_<clave>.json`.

---

## 8. PASO 3 — SUBIR POR FTP

Puedes subir con el propio `subir_v18.py` (el que usa opencode) modificando el
listado de archivos, o con cualquier cliente FTP (FileZilla):

1. Conéctate a `ftp.qsl.net`, usuario `ce4jwi`, con la clave de `subir_v18.py`.
2. Navega a la carpeta del sitio (la que tiene `index.html`).
3. **Ranking vivo**: sube `ranking_cueca.json` a la raíz.
4. **Ranking congelado**: sube el archivo a `ranking-data/cueca/final.json`
   (crea la carpeta `cueca` si no existe).
5. Cierra sesión.

> Nunca subas archivos mientras el bot esté escribiendo el mismo `.adi`.
> Espera un minuto o hazlo cuando la actividad haya terminado.

---

## 9. PASO 4 — LA PÁGINA Y EL CATÁLOGO (actividades.js)

### 9a. Si la página de la actividad YA EXISTE
- No toques nada de la página, solo asegúrate de que el `fetch` apunte al JSON correcto:
  - Vivo: `fetch("ranking_cueca.json", ...)`
  - Congelado: `fetch("ranking-data/cueca/final.json", ...)`
- Ejemplo real que ya funciona: `dia_nacional_de_la_cueca_2026.html` (vivo) y
  `flor_nacional_el_copihue_2026.html` (congelado).

### 9b. Si NO existe la página
1. Copia `plantilla_ranking.html` a un nombre como `copa_x_2026.html`.
2. Dentro de la copia:
   - Cambia el `<title>`, los encabezados, la descripción.
   - En el bloque del ranking, cambia la línea `fetch("...")` para apuntar al JSON.
3. Sube la página por FTP a la raíz del sitio.

### 9c. Registrar la actividad en `recursos/actividades.js`
Existe una lista llamada `const ACTIVIDADES = [...]` con bloques como este:

```js
{
  id: 68,
  title: "DIA NACIONAL DE LA CUECA 2026",
  image: "public/Dia_Nacional_de_la_Cueca_2026.webp",
  status: "EN VIVO",
  description: "Activación especial por el Día Nacional de la Cueca ...",
  date: "17 Septiembre 2026",
  url: "dia_nacional_de_la_cueca_2026.html",
},
```

- Agrega tu bloque al final (o edita uno existente).
- Toma un `id` nuevo (el último más 1). Al momento de escribir esto el mayor es 87.
- `status` puede ser: `PRÓXIMAMENTE`, `ACTIVO`, `EN CURSO`, `FINALIZADO` (74 entradas ya usan `FINALIZADO`, ese es el valor de cierre). Al GUARDAR el estado importa poco: `renderActivities()` lo pisa por fecha (`FINALIZADO` si la fecha ya paso, `ACTIVO` si hoy cae en el rango), asi que la tarjeta se actualiza sola al cambiar el dia.
- `url` debe ser el nombre del archivo `.html` de la actividad (SIN `recursos/`).

### 9d. Cachebust de actividades: **NO HAY, Y A PROPOSITO** (regla del 28-sep-2026)
Los navegadores y Cloudflare guardan en caché `actividades.js` (~60 min,
`s-maxage=3600`). Hubo una epoca en que el sitio usaba copias "frescas" con fecha
(`actividades_<AAAAMMDD>_<hash>.js`), pero el usuario lo prohibio explicitamente el
28-sep-2026 y se borraron todas las copias del repo.

Regla vigente, textual del usuario: **UN SOLO `actividades.js`, SIN COPIAS CON CACHEBUST**.

Si editaste `actividades.js`:
1. Edita SOLO `recursos/actividades.js`.
2. NO crees `actividades_<fecha>_<hash>.js`, NO re-apuntes los `.html` (los 114 lo
   referencian tal cual) y NO dejes copias en el repo.
3. Sube SOLO `recursos/actividades.js` por FTP.
4. Consecuencia ACEPTADA: el cambio puede tardar hasta ~1 h en verse. No es un bug y no
   se arregla con query strings, porque Cloudflare IGNORA el query string como clave de caché.

Ojo: esto NO afecta a que las tarjetas sean correctas. `renderActivities()` calcula el
estado por fecha, asi que una actividad que ya termino muestra FINALIZADO igual, aun
sirviendo el `.js` viejo desde el caché. Referencia real: cierre de RABIA 28-sep-2026.

> Regla del proyecto: MOJIBake = 0. Guarda TODO con **UTF-8 sin BOM** y escribiendo
> los nombres/archivos en ASCII puro (sin tildes raras ni símbolos rotos).

### 9e. Actualizar el estado al terminar
Cuando la actividad termina: cambia `status: "EN VIVO"` a `status: "FINALIZADO"`, sube
`recursos/actividades.js` por FTP y sube el ranking con `"congelado": true` a la raiz.
**NO repitas el paso 9d**: ya no hay cachebust que regenerar.

---

## 10. PASO 5 — VERIFICAR EN INTERNET (SIEMPRE HACERLO)

1. Abre `https://qsl.net/ce4jwi/dia_nacional_de_la_cueca_2026.html` en el navegador.
2. La pestaña del ranking debe mostrar la tabla con las estaciones y QSO.
3. Pulsa **Ctrl+F5** (recargar sin caché) si no aparece lo nuevo.
4. Comprueba que el link directo del JSON devuelve datos:
   `https://qsl.net/ce4jwi/ranking_cueca.json`
   - Debe verse el JSON (no un error 404, ni "Access Denied").
5. Revisa acentos: los textos deben verse bien (PRÓXIMAMENTE, Día, etc.).
   Si ves rombos raros o letras tipo "Ã¡" en vez de "á", el archivo se guardó
   mal (mojibake).

---

## 11. REQUISITO PARA OPENTODO (NO BORRAR ESTA SECCIÓN EVITAR)

El script generador `generar_ranking_manual.py` (cópialo y pega todo esto en un
archivo nuevo llamado exactamente `generar_ranking_manual.py`):

```python
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
    if sys.version_info[0] < 3:
        data = io.open(ruta, "r", encoding="latin-1").read()
    else:
        data = io.open(ruta, "r", encoding="utf-8", errors="replace").read()
    bloques = re.findall(r"<QSO_DATE:(\d+):|([A-Z0-9]+):[-.\d]+:|\r?\n", data)
    registros = []
    actual = {}
    estado = None
    for m in re.finditer(r"<([A-Z0-9]+):\d+(?::[^>]*)?>([^<]*)", data):
        clave, valor = m.group(1).upper(), m.group(2).strip()
        if clave == "EOR" or clave == "EOH":
            if actual and ("CALL" in actual):
                registros.append(actual)
            actual = {}
        else:
            actual[clave] = valor
    if actual and "CALL" in actual:
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
```

> NOTA: si al correr sale un error de Python, copia lo que dice y pásaselo a
> opencode cuando vuelva.

---

## 12. CHECKLIST FINAL (IMPRÍMELO / GUÁRDALO)

- [ ] Leí el `.adi` del bot correcto (frase/nombre de la actividad).
- [ ] Generé `ranking_cueca.json` (vivo) o `ranking-data/cueca/final.json` (final).
- [ ] El JSON tiene `ok: true`, `participantes` y `filas` con totales ordenados.
- [ ] Subí el JSON por FTP a la carpeta correcta.
- [ ] La página HTML existe y su `fetch("...")` apunta al archivo correcto.
- [ ] Edité `recursos/actividades.js` (agregar/cambiar la actividad con su id, status y url).
- [ ] Hice la copia nueva `actividades_AAAAMMDD_xxxx.js` en `recursos/`.
- [ ] Reemplacé la referencia al cachebust anterior en los 108 HTML.
- [ ] Subí por FTP: página HTML nueva, `actividades.js`, copia cachebust nueva, los HTML cambiados.
- [ ] Verifiqué en `https://qsl.net/ce4jwi/...` con Ctrl+F5.
- [ ] Sin mojibake: los acentos se ven bien.
- [ ] (Opcional) Commit y push en git para no perder el trabajo.

---

## 13. REGLAS DEL PROYECTO QUE NUNCA DEBES OLVIDAR

1. El sitio es **100% estático** (solo HTML, JS, JSON, imágenes y CSS). NO se usa
   Vercel, NO se crean carpetas `api/`, NI archivos `vercel.json`.
2. **MOJIBake = 0**: todo se guarda en UTF-8 sin BOM, y los scripts en ASCII puro.
3. No subas los `.adi` de los bots al sitio web.
4. Cuando edites un HTML, guarda copia con UTF-8. Revisa que no aparezcan
   rombos raros (carácter de reemplazo).
5. Los rankings vivos se sobreescriben; los finales se guardan en `ranking-data/<clave>/`.
6. subir_v18.py sube un conjunto fijo de archivos: si agregas uno nuevo, agrégale
   la ruta al listado del script (y sube aparte con FTP si es urgente).
7. Después de cada cambio visible al público, haz **commit** y **push** en git:
   ```
   cd C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI
   git add -A
   git commit -m "descripción corta"
   git pull --rebase
   git push
   ```