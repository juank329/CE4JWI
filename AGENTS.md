# AGENTS.md — CE4JWI

Guía para el mantenimiento del sitio web CE4JWI en Vercel.

## Regla de oro: límite de 12 funciones serverless (plan Hobby)

Vercel Hobby permite **máximo 12 funciones serverless por deploy** (`/api/*.js`).
Si se agrega una función de más, el deploy falla con:
"En el plan Hobby, no se pueden agregar más de 12 funciones sin servidor a una implementación."

**Estado actual: 5 funciones en `api/` → 7 cupos libres.**

```
api/ranking-final.js       # TODAS las actividades congeladas (?actividad=<clave>)
api/calendario.js          # estático
api/get-solar.js           # solar
api/aprs-proxy.js          # proxy APRS
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
   - En `recursos/actividades.js` pasar el entry a status TERMINADA.
   - Hacer cachebust (nuevo JS versionado) y actualizar los ~107 HTML.
   
   Así el total de funciones nunca crece: cada actividad en vivo ocupa 1
   cupo y al cerrarse lo libera. Ejemplo ya hecho: **Copihue** (15-sep-2026).

3. `vercel.json` ya tiene rewrites para TODAS las actividades congeladas:
   talca (`/api/ranking`), agosto, circo, septiembre (patria → `?actividad=septiembre`),
   vino, hitos-* (mina/rio/casona/parroquia), chilenidad, choripan, juegos y **copihue**.
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
  hitos-parroquia, chilenidad, choripan, juegos, **copihue**).

## Actividad TERMINADA: Flor Nacional El Copihue 2026 (sellada 15-sep-2026)

- **SELLADA** (15-sep 00:03) con `sellar_copihue.py --e`: último ADIF 83 QSO / 83 estaciones.
- `ranking-data/copihue/final.json` en git (congelado, no depende del ADIF).
- `vercel.json`: rewrite `/api/ranking-copihue` → `/api/ranking-final?actividad=copihue`.
- `api/ranking-copihue.js` **BORRADO** (funciones 6 → 5).
- Entry id 85 en `recursos/actividades.js` → status **TERMINADA**.
- Cachebust 15-sep-2026 00:03: JS versionado `actividades_20260915000322_452461df.js`,
  107 HTML actualizados (local y qsl.net).
- Página `flor_nacional_el_copihue_2026.html`: badge → "Finalizado", sin "Cada contacto suma 1 punto".
- API verificado: `https://ce4jwi.vercel.app/api/ranking-copihue` devuelve `congelado:true`, 83 contactos.

## Actividad EN VIVO: El Organillero (15-sep-2026)

- Bot CE4JWI-10 (`config.json`): `frase_clave: ORGANILLERO`, `nombre_actividad: ORGANILLERO` — solo APRS.
  **INICIADA 15-sep 00:16** (config ya modificada; el bot corre en la máquina del usuario).
  ADIF en la máquina: `Desktop\BOT\bot_aprs_ce4jwi10\log_organillero.adi` (sube por FTP).
- ADIF fuente web: `https://qsl.net/ce4jwi/log_organillero.adi`.
- Endpoint dedicado: `api/ranking-organillero.js` (lee el ADIF, `congelado:false`, CORS `*`, `Cache-Control: no-store`).
- API responde en Vercel: `https://ce4jwi.vercel.app/api/ranking-organillero`.
- Página: `el_organillero_2026.html` en `https://qsl.net/ce4jwi/` (fetch a la API de Vercel, refresh 60 s, badge "En vivo"). Banner: `public/El Organillero.webp`, modos: `public/CE4JWI -10 SOLO APRS.webp`.
- Entry id 86 en `recursos/actividades.js` (status EN VIVO).
- Cachebust 14-sep-2026 23:49: JS versionado `actividades_20260914234945_e29274b5.js`;
  tras el sello de Copihue (00:03) los HTML pasaron a `actividades_20260915000322_452461df.js`
  (aplica a todas las páginas, incluida el organillero).
- Al terminar la actividad: crear `ranking-data/organillero/final.json`
  + rewrite en vercel.json a ranking-final + BORRAR api/ranking-organillero.js + cachebust.

## Frase y badge de puntos (15-sep-2026)

- Se ELIMINÓ la frase "Cada contacto suma <strong>1 punto</strong>." de todas las páginas
  de actividad (incluida la variante de juegos "…por juego. Máximo: 6 puntos (colección completa)").
- Badge de actividades cerradas: `<span class="ranking-live">En vivo</span>` → 
  `<span class="ranking-live finalizado">Finalizado</span>`. Las EN VIVO conservan "En vivo".
  Septiembre: "Cerrado" → "Finalizado".
- Aplicado en: stephanie, vino, choripan, organillero, circo, juegos, copihue, hitos-rio,
  hitos-parroquia, hitos-mina, hitos-casona, chilenidad, septiembre, plantilla_ranking.html.
  Todo subido por FTP a qsl.net.

## Arreglos post-sello (15-sep-2026)

- **Fix CORS ranking-final.js**: `api/ranking-final.js` no enviaba
  `Access-Control-Allow-Origin: *` → los fetch de las actividades finalizadas eran
  bloqueados por el navegador y el ranking se veía VACÍO. Agregada la cabecera.
  Verificado en `/api/ranking-copihue` y `/api/ranking-vino` (CORS `*`).
- **Bandera HQ1ERL (Honduras)**: `banderas.js` no mapeaba el prefijo `HQ` (solo `HR`).
  Agregado `"HQ":"HN"`. PRECAUCIÓN: qsl.net cachea `.js` 60 min e ignora query strings → 
  se cachebusteó a `banderas_20260915.js` (nuevo nombre) y las 19 páginas que lo
  referenciaban ahora apuntan al archivo versionado.
- **Orden buscador QSL** (`buscador-qsl.js`): ordenaba solo por `fecha` → al haber
  2 QSL del mismo día (Copihue 15/09 02:52 vs Organillero 15/09 03:02) quedaba la de
  Copihue primero (orden alfabético del archivo). Ahora ordena **fecha + hora + archivo**
  descendente para que la más nueva salga primero. Cachebust → `buscador-qsl_20260915.js`
  y `descargar-qsl.html` apunta al archivo versionado.

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