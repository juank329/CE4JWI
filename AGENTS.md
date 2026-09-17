# AGENTS.md — CE4JWI

Guía para el mantenimiento del sitio web CE4JWI en qsl.net — **100% ESTÁTICO, SIN Vercel** (desde 15-sep-2026).

## Regla de oro: NO reintroducir Vercel

- Se borraron `api/*.js` (los 5 endpoints) y `vercel.json` (15-sep-2026).
- **NO crear `/api/*` ni restaurar `vercel.json`**: la web no tiene backend;
  todo ranking se sirve como JSON estático. El sitio `ce4jwi.vercel.app` queda solo como estática de respaldo.

## Ciclo de vida de una actividad (100% estático)

1. **Actividad EN VIVO** (bot APRS):
   - Configurar `config.json` del bot: `frase_clave` + `nombre_actividad` (el ranking usa `nombre_actividad`).
   - El bot genera `ranking_<actividad>.json` automáticamente en cada QSO (función `generar_ranking_json`,
     en `bot_qsl_ce4jwi10/bot_qsl_ce4jwi.py`) y lo sube por FTP a `https://qsl.net/ce4jwi/ranking_<actividad>.json`.
   - Página: `fetch("ranking_<actividad>.json", { cache: "no-cache" })`, badge "En vivo".
   - Entry en `recursos/actividades.js` status EN VIVO + cachebust del JS versionado + actualizar HTML.

2. **Actividad TERMINADA / a congelar**:
   - Generar `ranking-data/<clave>/final.json` (copia permanente en git, NO depende del ADIF de qsl.net).
   - Página: `fetch("ranking-data/<clave>/final.json", { cache: "no-cache" })`, badge "Finalizado".
   - En `recursos/actividades.js` pasar el entry a TERMINADA + cachebust + actualizar HTML.
   - Ya NO hay rewrites ni endpoints que borrar (Vercel fuera).

3. Actividades congeladas hoy: talca, agosto, septiembre, circo, vino, hitos-mina,
   hitos-rio, hitos-casona, hitos-parroquia, chilenidad, choripan, juegos, copihue.

## Formato de datos

- Páginas (`*.html`) leen de un JSON estático: `filas`, `participantes`, `totalContactos`,
  `actualizado`, `congelado` (y `juegos`, `nombre` en juegos). En vivo → `ranking_<actividad>.json`;
  congelado → `ranking-data/<clave>/final.json`.
- `ranking-data/` contiene una carpeta por actividad terminada con su `final.json`
  (talca, agosto, septiembre, circo, vino, hitos-mina, hitos-rio, hitos-casona,
  hitos-parroquia, chilenidad, choripan, juegos, **copihue**).

## Actividad TERMINADA: Flor Nacional El Copihue 2026 (sellada 15-sep-2026)

- **SELLADA** (15-sep 00:03) con `sellar_copihue.py --e`: último ADIF 83 QSO / 83 estaciones.
- `ranking-data/copihue/final.json` en git + subido a qsl.net
  (`https://qsl.net/ce4jwi/ranking-data/copihue/final.json`, congelado=true, 83 QSO).
- Entry id 85 en `recursos/actividades.js` → status **TERMINADA**, badge "Finalizado".
- Página `flor_nacional_el_copihue_2026.html`: fetch `ranking-data/copihue/final.json`, sin "Cada contacto suma 1 punto".

## Actividad EN VIVO: El Organillero (15-sep-2026)

- Bot CE4JWI-10 (`config.json`): `frase_clave: ORGANILLERO`, `nombre_actividad: ORGANILLERO` — solo APRS.
  **INICIADA 15-sep 00:16**. ADIF en la máquina: `Desktop\BOT\bot_aprs_ce4jwi10\log_organillero.adi` (sube por FTP).
- ADIF fuente web: `https://qsl.net/ce4jwi/log_organillero.adi`.
- Ranking: el bot genera y sube `ranking_organillero.json` en cada QSO (`generar_ranking_json`).
  Inicial verificado: 48 QSO == lo que devolvía la API de Vercel antes de eliminarla.
