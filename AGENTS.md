# AGENTS.md — CE4JWI

Sitio web del indicativo CE4JWI en **qsl.net**. 100% estático HTML/CSS/JS/JSON/imágenes. Sin backend, sin build.

## Reglas inviolables

- **NO Vercel**: nunca crear `api/*` ni `vercel.json`. Se eliminaron (15-sep-2026). Todo ranking se sirve como JSON estático.
- **Mojibake = 0**: scripts que escriben archivos en ASCII puro (escapes `\uXXXX` en literales Python). Tras cada escritura verificar `U+FFFD` = 0 (regex `\u00c0-\u00c3[^\u0000-\u007f]` para detectar mojibake de acentos). Nunca heredocs con acentos crudos.
- **Git flow**: `git add -A` → `commit` → `pull --rebase` → `push`. El push a `main` solo versiona (NO hace deploy).
- **Auto-guardar memoria**: al final de cada sesión actualizar `AGENTS.md` con lo hecho y commitear (la cuota de IA se agota y AGENTS.md es lo único que persiste). Historial largo → `MEMORIA_PROYECTO_CE4JWI.md`.
- **Preguntar antes de ejecutar**: el usuario escribe en MAYÚSCULAS, es impaciente y quiere que se consulte cualquier cambio antes de aplicarlo.

## Publicación real = FTP (no git)

- `ftp.qsl.net` usuario `ce4jwi`. Credenciales viven en `subir_v18.py` (raíz) y en el `config.json` de cada bot.
- Sitio: `https://qsl.net/ce4jwi/`. Subir preservando `recursos/` y `public/`.
- **CDN qsl.net cachea `.js` 60 min e ignora query strings** → los .js compartidos se versionan por nombre: `<archivo>_YYYYMMDD_<hash8>.js` y todos los HTML se re-apuntan al nuevo nombre.
- `subir_v18.py` sube todos los `*.html` de la raíz + `idioma_*.js` + `componentes_*.js`; revisar su lista antes de depender de ella (archivos nuevos no se suben solos).
- Verificación: `User-Agent: Mozilla/5.0` hacia qsl.net, comprobar FFFD=0 y HTTP 200.

## Cachebusts VIVOS (únicos referenciados — SÓLO estos existen en producción)

- `actividades_20260921_47a4dea3.js` (110 HTML) ← catálogo de actividades (incluye id 91 CONDORITO). `index.html` usa `recursos/actividades.js` a propósito (no cachebust).
- `componentes_20260916_f089c287.js` (29) ← header/sidebar/footer/menú
- `idioma_20260918.js` (29) ← motor i18n ES|EN
- `banderas_20260916.js` (23) ← banderas en rankings
- `script_20260915.js`, `calendario_20260915.js`, `buscador-qsl_20260916.js`
- Cachebust nuevo de actividades: `sha256[:8]` del contenido + fecha; re-apuntar los 108 HTML; subir cachebust + actividades.js + HTML por FTP.

## Ciclo de vida de una actividad

1. **Página**: clonar la actividad EN VIVO más reciente (patrón: `los_chinchineros_2026.html` o `dia_nacional_de_la_cueca_2026.html`). `fetch("ranking_<actividad>.json", { cache: "no-cache" })`, refresh 60 s, badge `En vivo`. NUNCA frase "Cada contacto suma 1 punto" ni "DMR" si es solo APRS.
2. **Bot**: `config.json` del bot → `frase_clave` + `nombre_actividad`. El bot genera `log_<limpio>.adi` y sube `ranking_<limpio>.json` en cada QSO (`generar_ranking_json` en `bot_qsl_*.py`). NO generar rankings de actividades EN VIVO a mano.
3. **Catálogo**: entrada en `recursos/actividades.js` (id nuevo = último+1, status `PRÓXIMAMENTE`/`EN VIVO`/`TERMINADA`) + cachebust nuevo de actividades + re-apuntar 108 HTML.
4. **Terminar**: `ranking-data/<clave>/final.json` (copia permanente en git, congelado=true), página pasa a `fetch("ranking-data/<clave>/final.json")`, entrada → TERMINADA, badge `Finalizado`. Los final.json viven en git; borrar el ADIF en qsl.net NO afecta rankings congelados.
5. **FTP + verificar en producción** (Ctrl+F5; CDN cachea).

