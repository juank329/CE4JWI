# CE4JWI

Sitio web personal del indicativo **CE4JWI** — radioaficionado activo desde la Región del Maule, Chile.

## Estructura

- `index.html` — portada con tarjetas de actividades
- `herramienta-indicativos.html` — buscador de indicativos chilenos (SUBTEL)
- `herramienta-licencia.html` — buscador simple de licencias en los PDFs SUBTEL
- `herramienta-fonetico.html` — código fonético ICAO + código Morse
- `qsls.html`, `descargar_qsls.html` — descarga de QSLs
- `log.html` — log en tiempo real (iframe externo)
- `QSO_logger.html` — generador de ADIF
- `calendario.html` — calendario de actividades
- `componentes/` — header, sidebar, marquee, footer (se inyectan por JS)
- `recursos/` — CSS, JS, PDFs locales, imágenes
- `public/` — imágenes y favicon

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