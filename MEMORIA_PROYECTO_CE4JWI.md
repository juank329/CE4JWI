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

## INTEGRACION TODO-EN-UNO (18-sep-2026)
- Nueva carpeta C:\Users\javen\OneDrive\Desktop\BOT\bot_ce4jwi10_telegram\ = COPIA de
  bot_aprs_ce4jwi10 (bot_qsl_ce4jwi.py + config.json + plantilla + log_primera_junta.adi +
  calls_procesados + contador) con el motor Telegram del bot suelto integrado al final
  (funciones prefijo tg_*, hilos tg_hilo_telegram + tg_hilo_vigilante lanzados con _hilo_tg_integrado).
- Reutiliza SIEMPRE los datos de _mantenimiento\telegram_qsl (TG_BASE): config.json (token),
  registro.json, enviados.json (candado), bot_telegram_qsl.log. Un solo proceso hace APRS+Telegram.
- Arranque: iniciar_ce4jwi10_telegram.bat (python -X utf8). Verificado: conectado APRS
  [PRIMERA JUNTA] + "Vigilando FTP cada 30 s" (lín. 15:55), PID 16080, bot_pid.txt=16080.
- Apagados y NO relanzar: bot_telegram_qsl.py independiente (guardian y Startup .lnk movido
  a .respaldo_integrado; relanzarlo daria 409 + dobles envios). Ctrl de ventanas: solo la del
  todo-en-uno.
- Fabricar la integración = editar COPIA del bot APRS: +imports urllib.request/parse/error,
  +codigo TG al final antes de __main__, __main__ invoca _hilo_tg_integrado() antes de conectar.
- Si otro bot APRS (XR4MAU) necesita Telegram en el futuro: repetir el patrón copiando con
  TG_BASE apuntando a la misma carpeta _mantenimiento\telegram_qsl.
- CLAVE: mismo token de Telegram NO puede estar en 2 procesos (getUpdates -> 409 Conflict).

## ESTADO ACTUAL (03-oct-2026) - leer esto primero
- FTP: raiz con 2665 QSL jpg. Reparto: 2026-09 = 2403 (3,0 GB), 2026-10 = 260 (238 MB).
  Agosto = 0 (borrado). Total raiz ~3,0 GB.
- Repo remoto: https://github.com/juank329/CE4JWI.git rama main. ULTIMO dato de visibilidad:
  private=False (el usuario debe cambiarlo a mano en GitHub Settings, no hay token).
- Publicacion real = FTP qsl.net. NO hay Vercel ni GitHub Pages. GitHub solo versiona.
  qsl.net devuelve HTTP 200 con pagina de error de 5439 B: SIEMPRE validar por TAMANO, no por status.

## HOSPITAL 2026 (creado y publicado, todavia NO_)
- Pagina dia_nacional_del_hospital_en_chile_2026.html. id 98 en actividades.js.
  fecha 3 Octubre 2026, frase HOSPITAL, estacion CE4JWI-10 solo APRS, estado PROXIMAMENTE.
- Imagen: public\Dia_Nacional_del_Hospital_en_Chile.webp (850100 B). SIN tilde en el nombre.
  Modes: public\CE4JWI -10 SOLO APRS.webp (208090 B) - es la imagen correcta de modos.
- La pagina hace fetch("ranking_hospital.json?t="+Date.now(), {cache:"no-cache"}).
  ranking_hospital.json NO existe todavia: la actividad no empezo.
  ranking-data/hospital/final.json quedo como archivo vacio congelado, la pagina NO lo usa.
- NO marcar FINALIZADO antes de que el usuario cierre la actividad.

## MUSICA + NO VIOLENCIA (cerradas y selladas)
- MUSICA: adif\ce4jwi\log_musica.adi (31120 B), 97 QSO / 95 estaciones.
  ranking_musica.json + ranking-data\musica\final.json, congelado=true, 18239 B. id 96 FINALIZADO.
- NO VIOLENCIA: adif\ce4jwi\log_no_violencia.adi (30486 B), 95 QSO / 95 estaciones.
  ranking_no_violencia.json + ranking-data\no_violencia\final.json, congelado=true, 18253 B.
  id 97 FINALIZADO.
- PATRON DE SELLADO REAL (corrige la nota de CUECA/HUASO mas arriba): la pagina lee el JSON de
  la RAIZ (ranking_<clave>.json) y ranking-data/<clave>/final.json queda como copia permanente.
  El archivo de la raiz es el que se sube al FTP en cada actualizacion del bot.

