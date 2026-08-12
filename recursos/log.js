/**
 * LOG EN TIEMPO REAL — CE4JWI
 * Consume el endpoint público XML/JSONP de HRDLog.net vía CORS proxy.
 * Polling cada 10s, cache localStorage 30s.
 */

const LOG_HRDLOG_URL = "https://www.hrdlog.net/hrdlog.aspx?qrz=CE4JWI&numqso=50"
const LOG_CACHE_KEY  = "ce4jwi_log_cache_v1"
const LOG_CACHE_TTL  = 30 * 1000  // 30s
const LOG_POLL_MS    = 10 * 1000  // 10s

// ---- Estado ----
let qsosGlobal = []
let filtroTexto = ""
let filtroBanda = "all"
let filtroModo  = "all"
let pollTimer = null

// ---- Mapa DXCC (subset más común — Ampliable) ----
// HRDLog entrega <DXCC>número</DXCC>; aquí mapeamos algunos a país + emoji.
// Si no está, mostramos "DXCC #n".
const DXCC_MAP = {
  15:  { name: "Asiatic Russia",        flag: "🇷🇺" },
  27:  { name: "Belarus",               flag: "🇧🇾" },
  54:  { name: "European Russia",       flag: "🇷🇺" },
  209: { name: "Belgium",               flag: "🇧🇪" },
  242: { name: "Iceland",               flag: "🇮🇸" },
  248: { name: "Italy",                 flag: "🇮🇹" },
  263: { name: "Netherlands",           flag: "🇳🇱" },
  266: { name: "Norway",                flag: "🇳🇴" },
  269: { name: "Poland",                flag: "🇵🇱" },
  281: { name: "Spain",                 flag: "🇪🇸" },
  287: { name: "Switzerland",           flag: "🇨🇭" },
  291: { name: "United States",         flag: "🇺🇸" },
  318: { name: "China",                 flag: "🇨🇳" },
  146: { name: "Austria",               flag: "🇦🇹" },
  144: { name: "Australia",             flag: "🇦🇺" },
  100: { name: "Argentina",             flag: "🇦🇷" },
  108: { name: "Brazil",                flag: "🇧🇷" },
  112: { name: "Chile",                 flag: "🇨🇱" },
  136: { name: "Cuba",                  flag: "🇨🇺" },
  148: { name: "Canary Islands",        flag: "🇮🇨" },
  150: { name: "Easter Island",         flag: "🇨🇱" },
  151: { name: "Antarctica",            flag: "🇦🇶" },
  163: { name: "Dominican Republic",    flag: "🇩🇴" },
  169: { name: "Falkland Islands",      flag: "🇫🇰" },
  170: { name: "French Guiana",         flag: "🇬🇫" },
  174: { name: "Greenland",             flag: "🇬🇱" },
  199: { name: "Guam",                  flag: "🇬🇺" },
  203: { name: "Hawaii",                flag: "🇺🇸" },
  220: { name: "Ireland",               flag: "🇮🇪" },
  223: { name: "Japan",                 flag: "🇯🇵" },
  233: { name: "Korea, Republic of",    flag: "🇰🇷" },
  239: { name: "Luxembourg",            flag: "🇱🇺" },
  246: { name: "Israel",                flag: "🇮🇱" },
  259: { name: "Mexico",                flag: "🇲🇽" },
  272: { name: "Portugal",              flag: "🇵🇹" },
  277: { name: "Romania",               flag: "🇷🇴" },
  284: { name: "Sweden",                flag: "🇸🇪" },
  293: { name: "Uruguay",               flag: "🇺🇾" },
  297: { name: "Panama",                flag: "🇵🇦" },
  304: { name: "Ukraine",               flag: "🇺🇦" },
  321: { name: "Philippines",           flag: "🇵🇭" },
  327: { name: "New Zealand",           flag: "🇳🇿" },
  339: { name: "India",                 flag: "🇮🇳" },
  344: { name: "Indonesia",             flag: "🇮🇩" },
  363: { name: "South Africa",          flag: "🇿🇦" },
  497: { name: "Croatia",               flag: "🇭🇷" },
  503: { name: "Czech Republic",        flag: "🇨🇿" },
  505: { name: "Slovakia",              flag: "🇸🇰" },
  510: { name: "Cyprus",                flag: "🇨🇾" },
  522: { name: "French Polynesia",      flag: "🇵🇫" },
}

