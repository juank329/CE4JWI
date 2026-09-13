# AGENTS.md — CE4JWI

Guía para el mantenimiento del sitio web CE4JWI en Vercel.

## Regla de oro: límite de 12 funciones serverless (plan Hobby)

Vercel Hobby permite **máximo 12 funciones serverless por deploy** (`/api/*.js`).
Si se agrega una función de más, el deploy falla con:
"En el plan Hobby, no se pueden agregar más de 12 funciones sin servidor a una implementación."

**Estado actual: 4 funciones en `api/` → 8 cupos libres.**

```
api/ranking-final.js   # TODAS las actividades congeladas (?actividad=<clave>)
api/calendario.js      # estático
api/get-solar.js       # solar
api/aprs-proxy.js      # proxy APRS
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