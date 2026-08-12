/**
 * Buscador de QSLs de CE4JWI
 * ------------------------------
 * Fuente de datos: https://qsl.net/ce4jwi/log_qsl.json
 * (alojado en qsl.net, escrito por el script Python del escritorio
 * cada vez que se registra un QSO en Log4OM).
 *
 * Optimizaciones:
 *  - Caché en localStorage por 1 hora (no re-descarga en cada visita)
 *  - Índice por indicativo (búsqueda O(1))
 *  - Fallback con proxy CORS si qsl.net bloquea el navegador del usuario
 *  - Parseo de fecha embebida en el nombre del archivo JPG
 */

const QSL_JSON_URL = "https://qsl.net/ce4jwi/log_qsl.json"
const QSL_CACHE_KEY = "ce4jwi_qsl_cache_v1"
const QSL_CACHE_TTL_MS = 60 * 60 * 1000  // 1 hora

let indicePorIndicativo = {}
let qslPlanas = []
let lightboxItems = []
let lightboxIndex = 0

// ---- Helpers ----------------------------------------------------------

function setEstado(html, error = false) {
  const el = document.getElementById("qslEstado")
  if (!el) return
  el.innerHTML = html
    ? `<div class="qsl-estado ${error ? "error" : ""}">${
        error ? "" : '<span class="spinner"></span>'
      }<span>${html}</span></div>`
    : ""
}

function escapar(s) {
  const d = document.createElement("div")
  d.textContent = (s ?? "").toString()
  return d.innerHTML
}

// "Activacion_General_CE4JWI_XR4MAU_06-08-2026_2308_DMR.jpg"
// → extrae fecha DD-MM-AAAA, hora HH:MM y modo desde el nombre del archivo
function parsearNombreArchivo(nombre) {
  // dd-mm-aaaa
  const mFecha = nombre.match(/(\d{2})-(\d{2})-(\d{4})/)
  const mHora  = nombre.match(/-(\d{4})_(?=[^_]*\.[a-z]+$)/i) // 4 dígitos antes del modo+ext
  let fecha = ""
  if (mFecha) fecha = `${mFecha[1]}/${mFecha[2]}/${mFecha[3]}`
  let hora = ""
  if (mHora) hora = `${mHora[1].slice(0, 2)}:${mHora[1].slice(2, 4)}`
  // Modo = último segmento antes de la extensión
  const mModo = nombre.match(/_([A-Z0-9]+)\.[a-z]+$/i)
  const modo = mModo ? mModo[1] : ""
  return { fecha, hora, modo }
}

// ---- Carga del JSON (con caché) --------------------------------------

function cargarCache() {
  try {
    const raw = localStorage.getItem(QSL_CACHE_KEY)
    if (!raw) return null
    const cached = JSON.parse(raw)
    if (Date.now() - cached.ts > QSL_CACHE_TTL_MS) return null
    return cached.data
  } catch { return null }
}

function guardarCache(data) {
  try {
    localStorage.setItem(QSL_CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
  } catch { /* localStorage lleno, ignorar */ }
}

async function fetchQSLData() {
  // 1) Caché local (instantáneo)
  const cache = cargarCache()
  if (cache) {
    return { data: cache, fuente: "cache" }
  }

  // 2) Intentar en orden: directo → proxies CORS
  // qsl.net NO envía Access-Control-Allow-Origin, así que desde un navegador
  // siempre hay que pasar por un proxy. cors.sh es el más estable que probamos.
  const intentos = [
    { url: `https://cors.sh/${QSL_JSON_URL}`,        nombre: "cors.sh" },
    { url: `https://api.allorigins.win/raw?url=${encodeURIComponent(QSL_JSON_URL)}`, nombre: "allorigins" },
    { url: QSL_JSON_URL,                              nombre: "directo" },
  ]
  let lastErr = null
  for (const intento of intentos) {
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 10000)
      const r = await fetch(intento.url, { signal: ctrl.signal, cache: "no-store" })
      clearTimeout(t)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      guardarCache(data)
      return { data, fuente: intento.nombre }
    } catch (e) {
      console.warn(`[qsl] ${intento.nombre} falló:`, e.message || e)
      lastErr = e
    }
  }
  throw new Error(`No se pudo cargar el catálogo de QSLs: ${lastErr?.message || "?"}`)
}

// ---- Indexado por indicativo -----------------------------------------

function indexar(data) {
  qslPlanas = []
  indicePorIndicativo = {}
  if (!Array.isArray(data)) return
  for (const item of data) {
    const cs = (item.call || "").toUpperCase().trim()
    if (!cs) continue
    const meta = parsearNombreArchivo(item.archivo || "")
    const normalizado = {
      indicativo: cs,
      actividad: (item.carpeta || "").replace(/_/g, " "),
      archivo: item.archivo || "",
      url: item.url || "",
      fecha: meta.fecha,
      hora: meta.hora,
      modo: meta.modo,
    }
    qslPlanas.push(normalizado)
    if (!indicePorIndicativo[cs]) indicePorIndicativo[cs] = []
    indicePorIndicativo[cs].push(normalizado)
  }
  // Ordenar cada grupo por fecha (YYYY/MM/DD → orden lexicográfico funciona)
  for (const cs in indicePorIndicativo) {
    indicePorIndicativo[cs].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""))
  }
}

// ---- Búsqueda y render -----------------------------------------------

function buscarQSL(ev) {
  if (ev) ev.preventDefault()
  const input = document.getElementById("qslCall")
  const indicativo = (input.value || "").toUpperCase().trim()
  if (!indicativo) {
    setEstado("Por favor ingresa un indicativo.", true)
    return
  }

  // Si todavía no tenemos datos, los pedimos
  if (qslPlanas.length === 0) {
    setEstado("Cargando catálogo de QSLs desde qsl.net…")
    cargarYBuscar(indicativo)
    return
  }

  renderBusqueda(indicativo)
}