// Bandas → color
const BAND_COLORS = {
  "160m": "#8b5cf6",
  "80m":  "#5ac8fa",
  "60m":  "#0ea5e9",
  "40m":  "#34c759",
  "30m":  "#10b981",
  "20m":  "#f59e0b",
  "17m":  "#ef4444",
  "15m":  "#dc2626",
  "12m":  "#ec4899",
  "10m":  "#d946ef",
  "6m":   "#a855f7",
  "2m":   "#6366f1",
  "70cm": "#3b82f6",
}

// ---- Parseo XML/JSONP de HRDLog ----
function parsearHrdlog(texto) {
  // HRDLog envuelve la respuesta en: function HrdlogResponse() { return '<xml>...</xml>'; }
  // Extraemos el XML dentro del string
  let xml = texto
  const match = texto.match(/return\s+['"]([\s\S]*?)['"]\s*;?/)
  if (match) xml = match[1]

  // Parseamos DOM
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, "text/xml")

  // Chequear errores
  if (doc.querySelector("parsererror")) return []

  const logbooks = Array.from(doc.getElementsByTagName("Logbooks"))
  return logbooks.map((lb) => {
    const get = (tag) => {
      const el = lb.getElementsByTagName(tag)[0]
      return el ? el.textContent.trim() : ""
    }
    const dxccNum = parseInt(get("DXCC"), 10)
    const dxccInfo = DXCC_MAP[dxccNum] || { name: `DXCC #${dxccNum || "?"}`, flag: "🏳️" }
    return {
      id: get("id"),
      callsign: get("Station"),
      startTime: get("StartTime"),
      band: get("BandMHz"),
      mode: get("Mode"),
      reportSent: get("ReportSent"),
      reportRecv: get("ReportRecv"),
      dxccNum,
      country: dxccInfo.name,
      flag: dxccInfo.flag,
      comment: get("Comment"),
    }
  })
}

// ---- Fetch con CORS proxy ----
async function fetchConTimeout(url, ms) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try { return await fetch(url, { signal: ctrl.signal, cache: "no-store" }) }
  finally { clearTimeout(t) }
}

