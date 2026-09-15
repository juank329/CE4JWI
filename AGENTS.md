# AGENTS.md — CE4JWI

Guía para el mantenimiento del sitio web CE4JWI en Vercel.

## Regla de oro: límite de 12 funciones serverless (plan Hobby)

Vercel Hobby permite **máximo 12 funciones serverless por deploy** (`/api/*.js`).
Si se agrega una función de más, el deploy falla con:
"En el plan Hobby, no se pueden agregar más de 12 funciones sin servidor a una implementación."

**Estado actual: 6 funciones en `api/` → 6 cupos libres.**

```
api/ranking-final.js       # TODAS las actividades congeladas (?actividad=<clave>)
api/calendario.js          # estático
api/get-solar.js           # solar
api/aprs-proxy.js          # proxy APRS
api/ranking-copihue.js     # EN VIVO: actividad Flor Nacional El Copihue (14-sep-2026, CE4JWI-10)
api/ranking-organillero.js # EN VIVO: actividad El Organillero (15-sep-2026, CE4JWI-10)
```

## Ciclo de vida de una actividad (para no volver a chocar con el límite)

1. **Actividad EN VIVO**: crear endpoint dedicado, ej. `api/ranking-<nueva>.js`
   que lea su ADIF en `https://qsl.net/ce4jwi` (y/o `qsl.net/xr4mau`),
   de la forma `fetch(BASE + "/log_<x>.adi")`. Esto suma 1 función, hay
   cupo de sobra (8 libres).

2. **Actividad TERMINADA / a congelar**: 
   - Generar `ranking-data/<clave>/final.json` (copia permanente en git,
     NO depende del ADIF de qsl.net).
   - En `vercel.json` agregar un rewrite hacia el endpoint genérico:
     `{ "source": "/api/ranking-<vieja>", "destination": "/api/ranking-final?actividad=<clave>" }`
   - **BORRAR** el endpoint dedicado `api/ranking-<nueva>.js`.
   
   Así el total de funciones nunca crece: cada actividad en vivo ocupa 1
   cupo y al cerrarse lo libera.

3. `vercel.json` ya tiene rewrites para TODAS las actividades congeladas:
   talca (`/api/ranking`), agosto, circo, septiembre (patria → `?actividad=septiembre`),
   vino, hitos-* (mina/rio/casona/parroquia), chilenidad, choripan y juegos.
   Todas apuntan a `/api/ranking-final?actividad=<clave>`.

## Endpoint genérico `api/ranking-final.js`

- Sirve `ranking-data/<actividad>/final.json` según `?actividad=<clave>`.
- Default: `talca` (por compatibilidad con `/api/ranking?actividad=talca`).
- Devuelve: `ok, actividad, nombre, actualizado, totalContactos,
  participantes, juegos (viene en el final.json si existe), filas, congelado:true, fuentes`.

## Formato de datos

- Páginas (`*.html`) leen de la API: `filas`, `participantes`, `totalContactos`,
  `actualizado`, `congelado` (y `juegos`, `nombre` en juegos).
- `ranking-data/` contiene una carpeta por actividad terminada con su `final.json`
  (talca, agosto, septiembre, circo, vino, hitos-mina, hitos-rio, hitos-casona,
  hitos-parroquia, chilenidad, choripan, juegos).

## Actividad EN VIVO: Flor Nacional El Copihue (14-sep-2026)

- Bot CE4JWI-10 (`config.json`): `frase_clave: COPIHUE`, `nombre_actividad: copihue` — solo APRS.
- ADIF fuente: `https://qsl.net/ce4jwi/log_copihue.adi` (el bot lo sube por FTP).
- Endpoint dedicado: `api/ranking-copihue.js` (lee el ADIF, `congelado:false`, `Cache-Control: no-store`).
- API responde en Vercel: `https://ce4jwi.vercel.app/api/ranking-copihue`.
- Página: `flor_nacional_el_copihue_2026.html` en `https://qsl.net/ce4jwi/`
  (fetch a la API de Vercel, refresh 60 s, badge "En vivo"). Banner: `public/FLOR NACIONALELCOPIHUE.webp`.
- Entry id 85 en `recursos/actividades.js` (status EN VIVO).
- **NO es día nacional**: es una actividad inventada por el usuario, no una conmemoración oficial.
- **Calendario NO se toca**: el usuario se encarga de eventos-calendario.json.
- Cachebust 14-sep-2026: nuevo JS versionado `actividades_20260914133103_5f3e9a35.js`
  (CDN qsl.net cachea .js 60 min e ignora query strings → nombre versionado).
  ~106 HTML actualizados a la nueva referencia (local y qsl.net).
- Al terminar la actividad (cuando el usuario lo diga): crear `ranking-data/copihue/final.json`
  + rewrite en vercel.json a ranking-final + BORRAR api/ranking-copihue.js.
  **Script de sello listo**: `C:\Users\javen\AppData\Local\Temp\opencode\sellar_copihue.py`
  (hace todo: lee ADIF final → final.json → rewrite → borra endpoint → status TERMINADA →
  cachebust → FTP). Ejecutar con `python sellar_copihue.py --e` cuando el usuario lo ordene;
  dry-run sin flags verifica. Al sellar, funciones pasan de 6 → 5.

## Actividad EN VIVO: El Organillero (15-sep-2026)

- Bot CE4JWI-10 (`config.json`): `frase_clave: ORGANILLERO`, `nombre_actividad: organillero` — solo APRS.
  **AÚN NO INICIADA**: el config sigue en COPIHUE hasta que el usuario la inicie; el ADIF aún no se carga.
