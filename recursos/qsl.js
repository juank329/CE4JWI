/**
 * Buscador de QSLs de CE4JWI
 * ------------------------------
 * Fuente de datos: https://juank329.github.io/ce4jwi-qsls/log_qsl.json
 * (GitHub Pages, escrito por el bot APRS del escritorio cada QSO; qsl.net
 * queda como respaldo).
 *
 * Optimizaciones:
 *  - Caché en localStorage por 1 hora (no re-descarga en cada visita)
 *  - Índice por indicativo (búsqueda O(1))
 *  - Fallback en cadena: GitHub Pages → qsl.net → proxy CORS
 *  - Parseo de fecha embebida en el nombre del archivo JPG
 */

const QSL_JSON_URL = "https://juank329.github.io/ce4jwi-qsls/log_qsl.json"
const QSL_JSON_URL_QSLNET = "https://qsl.net/ce4jwi/log_qsl.json"
const QSL_CACHE_KEY = "ce4jwi_qsl_cache_v1"
const QSL_CACHE_TTL_MS = 5 * 60 * 1000  // 5 minutos

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
  const mHora  = nombre.match(/_(\d{4})_(?=[^_]*\.[a-z]+$)/i) // 4 dígitos antes del modo+ext
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

async function fetchQSLData(opciones = {}) {
  const forzar = !!opciones.forzar
  // 1) Caché local (instantáneo) — salvo que se pida recarga forzada
  if (!forzar) {
    const cache = cargarCache()
    if (cache) {
      return { data: cache, fuente: "cache" }
    }
  }

  // 2) Intentar en orden: GitHub Pages (CORS OK) → proxies qsl.net
  const ts = Date.now()
  const directa = `${QSL_JSON_URL}?t=${ts}`
  const directa_qslnet = `${QSL_JSON_URL_QSLNET}?t=${ts}`
  const intentos = [
    { url: directa,                                                              nombre: "GitHub Pages" },
    { url: `https://api.allorigins.win/raw?url=${encodeURIComponent(directa_qslnet)}`, nombre: "allorigins" },
    { url: `https://corsproxy.io/?url=${encodeURIComponent(directa_qslnet)}`,          nombre: "corsproxy.io" },
    { url: `https://r.jina.ai/http://${encodeURIComponent(directa_qslnet)}`,           nombre: "jina.ai" },
    { url: `https://cors.bridged.cc/${encodeURIComponent(directa_qslnet)}`,           nombre: "bridged.cc" },
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

// ---- Proxy imágenes para evitar hotlink qsl.net -------------------
// Las imágenes nuevas se alojan en GitHub Pages (ce4jwi-qsls/qsl_images/)
// Las antiguas en qsl.net usan proxies como fallback

const IMG_PROXIES = [
  u => 'https://images.weserv.nl/?url=' + encodeURIComponent(u.replace('https://', '')),
  u => 'https://corsproxy.io/?' + encodeURIComponent(u),
  u => 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u),
  u => 'https://images.weserv.nl/?url=' + encodeURIComponent(u),
]

let imgProxyIndex = 0

function proxyImg(url) {
  return { proxied: url, original: url }
}

function nextImgProxy() {
  imgProxyIndex = (imgProxyIndex + 1) % IMG_PROXIES.length
  console.log(`[IMG PROXY] Cambiando a proxy #${imgProxyIndex + 1}`)
  return IMG_PROXIES[imgProxyIndex]
}

// Función para reintentar imágenes rotas con el siguiente proxy
function retryImgWithNextProxy(img) {
  if (!img || !img.src) return
  // Usar la URL original guardada, no la URL ya proxyeada
  const originalUrl = img.dataset.originalUrl || img.src
  if (!originalUrl.includes('qsl.net/ce4jwi/')) return
  
  const nextProxy = nextImgProxy()
  const newSrc = nextProxy(originalUrl)
  
  if (newSrc !== img.src) {
    console.log(`[IMG RETRY] Reintentando con proxy: ${newSrc}`)
    img.src = newSrc
  }
}

// ---- Expiración de QSLs -----------------------------------------------
// LOG4OM: 2 años desde fecha de contacto
// APRS:   1 mes  desde fecha de contacto

const DURACION_LOG4OM_MS = 2 * 365 * 24 * 60 * 60 * 1000  // 2 años
const DURACION_APRS_MS   = 30 * 24 * 60 * 60 * 1000         // 1 mes

function estaExpirada(item) {
  const fuente = (item.fuente || "log4om").toLowerCase()
  const duracion = fuente === "aprs" ? DURACION_APRS_MS : DURACION_LOG4OM_MS
  // Usar fecha del JSON si existe, si no parsear del nombre
  let fechaContacto = item.fecha || ""
  if (!fechaContacto) {
    const m = (item.archivo || "").match(/(\d{2})-(\d{2})-(\d{4})/)
    if (m) fechaContacto = `${m[3]}-${m[2]}-${m[1]}`
  }
  if (!fechaContacto) return false
  const ts = new Date(fechaContacto).getTime()
  if (isNaN(ts)) return false
  return (Date.now() - ts) > duracion
}

// ---- Indexado por indicativo -----------------------------------------

function indexar(data) {
  qslPlanas = []
  indicePorIndicativo = {}
  if (!Array.isArray(data)) return
  for (const item of data) {
    if (estaExpirada(item)) continue
    const cs = (item.call || "").toUpperCase().trim()
    if (!cs) continue
    const meta = parsearNombreArchivo(item.archivo || "")
    const { proxied, original } = proxyImg(item.url || "")
    const normalizado = {
      indicativo: cs,
      actividad: (item.carpeta || "").replace(/_/g, " "),
      archivo: item.archivo || "",
      url: proxied,
      urlOriginal: original,
      fecha: meta.fecha,
      hora: meta.hora,
      modo: meta.modo,
      fuente: item.fuente || "log4om",
    }
    qslPlanas.push(normalizado)
    if (!indicePorIndicativo[cs]) indicePorIndicativo[cs] = []
    indicePorIndicativo[cs].push(normalizado)
  }
  // Ordenar cada grupo por fecha (YYYY/MM/DD → orden lexicográfico funciona)
  for (const cs in indicePorIndicativo) {
    indicePorIndicativo[cs].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""))
  }

  renderUltimaQSL()
}

