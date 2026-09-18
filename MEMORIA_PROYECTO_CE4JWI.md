# MEMORIA DE PROYECTO - CE4JWI (Los Chinchineros 2026)
# (ASCII puro + \uXXXX; nunca escribir texto acentuado crudo en este transcript)

## Repos / rutas reales (verdad unica - el transcript viene mojibakeado)
- Repo real: C:\Users\javen\OneDrive\Documentos\GitHub\CE4JWI
- Remoto GitHub: https://github.com/juank329/CE4JWI.git  (rama main, usuario juank329)
- FTP: credenciales genericas SOLO se leen en runtime de "subir_v18.py"
  (HOST/USER/PASS) en la misma carpeta; nunca hardcodear en scripts nuevos.

## ACTIVIDAD 87 EN RECURSOS/ACTIVIDADES.JS
- id 87 = "Los Chinchineros 2026"
- url = "los_chinchineros_2026.html"
- frase sinton\u00eda = CHINCHINERO  -> estaci\u00f3n CE4JWI-10 (Solo APRS, 144.390 MHz)
- fecha = 16 Septiembre 2026
- imagen = public/LOS CHINCHINEROS.webp (nombre EXACTO con may\u00fasculas y espacios)
- ranking = ranking_chinchineros.json (bot externo lo sube; URL bloqueado no lo toca)
- clon inicial tomado de "el_organillero_2026.html" (actividad precedente, id 86)

## CACHEBUST (regla de oro / causa del bug "no se ve\u00edan las actividades")
- Todos los *.html usan <script src="recursos/actividades_*.js" defer>.
- NUNCA apuntar a un nombre que no exista: el 404 rompe el index completo.
- Esquema determinista usado: actividades_<YYYYMMDD>_<hash8hex>.js
  (la actual del repo: actividades_20260916_8a9db2a5.js)
- Al regenerar actividades.js SIEMPRE: verificar id 87 presente + mojibake=0 +
  actualizar cachebust en disco + re-apuntar TODOS los *.html al MIMO nombre +
  subir por FTP + git add/commit/pull --rebase/push.

## MOJIBAKE - guarda obligatoria (lecci\u00f3n aprendida)
- Este transcript/proyecto sufre mojibake (ACENTOS + DOBLES BYTES). Reglas:
  1. Todos los scripts que escribe archivos: escribir en ASCII puro con
     escapes \\uXXXX dentro de literales Python (el parser los decodifica).
  2. Tras CUALQUIER escritura/lectura: verificar 0 coincidencias de la regex
     mojibake [\\u00c0-\\u00c3][^\u0000-\u007f]; si >0 => ABORTAR.
  3. NO usar heredocs ni comandos bash multi-archivo con acentos; los .py
     ASCII se guardan con la herramienta write y se ejecutan con "python <file>".

## SEVER (estado final 2026-09-16)
- FTP: 136 archivos subidos OK (HTML + 108 cachebust + 133 im\u00e1genes .webp
  de public/ + actividades.js + ranking). Es el AGREGO de las im\u00e1genes .webp
  que faltaban (por eso no sal\u00eda la imagen principal del chinchinero).
- Git: rama main con commit "Los Chinchineros 2026..." sincronizada (push OK).
- Descripci\u00f3n "DATO" de la p\u00e1gina corregida: bombo con platillos chin-chin
  al ritmo incansable, acompa\u00f1ando al organillero en calles y fondas (ya no
  copia el texto del organillero).

## PENDIENTE (no bloqueante)
- Verificar en vivo con Ctrl+F5 el index transmitido (la tarjeta ya deber\u00eda
  verse; si el usuario confirma, cerrar). Nada m\u00e1s pendiente.

## CUEca + HUASO 2026 (16-sep-2026, ACTIVIDADES EN VIVO)
- D\u00eda Nacional de la Cueca 2026 = bot **CE4JWI-7**, frase **CUECA** (SOLO APRS). P\u00e1gina
  reescrita: fetch ranking_cueca.json en vivo, imagen public/CE4JWI SOLO APRS.webp, sin CQ/DMR.
  id 68 en actividades.js = EN VIVO.
- D\u00eda del Huaso y de la Chilenidad 2026 = bot **CE4JWI-10**, frase **HUASO**. P\u00e1gina
  reescrita: fetch ranking_huaso.json en vivo, imagen public/CE4JWI -10 SOLO APRS.webp. id 69 = EN VIVO.
- ranking_cueca.json: generado MANUALMENTE (CE4JWI-7 no tiene generar_ranking_json). 23 QSO/23
  part, subido y verificado. NO se auto-actualiza; re-ejecutar generador si cambia log_cueca.adi.
- ranking_huaso.json: lo genera el bot CE4JWI-10 (26 QSO) - NO tocar.
- Cachebust nuevo: actividades_20260916_42968cfe.js (108/108 HTML re-apuntados). FTP 6/6 OK.