async function fetchQsos() {
  const proxies = [
    { url: (u) => `https://cors.sh/${u}`,                                nombre: "cors.sh" },
    { url: (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`, nombre: "allorigins" },
  ]
  for (const p of proxies) {
    try {
      const r = await fetchConTimeout(p.url(LOG_HRDLOG_URL), 12000)
      if (!r.ok) continue
      const txt = await r.text()
      const evs = parsearHrdlog(txt)
      if (evs.length > 0) return evs
    } catch (e) {
      console.warn(`[log] ${p.nombre}:`, e.message || e)
    }
  }
  return null
}

// ---- Cache ----
function cargarCache() {
  try {
    const raw = localStorage.getItem(LOG_CACHE_KEY)
    if (!raw) return null
    const c = JSON.parse(raw)
    if (Date.now() - c.ts > LOG_CACHE_TTL) return null
    return c.data
  } catch { return null }
}

function guardarCache(data) {
  try { localStorage.setItem(LOG_CACHE_KEY, JSON.stringify({ ts: Date.now(), data })) }
  catch {}
}

// ---- Helpers ----
function escapeHtml(s) {
  const d = document.createElement("div")
  d.textContent = s ?? ""
  return d.innerHTML.replace(/"/g, "&quot;")
}

function formatearHora(iso) {
  // iso = "2026-08-11T15:03:00+02:00"
  if (!iso) return "—"
  const m = iso.match(/T(\d{2}):(\d{2})/)
  return m ? `${m[1]}:${m[2]}` : "—"
}

function formatearFecha(iso) {
  if (!iso) return "—"
  const m = iso.match(/(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "—"
}

function esHoy(iso) {
  if (!iso) return false
  const m = iso.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return false
  const hoy = new Date()
  return hoy.getFullYear() === parseInt(m[1]) &&
         (hoy.getMonth() + 1) === parseInt(m[2]) &&
         hoy.getDate() === parseInt(m[3])
}

// ---- Stats ----
function calcularStats(qsos) {
  const hoy = qsos.filter((q) => esHoy(q.startTime))
  const paises = new Set(qsos.map((q) => q.dxccNum))
  const bandas  = {}
  const modos   = {}
  qsos.forEach((q) => {
    bandas[q.band] = (bandas[q.band] || 0) + 1
    modos[q.mode]  = (modos[q.mode]  || 0) + 1
  })
  const topBanda = Object.entries(bandas).sort((a, b) => b[1] - a[1])[0]
  const topModo  = Object.entries(modos).sort((a, b) => b[1] - a[1])[0]
  return {
    total: qsos.length,
    hoy: hoy.length,
    paises: paises.size,
    bandaTop: topBanda ? topBanda[0] : "—",
    modoTop:  topModo  ? topModo[0]  : "—",
    lastTime: qsos[0] ? formatearHora(qsos[0].startTime) : "—",
    lastCall: qsos[0] ? qsos[0].callsign : "—",
  }
}

// ---- Render ----
function renderHero(stats, refreshing) {
  return `
    <div class="log-hero">
      <div class="log-hero-content">
        <div class="log-hero-info">
          <div class="log-callsign">
            <span class="log-callsign-icon">📡</span>
            CE4JWI
          </div>
          <div class="log-callsign-sub">
            Último QSO: <strong style="color:#fff">${escapeHtml(stats.lastCall)}</strong>
            a las <strong style="color:#fff">${stats.lastTime}</strong> UTC${stats.lastCall === "—" ? "" : ""}
          </div>
        </div>
        <div class="log-hero-actions">
          <span class="log-live-badge">
            <span class="log-live-dot"></span>
            En vivo
          </span>
          <button class="log-refresh-btn ${refreshing ? "refreshing" : ""}" id="logRefreshBtn" aria-label="Actualizar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
            </svg>
            Actualizar
          </button>
        </div>
      </div>
    </div>
  `
}

function renderStats(stats) {
  return `
    <div class="log-stats">
      <div class="log-stat" style="--accent:var(--log-blue)">
        <span class="log-stat-label">QSO totales</span>
        <span class="log-stat-value">${stats.total}</span>
        <span class="log-stat-extra">en tu log</span>
      </div>
      <div class="log-stat" style="--accent:var(--log-green)">
        <span class="log-stat-label">Hoy</span>
        <span class="log-stat-value">${stats.hoy}</span>
        <span class="log-stat-extra">contactos nuevos</span>
      </div>
      <div class="log-stat" style="--accent:var(--log-orange)">
        <span class="log-stat-label">Países / DXCC</span>
        <span class="log-stat-value">${stats.paises}</span>
        <span class="log-stat-extra">únicos</span>
      </div>
      <div class="log-stat" style="--accent:var(--log-purple)">
        <span class="log-stat-label">Banda top</span>
        <span class="log-stat-value">${escapeHtml(stats.bandaTop)}</span>
        <span class="log-stat-extra">más usada</span>
      </div>
      <div class="log-stat" style="--accent:var(--log-cyan)">
        <span class="log-stat-label">Modo top</span>
        <span class="log-stat-value">${escapeHtml(stats.modoTop)}</span>
        <span class="log-stat-extra">más usado</span>
      </div>
    </div>
  `
}

function obtenerBandas(qsos) {
  return Array.from(new Set(qsos.map((q) => q.band))).sort()
}

function obtenerModos(qsos) {
  return Array.from(new Set(qsos.map((q) => q.mode))).sort()
}

function renderFiltros(qsos) {
  const bandas = obtenerBandas(qsos)
  const modos = obtenerModos(qsos)
  return `
    <div class="log-filters">
      <input type="text" class="log-filter-input" id="logFilterText" placeholder="🔍 Buscar indicativo, país, DXCC..." value="${escapeHtml(filtroTexto)}" autocomplete="off">
      <div class="log-filter-pills" id="logBandaPills">
        <button class="log-pill ${filtroBanda === "all" ? "active" : ""}" data-banda="all">Todas</button>
        ${bandas.map((b) => `<button class="log-pill ${filtroBanda === b ? "active" : ""}" data-banda="${escapeHtml(b)}" style="${filtroBanda === b ? `background:${BAND_COLORS[b] || "var(--log-blue)"};border-color:${BAND_COLORS[b] || "var(--log-blue)"}` : ""}">${escapeHtml(b)}</button>`).join("")}
      </div>
      <div class="log-filter-pills" id="logModoPills">
        ${modos.map((m) => `<button class="log-pill ${filtroModo === m ? "active" : ""}" data-modo="${escapeHtml(m)}">${escapeHtml(m)}</button>`).join("")}
      </div>
    </div>
  `
}

function filtrar(qsos) {
  const t = filtroTexto.toLowerCase().trim()
  return qsos.filter((q) => {
    if (filtroBanda !== "all" && q.band !== filtroBanda) return false
    if (filtroModo  !== "all" && q.mode !== filtroModo)  return false
    if (t && !(
      q.callsign.toLowerCase().includes(t) ||
      q.country.toLowerCase().includes(t) ||
      String(q.dxccNum).includes(t) ||
      q.band.toLowerCase().includes(t) ||
      q.mode.toLowerCase().includes(t)
    )) return false
    return true
  })
}

function renderCard(q, isNew) {
  const color = BAND_COLORS[q.band] || "var(--log-blue)"
  return `
    <div class="log-card ${isNew ? "new" : ""}" data-id="${escapeHtml(q.id)}">
      <div class="log-card-header">
        <div>
          <div class="log-station">${escapeHtml(q.callsign)}</div>
          <div class="log-country">
            <span>${q.flag}</span>
            <span>${escapeHtml(q.country)}</span>
          </div>
        </div>
        <span class="log-flag-fallback" title="${escapeHtml(q.country)}">${q.flag}</span>
      </div>
      <div class="log-card-body">
        <div class="log-field">
          <span class="log-field-label">Banda</span>
          <span class="log-field-value" style="color:${color}">${escapeHtml(q.band)}</span>
        </div>
        <div class="log-field">
          <span class="log-field-label">Modo</span>
          <span class="log-field-value">${escapeHtml(q.mode)}</span>
        </div>
        <div class="log-field">
          <span class="log-field-label">RST enviado</span>
          <span class="log-field-value">${escapeHtml(q.reportSent || "—")}</span>
        </div>
        <div class="log-field">
          <span class="log-field-label">RST recibido</span>
          <span class="log-field-value">${escapeHtml(q.reportRecv || "—")}</span>
        </div>
      </div>
      <div class="log-time">
        <svg class="log-time-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        ${formatearFecha(q.startTime)} · ${formatearHora(q.startTime)} UTC
      </div>
    </div>
  `
}

function renderGrid(qsos, prevIds) {
  const filtered = filtrar(qsos)
  if (filtered.length === 0) {
    return `<div class="log-empty">Sin contactos que coincidan con los filtros.</div>`
  }
  return `
    <div class="log-grid">
      ${filtered.map((q) => {
        const isNew = prevIds && !prevIds.has(q.id)
        return renderCard(q, isNew)
      }).join("")}
    </div>
  `
}

function renderApp(refreshing) {
  const app = document.getElementById("logApp")
  if (!app) return

  if (qsosGlobal.length === 0 && refreshing !== "loading") {
    app.innerHTML = `
      ${renderHero({ total: 0, hoy: 0, paises: 0, bandaTop: "—", modoTop: "—", lastTime: "—", lastCall: "—" }, false)}
      <div class="log-empty">No se pudieron cargar contactos. Verifica tu conexión o que HRDLog.net esté disponible.</div>
    `
    wireEvents()
    return
  }

  const stats = calcularStats(qsosGlobal)
  app.innerHTML = `
    ${renderHero(stats, refreshing === true)}
    ${renderStats(stats)}
    ${renderFiltros(qsosGlobal)}
    <div id="logGrid">${renderGrid(qsosGlobal, window.__logPrevIds)}</div>
  `
  wireEvents()
}

function wireEvents() {
  document.getElementById("logRefreshBtn")?.addEventListener("click", () => cargar(true))

  const textInput = document.getElementById("logFilterText")
  textInput?.addEventListener("input", (e) => {
    filtroTexto = e.target.value
    document.getElementById("logGrid").innerHTML = renderGrid(qsosGlobal)
    wireCards()
  })

  document.querySelectorAll("#logBandaPills .log-pill").forEach((p) => {
    p.addEventListener("click", () => {
      filtroBanda = p.dataset.banda
      renderApp(false)
    })
  })
  document.querySelectorAll("#logModoPills .log-pill").forEach((p) => {
    p.addEventListener("click", () => {
      filtroModo = p.dataset.modo
      renderApp(false)
    })
  })

  wireCards()
}

function wireCards() {
  document.querySelectorAll(".log-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.id
      const q = qsosGlobal.find((x) => x.id === id)
      if (q) abrirModal(q)
    })
  })
}

// ---- Modal ----
function abrirModal(q) {
  const modal = document.createElement("div")
  modal.className = "log-modal-bg active"
  const color = BAND_COLORS[q.band] || "var(--log-blue)"
  modal.innerHTML = `
    <div class="log-modal" onclick="event.stopPropagation()">
      <div class="log-modal-header">
        <div>
          <div class="log-modal-station">${escapeHtml(q.callsign)}</div>
          <div class="log-modal-country">
            <span>${q.flag}</span>
            <span>${escapeHtml(q.country)}</span>
            <span style="color:var(--log-text-muted)">· DXCC #${q.dxccNum || "?"}</span>
          </div>
        </div>
        <button class="log-modal-close" id="logModalClose" aria-label="Cerrar">×</button>
      </div>
      <div class="log-modal-body">
        <div class="log-modal-field">
          <span class="log-modal-field-label">Fecha</span>
          <span class="log-modal-field-value">${formatearFecha(q.startTime)}</span>
        </div>
        <div class="log-modal-field">
          <span class="log-modal-field-label">Hora UTC</span>
          <span class="log-modal-field-value">${formatearHora(q.startTime)}</span>
        </div>
        <div class="log-modal-field">
          <span class="log-modal-field-label">Banda</span>
          <span class="log-modal-field-value" style="color:${color}">${escapeHtml(q.band)}</span>
        </div>
        <div class="log-modal-field">
          <span class="log-modal-field-label">Modo</span>
          <span class="log-modal-field-value">${escapeHtml(q.mode)}</span>
        </div>
        <div class="log-modal-field">
          <span class="log-modal-field-label">RST enviado</span>
          <span class="log-modal-field-value">${escapeHtml(q.reportSent || "—")}</span>
        </div>
        <div class="log-modal-field">
          <span class="log-modal-field-label">RST recibido</span>
          <span class="log-modal-field-value">${escapeHtml(q.reportRecv || "—")}</span>
        </div>
        <div class="log-modal-field full">
          <span class="log-modal-field-label">Comentario</span>
          <span class="log-modal-field-value">${escapeHtml(q.comment || "—")}</span>
        </div>
      </div>
      <div class="log-modal-footer">Fuente: HRDLog.net</div>
    </div>
  `
  document.body.appendChild(modal)
  document.body.style.overflow = "hidden"
  modal.addEventListener("click", (e) => { if (e.target === modal) cerrarModal() })
  modal.querySelector("#logModalClose").addEventListener("click", cerrarModal)
}

function cerrarModal() {
  document.querySelectorAll(".log-modal-bg").forEach((m) => m.remove())
  document.body.style.overflow = ""
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarModal()
})

// ---- Carga principal + polling ----
async function cargar(manual = false) {
  const cache = cargarCache()
  if (cache && !manual) {
    qsosGlobal = cache
    renderApp(false)
  } else {
    if (qsosGlobal.length === 0) {
      const app = document.getElementById("logApp")
      if (app) app.innerHTML = `
        <div class="log-loading">
          <div class="log-spinner"></div>
          <div>Sincronizando con HRDLog.net…</div>
        </div>
      `
    } else {
      renderApp(true)  // muestra estado refreshing
    }
  }

  const nuevos = await fetchQsos()
  if (nuevos && nuevos.length > 0) {
    window.__logPrevIds = new Set(qsosGlobal.map((q) => q.id))
    qsosGlobal = nuevos
    guardarCache(nuevos)
    renderApp(false)
  } else if (qsosGlobal.length === 0) {
    renderApp(false)
  }
}

async function initLog() {
  if (!document.getElementById("logApp")) return
  await cargar(false)
  if (pollTimer) clearInterval(pollTimer)
  pollTimer = setInterval(() => cargar(false), LOG_POLL_MS)
}

document.addEventListener("DOMContentLoaded", initLog)