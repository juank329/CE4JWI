/**
 * Buscador de Indicativos SUBTEL
 * ------------------------------
 * Los listados de SUBTEL son PDFs pesados que pdf.js tarda ~15-25 s en
 * parsear por completo. Para que la búsqueda sea INSTANTÁNEA, los PDFs
 * se pre-procesan en build-time a un JSON estático
 * (./recursos/indicativos.json) que cargamos con caché + proxy CORS.
 *
 * Cuando el usuario quiere actualizar los datos (cada ~1 mes):
 *   1) Descargar PDFs actualizados de SUBTEL.
 *   2) Correr el script de regeneración (build-indicativos.js).
 *   3) Commit + push → Netlify lo publica.
 *
 * Estrategia de carga (en orden, primera que funcione):
 *   1) localStorage (caché de 24 h)
 *   2) URL del JSON en qsl.net vía cors.sh (siempre actualiza al instante)
 *   3) Fallback al JSON local (./recursos/indicativos.json)
 */

const INDICATIVOS_JSON_URL = "https://qsl.net/ce4jwi/indicativos.json"
const INDICATIVOS_JSON_LOCAL = "recursos/indicativos.json"
const CACHE_KEY = "ce4jwi_indicativos_v2"
const CACHE_TTL_MS = 24 * 60 * 60 * 1000  // 24 h