// ---- Última QSL generada (destacado) -------------------------------

function elegirUltimaQSL() {
  if (!qslPlanas.length) return null
  return qslPlanas.reduce((mejor, q) => {
    const clave = (q.fecha || "").split("/").reverse().join("") + (q.hora || "")
    const claveMejor = (mejor.fecha || "").split("/").reverse().join("") + (mejor.hora || "")
    return clave >= claveMejor ? q : mejor
  })
}

function renderUltimaQSL() {
  const sec = document.getElementById("qslUltima")
  if (!sec) return
  const q = elegirUltimaQSL()
  if (!q) {
    sec.style.display = "none"
    return
  }
  sec.style.display = ""

  const img = document.getElementById("qslUltimaImg")
  const call = document.getElementById("qslUltimaCall")
  const act = document.getElementById("qslUltimaActividad")
  const meta = document.getElementById("qslUltimaMeta")
  const hint = document.getElementById("qslUltimaHint")

  if (img) {
    img.onerror = () => {
      const wrap = img.parentElement
      if (wrap) wrap.innerHTML = `<div class="qsl-vacio">Imagen no disponible</div>`
    }
    img.src = q.url
  }
  if (call) call.textContent = q.indicativo
  if (act) act.textContent = q.actividad
  if (meta) meta.textContent = `${q.fecha || ""} ${q.hora || ""} · ${q.modo || ""}`
  if (hint) hint.textContent = "Haz clic en la QSL para ampliarla"

  const wrap = document.getElementById("qslUltimaImgWrap")
  if (wrap) {
    wrap.onclick = (e) => {
      e.preventDefault()
      lightboxItems = [q]
      abrirLightbox(0)
    }
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
  const dataOriginal = q.urlOriginal && q.urlOriginal !== q.url ? ` data-original-url="${escapar(q.urlOriginal)}"` : ""
  return `
    <div class="qsl-tarjeta" onclick="abrirLightbox(${i})">
      <img src="${escapar(q.url)}" alt="QSL ${escapar(q.indicativo)}" loading="lazy"${dataOriginal}
           onerror="ocultarTarjetaRota(this)">
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

// Si la imagen falla, reintenta una vez. Si falla de nuevo, muestra aviso.
function ocultarTarjetaRota(img) {
  if (!img) return
  
  if (!img.dataset.retry) {
    img.dataset.retry = 1
    const src = img.src
    img.src = ""
    setTimeout(() => { img.src = src }, 500)
    return
  }
  
  // Reintento fallido — mostrar aviso en la tarjeta
  const tarjeta = img.closest(".qsl-tarjeta")
  if (tarjeta) {
    const info = tarjeta.querySelector(".qsl-tarjeta-info")
    if (info) {
      const aviso = document.createElement("div")
      aviso.className = "qsl-tarjeta-meta"
      aviso.style.color = "#e74c3c"
      aviso.textContent = "Imagen no disponible"
      info.appendChild(aviso)
    }
  }
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

// Precarga con re-validación en background: muestra la caché al instante
// y luego descarga los datos frescos en silencio (sin botón de actualizar).
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("qslCall")
  if (input) input.focus()

  if (qslPlanas.length === 0 && !window._qslPrecargando) {
    window._qslPrecargando = true

    // 1) Instante: usar la copia local si existe
    const cache = cargarCache()
    if (cache && Array.isArray(cache)) {
      indexar(cache)
    }

    // 2) Re-validación: siempre descargar lo último en background
    fetchQSLData({ forzar: true })
      .then(({ data }) => {
        indexar(data)
        window._qslPrecargando = false
        window.dispatchEvent(new CustomEvent("qsl:actualizado"))
        const q = document.getElementById("qslCall")
        if (q && q.value.trim()) buscarQSL({ preventDefault: () => {} })
      })
      .catch(() => { window._qslPrecargando = false })
  }
})