- ✅ Bot CE4JWI-10 REINICIADO por el usuario (15-sep, PID 10564) — ya corre con `generar_ranking_json`.
- Página: `el_organillero_2026.html` → `fetch("ranking_organillero.json", { cache: "no-cache" })`,
  refresh 60 s, badge "En vivo". Banner: `public/El Organillero.webp`, modos: `public/CE4JWI -10 SOLO APRS.webp`.
- Entry id 86 en `recursos/actividades.js` (status EN VIVO).
- Al terminar la actividad: crear `ranking-data/organillero/final.json` + página apunta a él + cachebust.

## Actividad EN VIVO: Día Nacional de la Cueca 2026 (16-sep-2026)

- Bot **CE4JWI-7** (`Desktop\BOT\bot_aprs_ce4jwi`): `frase_clave: CUECA`, `nombre_actividad: CUECA` — solo APRS.
- ✅ **16-sep-2026**: se agregó a CE4JWI-7 el mismo `generar_ranking_json` del CE4JWI-10
  (funciones `_leer_qsos_adif` + `generar_ranking_json`, import `from functools import cmp_to_key`,
  y llamada `generar_ranking_json(nombre_log)` en `guardar_adif`) → ya sube `ranking_cueca.json`
  por FTP en cada QSO automáticamente.
- ✅ Bot CE4JWI-7 REINICIADO/relanzado (16-sep, nuevo PID) — correlado con `python -u bot_qsl_ce4jwi.py`.
- Página: `dia_nacional_de_la_cueca_2026.html` → `fetch("ranking_cueca.json", { cache: "no-cache" })`,
  refresh 60 s, badge "En vivo". Banner: `public/Dia_Nacional_de_la_Cueca_2026.webp`,
  modos: `public/CE4JWI SOLO APRS.webp`. Sin "CQ CUECA"/"DMR".
- Entry id 68 en `recursos/actividades.js` (status EN VIVO).

## Actividad EN VIVO: Día del Huaso y de la Chilenidad 2026 (16-sep-2026)

- Bot **CE4JWI-10** (`Desktop\BOT\bot_aprs_ce4jwi10`): `frase_clave: HUASO`, `nombre_actividad: HUASO` — solo APRS.
- Ranking: lo genera el bot CE4JWI-10 (`generar_ranking_json`) → `ranking_huaso.json` subido por FTP en cada QSO. NO tocar.
- Página: `dia_del_huaso_y_de_la_chilenidad_2026.html` →
  `fetch("ranking_huaso.json", { cache: "no-cache" })`, refresh 60 s, badge "En vivo".
  Banner: `public/dia del huado y de la chilenidad 2026.webp`,
  modos: `public/CE4JWI -10 SOLO APRS.webp`. Sin "CQ HUASO"/"DMR".
- Entry id 69 en `recursos/actividades.js` (status EN VIVO).

## Cachebust actividades (16-sep-2026, Cueca + Huaso)

- Editadas las entradas id 68 (Cueca) e id 69 (Huaso) en `recursos/actividades.js`:
  status EN VIVO y descripción "Solo APRS con la frase CUECA/HUASO a CE4JWI-7/CE4JWI-10".
- Nuevo cachebust: `recursos/actividades_20260916_42968cfe.js` (sha256[:8] del contenido), **108/108 HTML** re-apuntados.
- Subido por FTP (6 piezas): 2 páginas + cachebust + actividades.js + 2 imágenes de modo. Verificado HTTP 200 en producción.

## Descarte de Vercel (15-sep-2026, COMPLETADO)

PASO 4 COMPLETADO: se BORRARON del repo `api/*.js` (los 5 endpoints: ranking-final,
calendario, get-solar, aprs-proxy, ranking-organillero) y `vercel.json`. Push disparó
deploy; `ce4jwi.vercel.app` queda solo como estática de respaldo. Los respaldos del
usuario dentro de `api/` se conservaron (`.respaldo_*`). **NO reintroducir endpoints ni
vercel.json**: la web no tiene backend. Ya NO existe dependencia de Vercel en qsl.net/ce4jwi.

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
- Este historial de consolidación (ranking-final.js + rewrites) era para el
  flujo con Vercel. **Ya NO aplica**: la web es 100% estática y no hay límite de funciones.

## Entorno