## COMUNICADO: SUBIR_V18.PY ESTUVO PUBLICO (resuelto, pendiente rotar clave)
- subir_v18.py se subio por FTP a la raiz y quedo descargable en
  https://qsl.net/ce4jwi/subir_v18.py con HOST/USER/PASS visibles. Cualquiera podia leer la clave.
- Borrado del FTP el 03-oct-2026 y verificado 404 falso (5439 B). La copia LOCAL se conserva
  porque los scripts de subida leen de ahi.
- LA CLAVE FTP SIGUE ESTANDO EN EL HISTORIAL DE GIT (commits ce1a7e7 y 465f88a) y el repo estuvo
  publico. PENDIENTE DEL USUARIO: 1) cambiar la clave del FTP en qsl.net, 2) despues limpiar
  el historial de git con git filter-repo.
- El bot Telegram NO tiene SMTP: manda la foto con sendPhoto. El COMMENT del ADIF lleva el link
  a qsl.net de cada QSL.

## LIMPIEZA DE ESPACIO EN FTP (03-oct-2026, con autorizacion del usuario)
- Certificados: 38 PNG duplicados borrados = 313159623 B (298,7 MB).
  certificados_condorito_2026.html ahora enlaza solo JPG.
- Lote tecnico + public sin uso: 49 archivos, 3,7 MB (9 imagenes de public sin referencia,
  5 .pyc, 29 .py de la raiz, 6 .md de la raiz). Incluyo subir_v18.py.
- QSL de FT8: 117 archivos, 71,0 MB. Los nombres eran FT8_CE4JWI_<call>_<fecha>_FT8.jpg.
- QSL de AGOSTO 2026: 206 archivos, 241 MB, verificado 404 falso en produccion.
- TOTAL liberado: ~614 MB.
- REGLAS DE BORRADO: borrar por grupo explicito con dry-run antes; verificar en produccion con
  Invoke-WebRequest comparando contra 5439 B; NO tocar el sitio sin autorizacion del usuario.
- OJO con el parser de nombres de QSL: hay 6 formatos. El indicativo de la otra estacion es el
  token justo ANTES de la fecha. Formato DD-MM-YYYY o DDMMYY compacto (DDMMYY = _DDMMYY_).
  Comparar el anio como int, no como string, o el filtro devuelve 0 sin avisar.

## BASE DE EMAILS + BUSCADOR (nuevo, 03-oct-2026)
- Carpeta: C:\Users\javen\OneDrive\Desktop\ADIF_para_HamSpark\
- El usuario subio ADIF_INDICATIVOS_CON_QSL.adi a hamspark.com y bajo el export
  hamspark_qso_export_2026-10-03.adi, que trae 269 emails reales de los 274 indicativos con QSL.
- BASE_EMAILS.csv (indicativo,email) + BASE_EMAILS.json (mismo dato, para el bot). 269 entradas.
- ABRIR_BUSCADOR.bat arranca consulta_emails.py (servidor local en 127.0.0.1:8765) y abre
  buscador_emails.html: buscar indicativo, ver email, editar, agregar si falta, borrar.
  Endpoints: /api/buscar /api/guardar /api/todos /api/sin-email /api/estadisticas.
  27 indicativos con QSL todavia NO tienen email.
- AGREGAR_EMAILS.bat corre agregar_emails.py: lee los .adi de la carpeta y suma los campos
  EMAIL / E_MAIL a la base, sin duplicar. Ahi se dejan los exports nuevos de hamspark.
- IMPORTANTE: guardar cada export de hamspark con nombre distinto (AAAA-MM-DD); si se repite el
  nombre el navegador lo baja como _ (1) y el script no lo lee por no terminar en .adi.
- PLAN DEL USUARIO para el bot: si hay email -> enviar por correo; si no -> enviar por APRS.
  todavia NO implementado en el panel.
- enviar_qsl_email.py y config_email.json quedaron PREPARADOS pero sin usar: las QSL pesan
  ~1,2 MB y sin recomprimir losaternary con mas tarjetas llegan a 53 MB (limite gmail 25 MB).
- El usuario dijo NO recomprimir las imagenes por ahora.
- qsl.net BLOQUEA User-Agent de Python: da 403. Hay que mandar cabecera de navegador en las
  descargas https. Velocidad medida ~871 KB/s.

## PENDIENTES QUE REQUIEREN AL USUARIO
- Cambiar la clave del FTP en qsl.net (urgente) y luego limpiar el historial de git.
- Poner el repo de GitHub en privado.
- Cerrar la actividad Hospital el 3 de octubre y generar ranking_hospital.json.
- Cargar en hamspark los ADIF que falten para completar los 27 indicativos sin email.
- Implementar en el panel del bot la regla email -> correo, sin email -> APRS.