## CE4JWI-7 ACTUALIZADO (16-sep-2026)
- Se copi\u00f3 a CE4JWI-7 (bot_aprs_ce4jwi) el generar_ranking_json del CE4JWI-10: funciones
  _leer_qsos_adif + generar_ranking_json, import cmp_to_key, llamada en guardar_adif tras
  subir_log_adif. Ya sube ranking_cueca.json autom\u00e1ticamente en cada QSO.
- Bot CE4JWI-7 RELANZADO (nuevo PID, cwd bot_aprs_ce4jwi). Conectado como CE4JWI-7 frase [CUECA].
- El ranking_cueca.json NO necesita ya generarse a mano.

## TICKER CLIMA + ADIF/RANKINGS (16-sep-2026)
- Ticker del clima ELIMINADO de componentes (HTML .weather-ticker + funciones clima + llamadas).
  Cachebust nuevo: componentes_20260916_f089c287.js, 108/108 HTML re-apuntados, FTP 109/109 OK.
  FIX previo: componentes_20260924.js que apuntaban los HTML NO estaba en producci\u00f3n
  (faltaban men\u00fa/sidebar/footer) -> subido antes del cachebust.
- CUECA: ADIF local=qsl.net=39 QSO/39 est., ranking_cueca.json regenerado 39/39 (estaba 23).
  CE4JWI-7 ya lo auto-actualiza en cada QSO.
- HUASO: ADIF local=qsl.net=46 QSO/46 est., ranking_huaso.json correcto (bot CE4JWI-10).

## AUDITORIA + LIMPIEZA COMPLETA REPO (17-sep-2026)
- Auditoria (scripts temp v1/v2/v3): 259/563 huerfanos v1; refinada con patron url:.
- El usuario pidio PREGUNTAR ANTES DE ELIMINAR. Aprobado por categoria (question tool):
  1) respaldos/tmp + api/ ; 2) cachebusts viejos + novedades.js ; 3) scripts .py temporales ;
  4) imagenes huerfanas + placeholder ; 5) dudosos -> SOLO log.html (conserva PDFs SUBTEL,
     ranking_pasamos_agosto, indicativos-historial/aspirante.json).