- ADIF fuente: `https://qsl.net/ce4jwi/log_organillero.adi` (lo sube el bot por FTP cuando inicie).
- Endpoint dedicado: `api/ranking-organillero.js` (lee el ADIF, `congelado:false`, CORS `*`, `Cache-Control: no-store`).
- API responde en Vercel: `https://ce4jwi.vercel.app/api/ranking-organillero`.
- Página: `el_organillero_2026.html` en `https://qsl.net/ce4jwi/` (fetch a la API de Vercel, refresh 60 s, badge "En vivo"). Banner: `public/El Organillero.webp`, modos: `public/CE4JWI -10 SOLO APRS.webp`.
- Entry id 86 en `recursos/actividades.js` (status EN VIVO).
- **Fecha 15-sep-2026**: cuando el usuario la inicie, cambiar `config.json` de CE4JWI-10 a
  `frase_clave: ORGANILLERO` y `nombre_actividad: organillero`.
- Cachebust 14-sep-2026 23:49: nuevo JS versionado `actividades_20260914234945_e29274b5.js`
  (CDN qsl.net cachea .js 60 min e ignora query strings → nombre versionado).
  107 HTML actualizados a la nueva referencia (local y qsl.net).
- Al terminar la actividad (cuando el usuario lo diga): crear `ranking-data/organillero/final.json`
  + rewrite en vercel.json a ranking-final + BORRAR api/ranking-organillero.js.

## Lo que se hizo (historial relevante)

- Consolidación a 4 funciones (2 commits de sept 2026):
  - `api/ranking-chilenidad.js`, `ranking-choripan.js`, `ranking-juegos.js`
    → fundidos en `ranking-final.js` (rewrites conservan las URLs).
  - Luego `ranking.js`, `ranking-agosto.js`, `ranking-circo.js`,
    `ranking-patria.js`, `ranking-vino.js`, `ranking-hitos.js` también
    → `ranking-final.js` + rewrites.
  - Widget "Top Indicativos" de la barra lateral ELIMINADO junto con
    `api/ranking-general.js` (no hay ranking general en el sidebar;
    el ranking por actividad vive en cada página).
- PRECAUCIÓN: jamás reintroducir `ranking-general.js` ni un widget que
  consuma más funciones si no se libera antes el cupo.

## Entorno

- Repo: https://github.com/juank329/CE4JWI (rama `main`), deploy automático en Vercel
  (sitio: https://ce4jwi.vercel.app). Push a `main` dispara el deploy.
  Si no auto-despliega, el usuario hace **Redeploy** en
  https://vercel.com/juank329/ce4jwi/deployments (NO hay CLI ni tokens).
- En Windows PowerShell: no borrar archivos `*.respaldo_*`, `*.eliminado_*`
  (son copias de seguridad del usuario).
- Los `final.json` viven en git; borrar ADIF en qsl.net NO afecta los rankings congelados.

## Bot QSL APRS (Desktop\BOT)

### Ubicación y bots activos
- `C:\Users\javen\OneDrive\Desktop\BOT\bot_aprs_ce4jwi\bot_qsl_ce4jwi.py` → **CE4JWI-7**
- `C:\Users\javen\OneDrive\Desktop\BOT\bot_aprs_ce4jwi10\bot_qsl_ce4jwi.py` → **CE4JWI-10**
- `C:\Users\javen\OneDrive\Desktop\BOT\bot_aprs_xr4mau\bot_qsl_xr4mau.py` → **XR4MAU-7**
- `C:\Users\javen\OneDrive\Desktop\BOT\bot_aprs_xr4mau10\bot_qsl_xr4mau.py` → **XR4MAU-10**
- Todos suben por FTP a `ftp.qsl.net` → `/ce4jwi` (misma carpeta).

### Cambios realizados 14-sep-2026
- **msg4 (despedida)** en CE4JWI-7 y CE4JWI-10 (automático + manual):
  - De: `73 from {FIRMA_MSJ}`
  - A: `Thanks for the QSO! Visit https://qsl.net/ce4jwi/ 73 {FIRMA_MSJ}`
  - XR4MAU-7/-10 **sin cambios**.
- **Consola (L775)** en los 4 bots: corregido `.webp` → `.jpg` (el bot guarda `.jpg` real).
- **Auto CQ** en `panel_qsl.py` de los 4 bots activos (CE4JWI-7/-10, XR4MAU-7/-10): intervalo `1200` (20 min) y luego `600` (10 min) → **`300` (5 min)**. Textos del panel (.py y .html) actualizados a "5 min". CA4NDW **no se toca**.
- **Header ADIF completo ADIF**: los 4 bots antes escribían 2 líneas de texto plano (`ADIF Export...`, `Created automatically`) en el encabezado → QRZ avisaba "error ADIF" (pero importaba igual). Corregido: ahora `<COMMENT:n>…` válidos en `guardar_adif`.

### Reglas importantes
- El usuario escribe en **MAYÚSCULAS** y es impaciente.
- **"PREGUNTAME CUALQUIER CAMBIO"** antes de ejecutar — siempre preguntar primero.
- No tocar `.respaldo_*` ni `.resp_*` (copias de seguridad del usuario).
- Ignorar CA4NDW — solo trabajar con CE4JWI y XR4MAU. (Significa: no trabajar sobre los bots/folders de CA4NDW).
- **NUNCA eliminar CA4NDW**: sus QSO quedan SIEMPRE en ADIF/ranking (confirmado por el usuario, 15-sep-2026). No filtrarla en endpoints ni en la web.
- **Auto-guardar**: SIEMPRE actualizar AGENTS.md al final de cada sesión con todos los cambios hechos. Commitear sin preguntar. La cuota de IA se agota a veces y el contexto se pierde — la memoria en AGENTS.md es lo único que persiste.