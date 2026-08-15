# GUÍA: Crear una actividad nueva (paso a paso)

Este documento explica qué hacer para publicar una actividad nueva en el sitio CE4JWI.

---

## Resumen del proceso

1. Crear la página HTML de la actividad (copia de `plantilla.html`)
2. Agregar la entrada en `recursos/actividades.js` (tarjeta en la portada)
3. Agregar el evento en `recursos/eventos-calendario.json` (calendario)
4. Subir los archivos de la página por FTP a qsl.net
5. (Si la actividad tiene QSL) Con Log4OM + el bot `buscador.py` activos,
   las QSLs y el `log_qsl.json` se suben automáticamente

---

## Paso 1 — Crear la página de la actividad

1. Copia `plantilla.html` y renombra el archivo con el patrón usado en el sitio,
   por ejemplo: `mi_actividad_2026.html`.
2. Edita en ese archivo:
   - `<title>` → el título de la actividad.
   - `<meta name="description">` → una breve descripción para buscadores.
   - El `<h1>` dentro de `.banner` → el título visible.
   - El contenido dentro de `<section class="page-content">`:
     - Fecha destacada: `<h3 class="destacar">20 Agosto 2026</h3>`
     - Imagen principal:
       ```html
       <div style="text-align: center;">
         <img src="public/mi_imagen.webp" alt="Mi Actividad 2026" width="100%">
       </div>
       ```
     - Texto con párrafos normales (`<p>`), títulos (`<h3 class="titulo">`) y
       listas (`<div class="lista"><ul>...`).
     - Texto de QSL al final:
       ```html
       <h4 class="destacar">TODAS LAS QSLS SE ENVIARÁN A LOS CORREOS ELECTRONICOS REGISTRADOS EN LA PÁGINA DE QRZ.COM, DE IGUAL MANERA SE PUEDEN DESCARGAR DE ESTA MISMA WEB, SECCIÓN "DESCARGA DE QSLs"</h4>
       ```
3. Coloca la(s) imagen(es) en la carpeta `public/`.

> Ejemplos completos para copiar: mira `dia_de_la_region_del_maule_2026.html`
> o `dia_del_minero_en_chile_2026.html`.

---

## Paso 2 — Agregar la tarjeta en la portada

Abre `recursos/actividades.js` y agrega al final del array `ACTIVIDADES`
(antes de la llave de cierre `]`), con un `id` nuevo:

```js
{
  id: 64,
  title: "MI NUEVA ACTIVIDAD",
  image: "public/mi_imagen.webp",
  status: "PRÓXIMAMENTE",
  description:
    "Texto corto que aparecerá en la tarjeta de la portada...",
  date: "20 Agosto 2026",
  url: "mi_actividad_2026.html",
},
```

Campos:
- `status`: usa `"PRÓXIMAMENTE"` antes de la fecha y `"FINALIZADO"` después.
  El estado `"PRÓXIMAMENTE"` además lo muestra la marquesina de la portada.
- `date`: fecha legible que verás en la tarjeta (ej. `"20 Agosto 2026"`).
- `url`: el nombre exacto del HTML del Paso 1.

---

## Paso 3 — Agregar el evento al calendario

Abre `recursos/eventos-calendario.json` y agrega un elemento al array
(es un solo archivo de una línea):

```json
{"date":"2026-08-20","title":"Actividad \"MI NUEVA ACTIVIDAD\"","category":"actividad","allDay":true}
```

- `category` puede ser `actividad`, `celebracion` u otro que ya uses.
- Si la actividad dura varios días, agrega un elemento por cada día.

---

## Paso 4 — Subir por FTP a qsl.net

Sube estos archivos (manteniendo las carpetas `public/` y `recursos/`):

- El HTML nuevo: `mi_actividad_2026.html`
- Las imágenes nuevas: `public/mi_imagen.webp` (y otras)
- `recursos/actividades.js`
- `recursos/eventos-calendario.json`

> qsl.net es hosting estático: no soporta PHP ni scripts. Solo archivos.

---

## Paso 5 — Si la actividad entrega QSL (automático)

Las QSLs se suben **solas**, no hace falta subir nada manualmente.
El bot `buscador.py` (en `Desktop\log4om_qslnet`) hace todo:

1. Asegúrate de que **Log4OM está corriendo y el bot `buscador.py` está activo**
   (escucha en el puerto UDP 12060).
2. Registra los contactos en Log4OM normalmente (con el nombre de la
   actividad en el campo COMMENT).
3. El bot, por cada QSO:
   - genera el JPG de la QSL desde `plantilla_qsl.png`,
   - lo sube por FTP a qsl.net,
   - actualiza `log_qsl.json` en qsl.net (lo baja, agrega el registro y lo sube).
4. La sección "Descarga de QSLs" (`qsls.html`) las mostrará automáticamente.

> Para que el QSO tenga la actividad correcta, usa el nombre de la actividad
> en el campo COMMENT de Log4OM. Ese nombre define la carpeta/etiqueta de la QSL.

> Ojo: `buscador.py` tiene la contraseña FTP en texto plano. Si algún día
> compartes esa carpeta, cámbiala o elimínala.

---

## Checklist rápido

- [ ] HTML de la actividad creado (desde plantilla) y con su contenido
- [ ] Imagen(es) copiadas a `public/`
- [ ] Entrada agregada en `recursos/actividades.js`
- [ ] Evento agregado en `recursos/eventos-calendario.json`
- [ ] Todo subido por FTP a qsl.net
- [ ] (Si aplica) Log4OM y el bot `buscador.py` activos para subir las QSLs