const PAGINA_TAMANO = 25
const PROXIES_CORS = [
  { url: (u) => `https://cors.sh/${u}`,                         nombre: "cors.sh" },
  { url: (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`, nombre: "allorigins" },
]

// ====================== ESTADO =======================================
const cacheIndicativos = {}
let REGIONES = []
let ANIOS_VENCE = []
let indicePorIndicativo = {}

// ====================== HELPERS ======================================
function escapar(s) {
  const d = document.createElement("div")
  d.textContent = (s ?? "").toString()
  return d.innerHTML
}

function setEstado(html, error = false) {
  const el = document.getElementById("indiEstado")
  if (!el) return
  el.innerHTML = html
    ? `<div class="indi-estado ${error ? "error" : ""}">${
        error ? "" : '<span class="spinner"></span>'
      }<span>${html}</span></div>`
    : ""
}

// ====================== CACHÉ ========================================
function cargarCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cached = JSON.parse(raw)
    if (Date.now() - cached.ts > CACHE_TTL_MS) return null
    return cached.data
  } catch { return null }
}

function guardarCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
  } catch { /* localStorage lleno, ignorar */ }
}

// ====================== FETCH ========================================
async function fetchConTimeout(url, ms) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, { signal: ctrl.signal, cache: "no-store" })
  } finally { clearTimeout(t) }
}

async function fetchJSON(url, timeoutMs) {
  // 1) Proxies CORS en orden
  for (const p of PROXIES_CORS) {
    try {
      const r = await fetchConTimeout(p.url(url), timeoutMs)
      if (r.ok) return await r.json()
    } catch (e) {
      console.warn(`[indicativos] proxy ${p.nombre} falló:`, e.message || e)
    }
  }
  // 2) Directo (sin proxy)
  try {
    const r = await fetchConTimeout(url, timeoutMs)
    if (r.ok) return await r.json()
  } catch (e) {
    console.warn("[indicativos] fetch directo falló:", e.message || e)
  }
  throw new Error(`No se pudo cargar ${url}`)
}

// ====================== CARGA ========================================
async function cargarIndicativos({ silencioso = false } = {}) {
  if (!silencioso) setEstado("Cargando base de indicativos…")

  // 1) Caché local
  const cache = cargarCache()
  if (cache) {
    if (!silencioso) setEstado("")
    aplicarDatos(cache)
    // Refresco silencioso en background (la próxima visita ya tendrá datos frescos)
    recargarEnBackground()
    return
  }

  // 2) Remoto vía proxies (o local como último fallback)
  try {
    const data = await fetchJSON(INDICATIVOS_JSON_URL, 15000)
    guardarCache(data)
    aplicarDatos(data)
    if (!silencioso) setEstado("")
  } catch (eRemoto) {
    console.warn("[indicativos] remoto falló:", eRemoto.message)
    // 3) Fallback: archivo local (servido por Netlify, sin CORS)
    try {
      const r = await fetchConTimeout(INDICATIVOS_JSON_LOCAL, 5000)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      guardarCache(data)
      aplicarDatos(data)
      if (!silencioso) setEstado("")
    } catch (eLocal) {
      throw new Error(`No se pudo cargar la base ni de qsl.net ni local: ${eLocal.message}`)
    }
  }
}

function recargarEnBackground() {
  fetchJSON(INDICATIVOS_JSON_URL, 15000)
    .then((data) => guardarCache(data))
    .catch(() => { /* silencio: ya tenemos caché válido */ })
}

// ====================== INDEXADO =====================================
function aplicarDatos(filas) {
  cacheIndicativos._todas = filas
  indicePorIndicativo = {}
  for (const r of filas) {
    const cs = (r.indicativo || "").toUpperCase().trim()
    if (!cs) continue
    if (!indicePorIndicativo[cs]) indicePorIndicativo[cs] = []
    indicePorIndicativo[cs].push(r)
  }
  poblarSelectores()
}

function todasLasFilas() {
  return cacheIndicativos._todas || []
}

// ====================== FILTRADO ====================================
function coincideIndicativo(ind, patron) {
  const limpio = patron.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")
  return new RegExp("^" + limpio + "$", "i").test(ind)
}

function aplicarFiltros() {
  const q       = (document.getElementById("indiQ").value || "").trim()
  const cat     = document.getElementById("indiCat").value
  const zona    = document.getElementById("indiZona").value
  const region  = document.getElementById("indiRegion").value
  const comuna  = (document.getElementById("indiComuna").value || "").trim().toLowerCase()
  const vence   = document.getElementById("indiVence").value

  const filas = todasLasFilas()
  const qLower = q.toLowerCase()

  return filas.filter((r) => {
    if (cat   && r.catKey !== cat) return false
    if (zona  && r.zona   !== zona) return false
    if (region && r.region !== region) return false
    if (comuna && !(r.comuna || "").toLowerCase().includes(comuna)) return false
    if (vence && (r.vence || "").split("/").pop() !== vence) return false

    if (q) {
      const okIndicativo = q.includes("*") ? coincideIndicativo(r.indicativo, q) : (r.indicativo.toLowerCase().includes(qLower))
      const okNombre  = (r.nombre || "").toLowerCase().includes(qLower)
      const okLic     = (r.licencia || "").toLowerCase().includes(qLower)
      if (!(okIndicativo || okNombre || okLic)) return false
    }
    return true
  }).sort((a, b) => a.indicativo.localeCompare(b.indicativo))
}

// ====================== SELECTORES ==================================
function poblarSelectores() {
  const filas = todasLasFilas()
  REGIONES = [...new Set(filas.map((r) => r.region).filter(Boolean))].sort()
  const sel = document.getElementById("indiRegion")
  if (sel) {
    sel.innerHTML = '<option value="">Todas</option>' +
      REGIONES.map((r) => `<option value="${escapar(r)}">${escapar(r)}</option>`).join("")
  }

  ANIOS_VENCE = [...new Set(filas.map((r) => (r.vence || "").split("/").pop()).filter(Boolean))].sort()
  const selA = document.getElementById("indiVence")
  if (selA) {
    selA.innerHTML = '<option value="">Cualquiera</option>' +
      ANIOS_VENCE.map((a) => `<option value="${escapar(a)}">${escapar(a)}</option>`).join("")
  }
}

// ====================== BÚSQUEDA + RENDER ============================
let paginaActual = 1

async function buscarIndicativos(ev) {
  if (ev) ev.preventDefault()

  // Si todavía no hay datos, los pedimos (la primera vez será visible)
  if (!cacheIndicativos._todas) {
    try {
      await cargarIndicativos()
    } catch (e) {
      setEstado(e.message, true)
      return
    }
  }

  const resultados = aplicarFiltros()
  paginaActual = 1
  render(resultados)
}

function limpiarFiltros() {
  document.getElementById("indiQ").value = ""
  document.getElementById("indiCat").value = ""
  document.getElementById("indiZona").value = ""
  document.getElementById("indiRegion").value = ""
  document.getElementById("indiComuna").value = ""
  document.getElementById("indiVence").value = ""
  document.getElementById("indiResultados").innerHTML = ""
  document.getElementById("indiPaginacion").innerHTML = ""
  document.getElementById("indiContador").innerHTML = ""
  document.getElementById("indiQ").focus()
}

function render(filas) {
  const contRes = document.getElementById("indiResultados")
  const contPag = document.getElementById("indiPaginacion")
  const contCnt = document.getElementById("indiContador")

  contCnt.innerHTML = filas.length
    ? `<strong>${filas.length}</strong> resultado${filas.length === 1 ? "" : "s"}`
    : ""

  if (!filas.length) {
    contRes.innerHTML = `<div class="indi-vacio">No se encontraron indicativos con esos criterios.</div>`
    contPag.innerHTML = ""
    return
  }

  const totalPaginas = Math.ceil(filas.length / PAGINA_TAMANO)
  if (paginaActual > totalPaginas) paginaActual = totalPaginas
  const desde = (paginaActual - 1) * PAGINA_TAMANO
  const hasta = desde + PAGINA_TAMANO
  const pagina = filas.slice(desde, hasta)

  contRes.innerHTML = `
    <div class="indi-tabla-wrap">
      <table class="indi-tabla">
        <thead>
          <tr>
            <th>Indicativo</th>
            <th>Nombre / Alias</th>
            <th>Categoría</th>
            <th>Zona</th>
            <th>Región</th>
            <th>Comuna</th>
            <th>Vence</th>
          </tr>
        </thead>
        <tbody>
          ${pagina.map(filaATr).join("")}
        </tbody>
      </table>
    </div>`

  contPag.innerHTML = ""
  const mkBtn = (label, page, disabled = false, active = false) => {
    const b = document.createElement("button")
    b.textContent = label
    if (active) b.classList.add("active")
    if (disabled) b.disabled = true
    b.onclick = () => { paginaActual = page; render(filas) }
    contPag.appendChild(b)
  }
  mkBtn("«", 1, paginaActual === 1)
  for (let p = 1; p <= totalPaginas; p++) {
    if (totalPaginas > 9 && p > 2 && p < totalPaginas - 1 && Math.abs(p - paginaActual) > 2) {
      if (p === 3 || p === totalPaginas - 2) {
        const d = document.createElement("span")
        d.textContent = "…"
        d.style.padding = "0 0.3rem"
        contPag.appendChild(d)
      }
      continue
    }
    mkBtn(p.toString(), p, false, p === paginaActual)
  }
  mkBtn("»", totalPaginas, paginaActual === totalPaginas)
}

function filaATr(r) {
  const catCls = {
    grl: "grl",     // General (azul)
    nov: "nov",     // Novicio (verde)
    asp: "asp",     // Aspirante (naranja)
    sup: "sup",     // Superior (violeta)
    esp: "esp",     // Distintivo Especial (rojo)
  }[r.catKey] || "grl"
  const zonaBadge = r.zona ? `<span class="badge-zona">Zona ${escapar(r.zona)}</span>` : ""
  return `
    <tr>
      <td><span class="indicativo">${escapar(r.indicativo)}</span></td>
      <td><span class="nombre">${escapar(r.nombre)}</span></td>
      <td><span class="categoria ${catCls}">${escapar(r.categoria)}</span></td>
      <td>${zonaBadge}</td>
      <td>${escapar(r.region)}</td>
      <td>${escapar(r.comuna)}</td>
      <td class="vence">${escapar(r.vence)}</td>
    </tr>`
}

// ====================== INIT ========================================
document.addEventListener("DOMContentLoaded", () => {
  // Carga silenciosa: si hay caché, los datos aparecen al instante,
  // y se refrescan en background.
  cargarIndicativos({ silencioso: !!cargarCache() })
    .catch((e) => {
      console.error(e)
      setEstado("Error cargando la base: " + (e.message || e), true)
    })

  // Foco automático en el buscador
  const q = document.getElementById("indiQ")
  if (q) q.focus()
})