## Bots APRS (viven en Desktop, NO en el repo)

- `C:\Users\javen\OneDrive\Desktop\BOT\bot_aprs_ce4jwi\bot_qsl_ce4jwi.py` → **CE4JWI-7**
- `C:\Users\javen\OneDrive\Desktop\BOT\bot_aprs_ce4jwi10\bot_qsl_ce4jwi.py` → **CE4JWI-10**
- `…\bot_aprs_xr4mau\bot_qsl_xr4mau.py` → XR4MAU-7, `…\bot_aprs_xr4mau10\bot_qsl_xr4mau.py` → XR4MAU-10
- **Reiniciar bots SIEMPRE con su `.bat`** (`iniciar_ce4jwi.bat`, `iniciar_ce4jwi10.bat`, …) con ventana visible. NUNCA `Start-Process -WindowStyle Hidden` (los bots "no abren").
- **CA4NDW: nunca tocar sus bots, y sus QSO siempre quedan en ADIF/ranking.**
- Auto-CQ cada **5 min** (`time.sleep(300)` en `_hilo_cq_automatico` de `panel_qsl.py`) en CE4JWI-7/-10 y XR4MAU-7/-10. En CA4NDW-7 el CQ auto va integrado en el bot (`_hilo_cq_auto`).
- `panel_qsl.py` edita `config.json` en runtime; `bot_qsl_*.py` lo lee al arrancar (frase, log, ranking).
- Estado 18-sep-2026: CE4JWI-7 (CUECA) APAGADO tras sellar ranking. CE4JWI-10 corriendo en `bot_ce4jwi10_telegram` (TODO-EN-UNO APRS+Telegram, config **PRIMERA JUNTA** 18-sep, PID 16080) → `log_primera_junta.adi` + `ranking_primera_junta.json`. XR4MAU-7/-10 cerrados por el usuario (código 5-min + generar_ranking_json queda en disco).
- suben por FTP a la misma carpeta `/ce4jwi`.

## Actividades actuales

