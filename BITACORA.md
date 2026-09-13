# BITÁCORA CE4JWI

Registro diario de lo que se ha hecho y acordado. Se actualiza al final de cada sesión.

---

## Sábado 12 de septiembre de 2026

### Web CE4JWI (repo GitHub: juank329/CE4JWI)

**Problema:** el deploy en Vercel fallaba — límite del plan Hobby: máx. 12 funciones serverless por deploy; había 13 en `api/`.

**Soluciones aplicadas (pusheadas a `main`):**
1. `ranking-chilenidad.js`, `ranking-choripan.js`, `ranking-juegos.js` → fundidos en un endpoint genérico `api/ranking-final.js` (`?actividad=<clave>`), con rewrites en `vercel.json` que conservan las URLs viejas. 13 → 11 funciones.
2. Consolidación total: también `ranking.js`, `ranking-agosto.js`, `ranking-circo.js`, `ranking-patria.js`, `ranking-vino.js`, `ranking-hitos.js` → borrados, todos pasan por `ranking-final.js`. 11 → 5 funciones.
3. Widget "Top Indicativos" eliminado de la barra lateral (`recursos/componentes.js`) y borrado `ranking-general.js`. 5 → **4 funciones (8 cupos libres de 12)**.

**Verificado en vivo** (todo 200 OK y datos correctos):
- `/api/ranking?actividad=talca` (57 filas), `/api/ranking-agosto` (44), `/api/ranking-patria` (58),
  `/api/ranking-vino` (43), `/api/ranking-hitos-mina/rio/casona/parroquia`, `/api/ranking-chilenidad` (51),
  `/api/ranking-choripan` (39), `/api/ranking-juegos` (311/107), `/api/ranking-general` eliminado,
  página FIESTA 200, sidebar sin widget Top.
- Commits push: `c09a917` (chilenidad/choripan/juegos), `1de8f2e` (congeladas → ranking-final),
  `28e40c9` (eliminar ranking-general), `e1f09d9` (AGENTS.md).

**Regla para próximas actividades (documentada en AGENTS.md):**
- EN VIVO → endpoint dedicado `api/ranking-<nueva>.js` (lee ADIF de qsl.net).
- Al TERMINAR → `ranking-data/<clave>/final.json` + rewrite en `vercel.json` a `/api/ranking-final?actividad=<clave>` + BORRAR el endpoint dedicado.
- Así el total de funciones nunca crece y nunca más se choca con el límite de 12.

### CORSARIO_BOT (carpeta independiente, I:\Mi unidad\CORSARIO_BOT\BOT_CA4NDW_para_entrega)

**Estado: listo para entrega** (trabajo de revisión/corrección culminado).

- Corregidas colas de QSL manual en ambos bots (`_hilo_qsl_manual` + `_enviar_qsl` devuelve True/False):
  autocontacto/ya-procesado/éxito → se elimina; envío fallido → se conserva para reintento. La cola ya no acumula basura ni pierde QSLs.
- Bot -10 blindado: `panel_qsl.py` con defaults propios (`CA4NDW-10`, puerto 8775, carpeta GENERAL, posición 3, cuadro 1240,875) aunque se pierda `config.json`.
- SSID verificados: -7 siempre `CA4NDW-7`, -10 siempre `CA4NDW-10` (config + CONFIG_DEFECTO + panel guarda con limpiar_texto); `es_self_call` ignora todo `CA4NDW-*` → no se generan QSL entre los dos bots.
- Colores: -7 **morado #7D3C98**, -10 **rosado #E84393** (config.json, --blue del HTML, CONFIG_DEFECTO del .py).
- Panel muestra indicativo en título/logo (span `logoCall`, `document.title`).
- Títulos de `.bat` SIN cambios (decisión del usuario: "ella hace sus propias actividades").
- `python -m py_compile` OK; prueba cruzada `test_paneles_cross.py` OK.
- Pendientes menores NO pedidos: qsl.html solo en -7, favicon faltante, __pycache__.

### Generales

- Creado `AGENTS.md` en repo web (reglas de Vercel + ciclo de actividad) y `AGENTS.md` en carpeta de entrega del bot.
- Entorno: no hay `vercel` CLI ni `gh`; deploy automático vía push a `main`; si no dispara, el usuario hace Redeploy en el dashboard de Vercel (sin tokens).
- No tocar archivos `*.respaldo_*` / `*.eliminado_*`.