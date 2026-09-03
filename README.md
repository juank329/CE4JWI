# CE4JWI

Sitio web personal del indicativo **CE4JWI** — radioaficionado activo desde la Región del Maule, Chile.

## Estructura

- `index.html` — portada con tarjetas de actividades
- `novedades.html` — artículos y novedades
- `herramienta-indicativos.html` — buscador de indicativos chilenos (SUBTEL)
- `herramienta-satelites.html` — seguimiento de satélites FM en vivo (Leaflet)
- `herramienta-propagacion.html` — propagación HF en tiempo real (reporte N0NBH vía proxy CORS)
- `qsls.html` — buscador de QSLs (catálogo desde https://juank329.github.io/ce4jwi-qsls/log_qsl.json, con qsl.net como respaldo)
- `descargar_qsls.html` — página con datos de ejemplo (usa datos generados por `generar.py`; requiere carpeta `qsl/`)
- `log.html` — log en tiempo real (iframe externo)
- `QSO_logger.html` — generador de ADIF
- `calendario.html` — calendario de actividades
- `carrousel.js` — carrusel de imágenes para las páginas de efeméride
- `generar.py`, `generar-indice.py` — scripts para actualizar el catálogo de QSLs
- `recursos/` — CSS, JS, PDFs locales, imágenes
- `public/` — imágenes y favicon

## Componentes compartidos

El header, la marquesina, el sidebar y el footer se definen como strings
dentro de `recursos/componentes.js` y se inyectan en cada página con JS
(los contenedores `<div id="header-container">` etc.). Para cambiar el menú
o los widgets, se edita ese único archivo.

## Buscador de indicativos

La página `herramienta-indicativos.html` busca en los **listados oficiales de SUBTEL**:

- Novicio / General / Superior (~4.500 registros)
- Aspirantes
- Distintivos especiales (CB / 3G / XR)

### Cómo actualizar cada mes

1. Entrar a https://www.subtel.gob.cl/inicio-concesionario/servicios-de-telecomunicaciones/servicios-de-radio-aficionados/
2. Descargar los tres PDFs actualizados
3. Renombrar a `Listado_NOV_GRAL_SUP_AAAA_MM.pdf`, `Listado_Aspirantes_AAAA_MM.pdf`,
   `Inf_AAAAMMDD_Dist_Especial_Autorizados.pdf` (respetando el patrón)
4. Reemplazar los PDFs en `recursos/`
5. Editar las URLs y la fecha `actualizado` en `recursos/indicativos.js`

La página intentará primero bajar el PDF desde SUBTEL (vía proxy CORS) y, si falla,
usa la copia local en `recursos/` automáticamente.