- Repo: https://github.com/juank329/CE4JWI (rama `main`). Push a `main` = respaldo/versionado (NO deploy).
- Publicación real: FTP a `ftp.qsl.net` (user ce4jwi) → carpeta `/ce4jwi` (sitio: https://qsl.net/ce4jwi/).
  CDN qsl.net cachea `.js` 60 min e ignora query strings → cachebust con nombre versionado
  (`<archivo>_YYYYMMDD.js`) y actualizar los HTML que lo referencian.
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
- **Auto CQ** en `panel_qsl.py` de los 4 bots activos (CE4JWI-7/-10, XR4MAU-7/-10): intervalo `300` (5 min) → **`600` (10 min)** (15-sep-2026). Textos del panel (.py y .html) actualizados a "10 min" en los 4 bots. CA4NDW **no se toca**.
- **Header ADIF completo ADIF**: los 4 bots antes escribían 2 líneas de texto plano (`ADIF Export...`, `Created automatically`) en el encabezado → QRZ avisaba "error ADIF" (pero importaba igual). Corregido: ahora `<COMMENT:n>…` válidos en `guardar_adif`.

### Reglas importantes
- El usuario escribe en **MAYÚSCULAS** y es impaciente.
- **"PREGUNTAME CUALQUIER CAMBIO"** antes de ejecutar — siempre preguntar primero.
- No tocar `.respaldo_*` ni `.resp_*` (copias de seguridad del usuario).
- Ignorar CA4NDW — solo trabajar con CE4JWI y XR4MAU. (Significa: no trabajar sobre los bots/folders de CA4NDW).
- **NUNCA eliminar CA4NDW**: sus QSO quedan SIEMPRE en ADIF/ranking (confirmado por el usuario, 15-sep-2026). No filtrarla en endpoints ni en la web.
- **Auto-guardar**: SIEMPRE actualizar AGENTS.md al final de cada sesión con todos los cambios hechos. Commitear sin preguntar. La cuota de IA se agota a veces y el contexto se pierde — la memoria en AGENTS.md es lo único que persiste.

## Motor i18n ES|EN (idioma_20260915.js) — 15-sep-2026
- `recursos/idioma_20260915.js` define `window.I18N` tras **DOMContentLoaded** (detección: `localStorage["ce4jwi_idioma"]` en `esp|en` activo; EN solo si la clave vale `"en"`, `"eng"`, `"english"` → `en`).
- API expuesta: `I18N.t(clave)`, `t(es,enOpcional)` (fallback=es), `I18N.formatear(clave,datos)`, `I18N.cambiarIdioma(lang)` (solo `es`/`en`; guarda en localStorage y hace `location.reload()`), `I18N.es()`, `I18N.actual()`, `I18N.aplicarDom()`, `I18N.aplicarRanking()`, `I18N.aplicarTodo()`.
- **data-i18n**: traduce `[data-i18n]` (textContent), `[data-i18n-ph]` (placeholder), `[data-i18n-val]` (value), `[data-i18n-title]` (title) y fija `document.documentElement.lang`. Aplica hasta **99 claves** repetidas en ambos idiomas.
- **Ranking (MutationObserver)**: re-traduce dinámicamente el ranking APRS (`estado.enVivo/FINALIZADO`, `ranking.enVivo`, `total-badge`, th `Indicativo`→Callsign, `País`→Country, etc.) porque esas tablas se re-pintan en español por `actividades_*.js` cada 60 s. Mantiene el observer activo también tras cambios de idioma.
- **Selector en AGENTS**: `[data-i18n]="clave"`. En EN la etiqueta va en diccionario (EN); las frases propias de la actividad (callsign, frase APRS, país) **no** se traducen.
- **Cachebust**: versionado `idioma_20260915.js`, `componentes_20260915.js`, `script_20260915.js`, `calendario_20260915.js`, `buscador-qsl_20260916.js` (CDN qsl.net ignora query strings, por eso se renombra el archivo). NO reintroducir `/api/*` (Vercel eliminado).
- Order: `idioma` DEBE cargarse ANTES que `componentes` (defer no garantiza orden — usar carga síncrona al final del body o `defer` con el orden en el HTML).
- El botón ES|EN vive en el navbar (inyectado por `componentes.js`, función `marcarBotonIdioma()`), con `data-i18n` solo para el tooltip/título.