- id 68 CUECA (CE4JWI-7, **FINALIZADO**) y id 69 HUASO (CE4JWI-10, **FINALIZADO**) → sellados en `ranking-data/cueca/final.json` y `ranking-data/huaso/final.json` (congelado=true).
- id 87 Chinchineros (EN VIVO, CE4JWI-10) → `ranking_chinchineros.json`; id 88 Primera Junta Nacional de Gobierno 2026 (**PRÓXIMAMENTE**, 18-sep, CE4JWI-10, frase PRIMERA JUNTA) → `ranking_primera_junta.json`; id 90 Magallanes (**PRÓXIMAMENTE**, 20-sep, frase MAGALLANES) → `ranking_MAGALLANES.json`.
- **id 72 PAZ (**FINALIZADO**, sellado 21-sep 22:5x)**: página `dia_internacional_de_la_paz_2026.html` con ranking bloque "Finalizado" → `fetch("ranking-data/paz/final.json")`; `ranking-data/paz/final.json` (15 QSO / 15 estaciones, congelado=true). Status id 72 → FINALIZADO en actividades. Deploy: cachebust `actividades_20260921_0f1972c9.js` + 110 HTML + FTP (crear carpeta remota `ranking-data/paz`).
- **id 91 CONDORITO (EN VIVO, inició 00 UTC)**: actividad CONJUNTA CA4NDW-7 + CE4JWI-10. Página `personajes_de_condorito_2026.html` (portada `public/Actividad de Condorito.webp` sola, sin imagen de modos, columna **Personaje** con chips YAYITA=violeta/CA4NDW y CONDORITO=azul/CE4JWI). **Ranking CONJUNTO = `ranking_condorito_conjunta.json`** (en ambas webs). El bot CE4JWI-10 escribe `ranking_condorito.json` en cada QSO ⇒ NO usar ese nombre para el merge o lo pisa. **NO generar a mano**: correr `generar_ranking_condorito.py` (baja `log_yayita.adi` de ca4ndw + `log_condorito.adi` de ce4jwi, une por call sumando QSO y chips, sube a CE4JWI y CA4NDW; `--no-subir` solo local; `--final` congela + final.json). Bots: CA4NDW-7 en `C:/Users/javen/OneDrive/Desktop/condorito/bot_aprs_ca4ndw` (frase YAYITA), CE4JWI-10 en `…\BOT\bot_ce4jwi10_telegram` (frase CONDORITO). id 91 CONDORITO va en **21-30 Septiembre 2026** (rango) en actividades para que quede ACTIVO/primero en las tarjetas hasta su fin (~10 días; tras el 30-sep vuelve solo a FINALIZADO). Sort de tarjetas en `script_20260915.js` prioriza actividades en curso (`esActivaFecha`). `index.html` usa cachebust `recursos/actividades_20260922.js`. Deploy 21-sep: cachebust `actividades_20260921_0f1972c9.js` + 110 HTML + FTP OK + git push.
- **Página solo-ranking para compartir**: `ranking_condorito_en_vivo.html` (tabla sola, auto-contenida, `fetch("ranking_condorito_conjunta.json?v=1")`, banderas). Ideal para iframe en Blogger. URL: https://qsl.net/ce4jwi/ranking_condorito_en_vivo.html
- **Parser ADIF bots**: los `<EOR>`/`<EOH>` vienen SIN dato (pelados) en los logs de los bots ⇒ cualquier regex de ADIF debe capturar también el tag pelado o cuenta 1 solo registro. Corregido en `generar_ranking_condorito.py` y `generar_ranking_manual.py` (este último además ya pone `congelado:true` con `--final`).
- **CA4NDW-7 CQ auto (21-sep)**: integrado en `bot_qsl_ca4ndw.py` (`_hilo_cq_auto`, config `cq_auto_activo`/`cq_auto_intervalo_min`/`cq_auto_texto` en `config.json`); texto con `{qso}` muestra el contador. Cada 5 min. **22-sep**: se quitó el tramo "CQ CONDORITO 2026" del texto (es el nombre de actividad que cambia); quedó `CA4NDW-7 Ref 01 YAYITA - Van {qso} QSOs - Envia la palabra YAYITA...`. Bots con consola coloreada (helper `clr`/`_habilitar_vt`); CE4JWI-10: línea celeste en envíos Telegram + `[CONTADOR] Van N QSOs en la actividad.` en verde.
- Pendiente: recordar al usuario **MAÑANA (22-sep-2026) a las 21:00** (acordar algo pendiente).
- Congeladas (ranking-data): talca, agosto, septiembre, circo, vino, hitos-*, chilenidad, choripan, juegos, copihue, organillero, **cueca, huaso**.

## Widget Telegram QR en sidebar (corregido 18-sep-2026)

- Widget `widget-telegram` (icono Telegram + QR clickeable → `https://t.me/Ce4jwi_qsl_bot`) está en TODOS los HTML vía `componentes.js` + cachebust.
- **QR final = `public/qr_telegram_main.png`** (540×540, generado DESDE EL TEXTO con `qrcode`, quiet zone de 8 módulos). **NUNCA recortar/rotar un QR de una imagen** por zxing/pil: sale chueco o cortado a la mitad y no decodifica. Si el QR se ve mal → regenerar desde el texto.
- URL de la imagen **sin espacios** (`qr_telegram_main.png`) → evita caché vieja del navegador (espacio+nombre repetido = el navegador sirve la imagen vieja y se ve "la mitad").
- Cachebust vivo: `componentes_20260918_b8e91e96.js` (apunta a `public/qr_telegram_main.png`). Al regenerar QR: nuevo nombre de imagen + nuevo cachebust + re-apuntar los 108 HTML.

## Scripts conservados en la raíz del repo

- `subir_v18.py` (FTP), `build_indicativos.py` (workflow `.github/workflows/actualizar-licencias.yml`, mensual, requiere pypdf y PAT_TOKEN), `sync_calendario.py` (workflow sync-calendario.yml, cada 3 h), `servidor_qsl.py` + `iniciar_qsl.bat` (dev local), `generar.py` + `generar-indice.py` (generadores QSL).
- `generar_ranking_manual.py` + `TUTORIAL_RANKING.md`: ranking manual sin opencode (vivo vs congelado, formato JSON, rutas, cachebust, checklist).