- Commit 98defdf ("auditoria: elimina respaldos, scripts temporales, cachebusts viejos,
  imagenes huerfanas y log.html; corrige mojibake en idioma_20260918.js"), 94 files,
  +7/-284305. Push OK.
- Quedan SOLO 7 .py en raiz (build_indicativos, sync_calendario, subir_v18, servidor_qsl,
  generar, generar-indice) + eliminar_4_paginas_herramientas_*_tmp.py (pendiente, se
  restauro desde papelera: la limpieza lo habia borrado por la pasada .py).
- FIX produccion: idioma_20260918.js tenia 8 U+FFFD (header ESPA?OL + 7 PR?XIMAMENTE).
  Corregido, FTP subido, verificado en qsl.net (FFFD=0). Header escrito ESPANOL sin acento.
- Papelera de seguridad con TODO lo borrado: temp\opencode\audit_papelera (git tambien).
- Cachebusts vivos tras limpieza = 7 (lista exacta en AGENTS).

## AUTO-CQ CADA 5 MIN (17-sep-2026)
- Usuario pidio CQ automaticos cada 5 min (antes 10 min) SOLO en CE4JWI-7 y CE4JWI-10
  (no tocar XR4MAU ni CA4NDW).
- panel_qsl.py de bot_aprs_ce4jwi y bot_aprs_ce4jwi10: time.sleep(600) -> time.sleep(300)
  en _hilo_cq_automatico y detalle "cada 10 min" -> "cada 5 min". py_compile OK.
- Reinicios: 1er intento con Start-Process -WindowStyle Hidden (el usuario dijo que "no
  abrian"). Se detuvieron y se relanzaron con iniciar_ce4jwi.bat / iniciar_ce4jwi10.bat
  (ventana de consola VISIBLE). PIDs nuevos: CE4JWI-7=240, CE4JWI-10=15960 (bot_pid.txt
  actualizados por el propio bot). Ambos conectados a rotate.aprs2.net:14580 con frase
  [CUECA] y [HUASO] y enviando BOLETIN cada ~5 min (log verificado).
- Leccion: usar SIEMPRE los .bat (iniciar_ce4jwi.bat / iniciar_ce4jwi10.bat) para relanzar
  bots, NO -WindowStyle Hidden.

## REPLICADO EN XR4MAU-7 Y XR4MAU-10 (17-sep-2026)
- Mismo cambio auto-CQ 5 min (time.sleep 300) en panel_qsl.py de bot_aprs_xr4mau y
  bot_aprs_xr4mau10 (antes 600). detalle "cada 5 min".
- AGREGADO generar_ranking_json a los 2 XR4MAU (bot_qsl_xr4mau.py): copiado el bloque
  compuesto de CE4JWI-7 = import cmp_to_key + _leer_qsos_adif + generar_ranking_json +
  llamada generar_ranking_json(nombre_log) en guardar_adif tras subir_log_adif.
  py_compile OK en ambos.
- Lanzados con iniciar_xr4mau.bat / iniciar_xr4mau10.bat (ventana visible), PIDs:
  XR4MAU-7=14164 frase [RIO], XR4MAU-10=1984 frase [MAULE] (rotate.aprs2.net:14580,
  logs del 17-09 10:31 OK).
- Les genera: XR4MAU-7 -> ranking_rio.json, XR4MAU-10 -> ranking_maule.json
  (nombre_actividad de config.json) tras cada QSO, subido por FTP como los CE4JWI.
- CA4NDW: NO tocado (regla respetada).

## XR4MAU CERRADOS POR EL USUARIO (17-sep-2026)
- El usuario cerro MANUALMENTE los bots XR4MAU-7 y XR4MAU-10 (no queria duplicados).
  Verificado: PIDs 14164/1984 ya no existen. Los cambios de codigo (5 min + ranking json)
  quedan en disco para cuando se quieran relanzar.
- Estan corriendo SOLO: CE4JWI-7 PID 240 [CUECA] y CE4JWI-10 PID 15960 [HUASO].

## BOT TELEGRAM QSL (17-sep-2026, gratis)
- App independiente en C:\Users\javen\OneDrive\Desktop\BOT\_mantenimiento\telegram_qsl\
  (bot_telegram_qsl.py + config.json + iniciar_bot_telegram_qsl.bat + registro.json + enviados.json).
- Usuario @Ce4jwi_qsl_bot (BotFather). Colegas se registran con /registrar SU_CALL.
- Vigila FTP qsl.net cada 30 s; cuando aparece una QSL jpg nueva se la manda por DM al
  chat registrado. Credenciales FTP reutiliza de LOG4OM_QSLNET\config.json (clave config_ftp).
- TOKEN Telegram SOLO en telegram_qsl\config.json (bot_token). NUNCA versionar.
- Fix HTTP 413: optimizar_jpeg comprime a JPEG <=~900 KB antes de enviar (QSLs ~1.4 MB).
- enviados.json evita reenvios. Relanzar con iniciar_bot_telegram_qsl.bat ventana visible.
  PID al crearlo: 14800. CE4JWI (chat 1296146556) ya registrado y probado OK (5 QSLs).
- QSLs por APRS (CE4JWI/XR4MAU) ya existian y quedan en la web descargar-qsl.html; el
  Telegram es un CANAL NUEVO de entrega, no reemplaza APRS/web.

## SELLADO CUECA + HUASO (17-sep-2026)
- CE4JWI-7 (CUECA) apagado tras sellar. Rankings congelados: ranking-data/cueca/final.json
  (73 QSO) y ranking-data/huaso/final.json (82 QSO), ambos congelado=true, ok=true.
- Paginas pasan a fetch("ranking-data/<clave>/final.json"); id 68 y 69 del catalogo ->
  FINALIZADO (patron real del catálogo, aunque AGENTS diga TERMINADA en el ciclo de vida).
- Cachebust nuevo de actividades: actividades_20260917_6eca614e.js, 108/108 HTML re-apuntados.
- Commit e62dd9f; FTP 111/111 OK (incluye ranking-data/*/final.json + cachebust nuevo);
  verificado en https://qsl.net/ce4jwi/ con 200 y FFFD=0.
- Nota: subir_v18.py NO sube ranking-data/*/final.json ni cachebust de actividades;
  el sellado hizo FTP manual de esos extras.

## BOT TELEGRAM QSL RECORDATORIO (17-sep-2026)
- Candado: una QSL se envia UNA vez. enviados.json = {archivos: [...], hashes: [md5...]}.
  Si se borra el mensaje en Telegram NO se reenvia (regla del usuario).
- Dedupe por contenido (md5): solo idénticas cuentan como duplicada; QSL distintas del
  mismo QSO se envian ambas. escanear_qsls_nuevas() -> {nombre: chat_id} (no call).
- Fix bug: enviar_qsls_pendientes usaba leer_registro().get(chat) -> None, no enviaba;
  corregido a usar chat directo, call = call_desde_archivo para caption. QSLs prueban OK.
- Guardián: guardian_bot_telegram_qsl.bat + acceso directo en carpeta Inicio
  (Startup\BotTelegramQSLGuardian.lnk). Un solo proceso python (PID 1436) para evitar 409.
- registro.json: CE4JWI y XR4MAU -> 1296146556 (monitoreo dueño). Colegas solo sus QSLs.
- PENDIENTE (mañana 18-sep): integrar Telegram dentro de bot_qsl_ce4jwi.py (1 solo proceso).
- Sellado previo pre-18-sep: 1459 archivos históricos sellados en enviados.json (archivos),
  +26 hashes; QSLs de hoy (17-sep) quedan desbloqueadas para enviarse a su colega.
