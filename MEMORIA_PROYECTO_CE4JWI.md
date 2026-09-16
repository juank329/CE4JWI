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