## Bot Telegram QSLs (sección actualizada 18-sep-2026: TODO EN UNO)

- **INTEGRADO como módulo dentro del bot APRS**: `C:\Users\javen\OneDrive\Desktop\BOT\bot_ce4jwi10_telegram\bot_qsl_ce4jwi.py` (copia de CE4JWI-10 + motor Telegram con prefijo `tg_*`). Un solo proceso hace APRS + Telegram. Arranca con `iniciar_ce4jwi10_telegram.bat`. Estado: APRS conectado + `Vigilando FTP cada 30 s` en el mismo PID.
- El bot APRS ORIGINAL para CE4JWI-10 sigue en `…\bot_aprs_ce4jwi10\bot_qsl_ce4jwi.py` (sin Telegram; quedó como respaldo de trabajo). XR4MAU-7/-10 NO tienen integrado (no usar Telegram ahí mién mientras).
- Los datos del Telegram (token, registro, candado, log) SIEMPRE viven en `C:\Users\javen\OneDrive\Desktop\BOT\_mantenimiento\telegram_qsl\` (fuente única compartida: `config.json`, `registro.json`, `enviados.json`, `bot_telegram_qsl.log`) — el módulo integrado los lee desde ahí (`TG_BASE`). El script independiente `bot_telegram_qsl.py` de esa carpeta quedó DESACTIVADO (su guardián/Startup se movió a `.respaldo_integrado`; NO relanzarlo, daría 409 + dobles envíos).
- Usuario `@Ce4jwi_qsl_bot`. Cada colega se registra con `/registrar SU_CALL` (o `/borrar`, `/estado`).
- Vigila el FTP de qsl.net cada 30 s (`scan_segundos`) y manda cada QSL nueva por DM al chat registrado. Reutiliza credenciales FTP de `LOG4OM_QSLNET\config.json` (clave `config_ftp`); si falla, cae a las del bot APRS.
- El TOKEN de Telegram NO se versiona: vive solo en `telegram_qsl\config.json` (`bot_token`). Nunca commitear.
- Optimiza la imagen antes de enviar (`tg_optimizar_jpeg`: JPEG <=900000 bytes) — sin esto Telegram devuelve HTTP 413 (QSLs de ~1.4 MB).
- Envío con candado: `enviados.json` = `{"archivos": [...], "hashes": [...]}` (hist. selladas + hashes md5 del contenido). **Regla: una QSL se envía UNA vez; si se borra el mensaje en Telegram, NO se reenvía.** Solo cuenta duplicada el contenido idéntico (md5); si dos bots entregan QSL distintas del mismo QSO, van ambas.
- `tg_escanear_qsls_nuevas()` devuelve `{nombre: chat_id}`; el dedupe por md5 ocurre al enviar. Cada colega solo recibe sus propias QSL (call del nombre de archivo → `registro.json` → chat). `registro.json`: CE4JWI y XR4MAU → chat 1296146556 (monitoreo del dueño) + colegas auto-registrados.
- PID activo en su momento: 16080. NO abrir segundas instancias del bot integrado ni del telegram suelto → 409 Conflict.
- `GUIA_ACTIVIDADES.md`: guía más antigua de creación de actividades (pasos 1-5); `plantilla.html` / `plantilla_ranking.html` son plantillas.
- `.github/workflows/` hacen commit+push automáticos cuando regeneran datos (no intentar "fixear" si hay conflictos por sus commits).

## cositas del entorno

- Windows PowerShell 5.1: NO usar `&&`; encadenar con `cmd1; if ($?) { cmd2 }`. No correr python multilínea con acentos vía `-c` en PowerShell (mojibake) → usar archivos temporales.
- No borrar `*.respaldo_*`, `*.eliminado_*` (copias de seguridad del usuario) salvo autorización explícita tras auditoría.
- Repo remoto: `https://github.com/juank329/CE4JWI` (rama `main`).