async function cargarYBuscar(indicativo) {
  try {
    const { data, fuente } = await fetchQSLData()
    indexar(data)
    setEstado("")
    const nota = fuente === "proxy"
      ? `Cargado vía proxy CORS (${qslPlanas.length} QSLs en total).`
      : ""
    if (nota) setEstado(nota)
    renderBusqueda(indicativo)
  } catch (e) {
    setEstado(e.message, true)
    document.getElementById("qslResultados").innerHTML = ""
    document.getElementById("qslContador").innerHTML = ""
  }
}

function renderBusqueda(indicativo) {
  const contRes = document.getElementById("qslResultados")
  const contCnt = document.getElementById("qslContador")
  lightboxItems = []

  const resultados = indicePorIndicativo[indicativo] || []
  contCnt.innerHTML = resultados.length
    ? `<strong>${resultados.length}</strong> QSL${resultados.length === 1 ? "" : "s"} para ${escapar(indicativo)}`
    : ""

  // Sugerencias si escribió solo parte (ej: "MAU" → encuentra XR4MAU, CE4MAU…)
  let sugerencia = ""
  if (resultados.length === 0) {
    const similares = Object.keys(indicePorIndicativo)
      .filter((cs) => cs.includes(indicativo))
      .slice(0, 6)
    if (similares.length) {
      sugerencia = `<div class="qsl-vacio" style="margin-top:0.75rem; padding:1rem;">
        ¿Quisiste decir:
        ${similares.map(s => `<button class="btn-limpiar" style="margin:0.2rem;" onclick="document.getElementById('qslCall').value='${escapar(s)}'; buscarQSL({preventDefault:()=>{}})">${escapar(s)}</button>`).join(" ")}
        ?</div>`
    }
  }

  if (resultados.length === 0) {
    contRes.innerHTML = `
      <div class="qsl-call-badge">${escapar(indicativo)}</div>
      <div class="qsl-vacio">
        No hay QSL cards registradas para este indicativo.<br>
        <small>Si acabas de hacer un QSO, espera unos segundos y vuelve a buscar.</small>
      </div>
      ${sugerencia}`
    return
  }

  contRes.innerHTML = `
    <div class="qsl-call-badge">${escapar(indicativo)}</div>
    ${sugerencia}
    <div class="qsl-galeria">
      ${resultados.map((q, i) => tarjetaQSL(q, i)).join("")}
    </div>
  `

  // Guardamos para el lightbox
  lightboxItems = resultados
}

function tarjetaQSL(q, i) {
  return `
    <div class="qsl-tarjeta" onclick="abrirLightbox(${i})">
      <img src="${escapar(q.url)}" alt="QSL ${escapar(q.indicativo)}" loading="lazy">
      <div class="qsl-tarjeta-info">
        <div class="qsl-tarjeta-actividad">${escapar(q.actividad)}</div>
        <div class="qsl-tarjeta-meta">
          <span>${escapar(q.fecha || "")} ${escapar(q.hora || "")}</span>
          <span>${escapar(q.modo || "")}</span>
        </div>
        <div style="margin-top:0.5rem;">
          <a class="qsl-tarjeta-dl" href="${escapar(q.url)}" download onclick="event.stopPropagation()">⬇ Descargar</a>
        </div>
      </div>
    </div>`
}

// ---- Lightbox --------------------------------------------------------

function abrirLightbox(i) {
  lightboxIndex = i
  const item = lightboxItems[i]
  if (!item) return
  document.getElementById("qslLightboxImg").src = item.url
  document.getElementById("qslLightboxDl").href = item.url
  document.getElementById("qslLightboxDl").download = item.archivo || ""
  document.getElementById("qslLightbox").classList.add("active")
  document.body.style.overflow = "hidden"
}

function cerrarLightbox() {
  document.getElementById("qslLightbox").classList.remove("active")
  document.body.style.overflow = ""
}

function navegarLightbox(dir) {
  if (!lightboxItems.length) return
  lightboxIndex = (lightboxIndex + dir + lightboxItems.length) % lightboxItems.length
  abrirLightbox(lightboxIndex)
}

// Cerrar con click fuera / Escape / flechas
document.addEventListener("keydown", (e) => {
  const lb = document.getElementById("qslLightbox")
  if (!lb || !lb.classList.contains("active")) return
  if (e.key === "Escape") cerrarLightbox()
  if (e.key === "ArrowLeft") navegarLightbox(-1)
  if (e.key === "ArrowRight") navegarLightbox(1)
})

document.addEventListener("click", (e) => {
  const lb = document.getElementById("qslLightbox")
  if (lb && lb.classList.contains("active") && e.target === lb) cerrarLightbox()
})

// ---- Limpiar / Init ---------------------------------------------------

function limpiarQSL() {
  document.getElementById("qslCall").value = ""
  document.getElementById("qslResultados").innerHTML = ""
  document.getElementById("qslContador").innerHTML = ""
  setEstado("")
  document.getElementById("qslCall").focus()
}

// Enter en el input → buscar
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("qslCall")
  if (input) input.focus()

  // Precarga silenciosa del JSON en background (para que la 1ª búsqueda sea instantánea)
  if (qslPlanas.length === 0 && !window._qslPrecargando) {
    window._qslPrecargando = true
    fetchQSLData()
      .then(({ data }) => { indexar(data); window._qslPrecargando = false })
      .catch(() => { window._qslPrecargando = false })
  }
})