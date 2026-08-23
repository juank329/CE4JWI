/**
 * Calendario CE4JWI - Tipo Apple Calendar
 * Combina eventos de Google Calendar (vía iCal CORS proxy) con eventos locales.
 */

const CAL_ICAL_URL = "https://calendar.google.com/calendar/ical/f96d6d8a7b251e7bf0283bbc1059276e07026b7d0aef13b59e00df2dcb71d1a2@group.calendar.google.com/public/basic.ics"
const CAL_LOCAL_JSON = "recursos/eventos-calendario.json"
const CAL_CACHE_KEY = "ce4jwi_cal_cache_v1"
const CAL_CACHE_TTL = 6 * 60 * 60 * 1000  // 6h

const NOMBRES_MES = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
const NOMBRES_DOW = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const NOMBRES_DOW_FULL = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

const CATEGORIAS = [
  { key: "actividad",   nombre: "Activaciones CE4JWI", dot: "var(--cat-actividad)",   color: "#34c759", label: "ACTIVIDAD" },
  { key: "nacional",    nombre: "Días nacionales",     dot: "var(--cat-nacional)",    color: "#0039a6", label: "CHILE" },
  { key: "mundial",     nombre: "Días mundiales",      dot: "var(--cat-mundial)",     color: "#5856d6", label: "MUNDIAL" },
  { key: "celebracion", nombre: "Celebraciones",       dot: "var(--cat-celebracion)", color: "#d52b1e", label: "CELEBRACIÓN" },
]

// ---- Estado ----
let eventosGlobal = []
let vistaActual = "mes"  // "mes" | "agenda"
let mesActual = new Date()
let diaSeleccionado = null

// ---- iCal parser ----
function parsearICal(texto) {
  const eventos = []
  const lineas = texto.split(/\r?\n/)
  let cur = null
  let inEvent = false

  function unescape(s) {
    return s.replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\n/g, " ")
  }

  for (let i = 0; i < lineas.length; i++) {
    // iCal lines can be folded: line starting with space continues prev
    let linea = lineas[i]
    while (i + 1 < lineas.length && lineas[i + 1].startsWith(" ")) {
      linea += lineas[++i].slice(1)
    }

    if (linea === "BEGIN:VEVENT") {
      cur = {}
      inEvent = true
    } else if (linea === "END:VEVENT") {
      if (cur.summary && cur.dtstart) eventos.push(cur)
      cur = null
      inEvent = false
    } else if (inEvent && cur) {
      const colonIdx = linea.indexOf(":")
      if (colonIdx < 0) continue
      const claveFull = linea.slice(0, colonIdx)
      const valor = unescape(linea.slice(colonIdx + 1))
      const clave = claveFull.split(";")[0]

      if (clave === "SUMMARY") cur.summary = valor
      else if (clave === "DESCRIPTION") cur.description = valor
      else if (clave === "LOCATION") cur.location = valor
      else if (clave === "DTSTART") cur.dtstart = valor
      else if (clave === "DTEND") cur.dtend = valor
    }
  }
  return eventos
}

function clasificar(summary) {
  const s = summary.toLowerCase()
  if (s.includes("actividad") || s.includes("recorriendo") || s.includes("dragon ball") ||
      s.includes("activación") || s.includes("activacion"))
    return "actividad"
  if (s.includes("navidad") || s.includes("halloween") || s.includes("san valentín") ||
      s.includes("año nuevo") || s.includes("víspera") || s.includes("cumpleaños"))
    return "celebracion"
  if (s.includes("mundial") || s.includes("internacional"))
    return "mundial"
  return "nacional"
}

function normalizarEventos(iCalEvents) {
  return iCalEvents
    .filter((e) => e.dtstart)
    .map((e) => {
      const s = e.dtstart
      let fecha, hora, allDay
      if (s.includes("T")) {
        fecha = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
        const hh = s.slice(9, 11)
        const mm = s.slice(11, 13)
        hora = `${hh}:${mm}`
        allDay = false
      } else {
        fecha = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
        hora = null
        allDay = true
      }
      return {
        date: fecha,
        time: hora,
        allDay,
        title: e.summary,
        description: e.description || "",
        category: clasificar(e.summary),
      }
    })
    .sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")))
}

// ---- Carga con caché + proxies ----
function cargarCache() {
  try {
    const raw = localStorage.getItem(CAL_CACHE_KEY)
    if (!raw) return null
    const c = JSON.parse(raw)
    if (Date.now() - c.ts > CAL_CACHE_TTL) return null
    return c.data
  } catch { return null }
}

function guardarCache(data) {
  try { localStorage.setItem(CAL_CACHE_KEY, JSON.stringify({ ts: Date.now(), data })) }
  catch {}
}

async function fetchConTimeout(url, ms) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try { return await fetch(url, { signal: ctrl.signal, cache: "no-store" }) }
  finally { clearTimeout(t) }
}

async function fetchEventos() {
  // 1) Caché
  const cache = cargarCache()
  if (cache) return cache

  // 2) Intentar iCal vía proxies CORS
  const proxies = [
    { url: (u) => `https://cors.sh/${u}`,                          nombre: "cors.sh" },
    { url: (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`, nombre: "allorigins" },
  ]

  for (const p of proxies) {
    try {
      const r = await fetchConTimeout(p.url(CAL_ICAL_URL), 15000)
      if (!r.ok) continue
      const txt = await r.text()
      const evs = normalizarEventos(parsearICal(txt))
      if (evs.length > 0) {
        guardarCache(evs)
        return evs
      }
    } catch (e) {
      console.warn(`[cal] ${p.nombre}:`, e.message || e)
    }
  }

  // 3) Fallback: JSON local
  try {
    const r = await fetchConTimeout(CAL_LOCAL_JSON, 5000)
    if (r.ok) {
      const data = await r.json()
      guardarCache(data)
      return data
    }
  } catch {}

  return []
}

// ---- Helpers de fecha ----
function ymd(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function mismoDia(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function eventosDelDia(fecha) {
  const ymdStr = ymd(fecha)
  return eventosGlobal.filter((e) => e.date === ymdStr)
}

function eventosDelMes(year, month) {
  return eventosGlobal.filter((e) => {
    const [y, m] = e.date.split("-").map(Number)
    return y === year && (m - 1) === month
  })
}

// ---- Render ----
function renderHeader() {
  const mes = mesActual.getMonth() + 1
  const año = mesActual.getFullYear()
  return `
    <div class="cal-header">
      <div class="cal-header-left">
        <h2 class="cal-title">${NOMBRES_MES[mes]} ${año}</h2>
        <button class="cal-nav-btn" id="calPrevMes" aria-label="Mes anterior">‹</button>
        <button class="cal-nav-btn" id="calNextMes" aria-label="Mes siguiente">›</button>
        <button class="cal-today-btn" id="calTodayBtn">Hoy</button>
      </div>
      <div class="cal-view-tabs">
        <button class="cal-view-tab ${vistaActual === "mes" ? "active" : ""}" data-view="mes">Mes</button>
        <button class="cal-view-tab ${vistaActual === "agenda" ? "active" : ""}" data-view="agenda">Agenda</button>
      </div>
    </div>
  `
}

function renderSidebar() {
  const año = mesActual.getFullYear()
  const mes = mesActual.getMonth()

  // Mini calendario del mes anterior
  const miniHtml = renderMiniCalendario(año, mes)
  const miniSig = renderMiniCalendario(mes === 11 ? año + 1 : año, (mes + 1) % 12)

  return `
    <aside class="cal-sidebar">
      <div class="cal-mini">
        <div class="cal-mini-header">
          <span>${NOMBRES_MES[mes + 1]} ${año}</span>
        </div>
        ${miniHtml}
      </div>
      <div class="cal-mini" style="margin-top:0.75rem;">
        <div class="cal-mini-header">
          <span>${NOMBRES_MES[(((mes + 1) % 12) + 1)]} ${mes === 11 ? año + 1 : año}</span>
        </div>
        ${miniSig}
      </div>

      <div class="cal-cats">
        <h4>Categorías</h4>
        ${CATEGORIAS.map((c) => `
          <div class="cal-cat">
            <span class="cal-cat-dot" style="background:${c.color}"></span>
            <span>${c.nombre}</span>
          </div>
        `).join("")}
      </div>
    </aside>
  `
}

function renderMiniCalendario(year, month) {
  const primerDia = new Date(year, month, 1)
  const ultimoDia = new Date(year, month + 1, 0)
  const offset = primerDia.getDay()  // Dom=0
  const diasEnMes = ultimoDia.getDate()
  const totalCeldas = Math.ceil((offset + diasEnMes) / 7) * 7

  let html = '<div class="cal-mini-grid">'
  NOMBRES_DOW.forEach((d) => {
    html += `<div class="cal-mini-dow">${d}</div>`
  })

  const hoy = new Date()
  for (let i = 0; i < totalCeldas; i++) {
    const diaNum = i - offset + 1
    if (diaNum < 1 || diaNum > diasEnMes) {
      html += `<div class="cal-mini-day out">${diaNum < 1 ? (new Date(year, month, diaNum).getDate()) : (diaNum - diasEnMes)}</div>`
    } else {
      const fecha = new Date(year, month, diaNum)
      const ymdStr = ymd(fecha)
      const tiene = eventosGlobal.some((e) => e.date === ymdStr)
      const esHoy = mismoDia(fecha, hoy)
      const cls = `cal-mini-day${esHoy ? " today" : ""}${tiene ? " has-event" : ""}`
      html += `<div class="${cls}" data-fecha="${ymdStr}" data-mes="${month}" data-año="${year}">${diaNum}</div>`
    }
  }
  html += '</div>'
  return html
}

function renderVistaMes() {
  const año = mesActual.getFullYear();
  const mes = mesActual.getMonth();
  
  // 1. Obtener el primer día del mes
  const primerDia = new Date(año, mes, 1);
  
  // 2. CORRECCIÓN: Ajustar offset para que la semana empiece en LUNES
  // Si .getDay() da 0 (Domingo), lo transformamos en 6. Si da 1 (Lunes), queda en 0.
  let offset = primerDia.getDay() - 1;
  if (offset < 0) offset = 6; 

  const diasEnMes = new Date(año, mes + 1, 0).getDate();
  
  // 3. CORRECCIÓN: Calcular correctamente el total de celdas necesarias (múltiplo de 7)
  const totalCeldas = Math.ceil((offset + diasEnMes) / 7) * 7;

  const eventosPorDia = new Map();
  eventosDelMes(año, mes).forEach((e) => {
    if (!eventosPorDia.has(e.date)) eventosPorDia.set(e.date, []);
    eventosPorDia.get(e.date).push(e);
  });

  const hoy = new Date();

  let html = '<div class="cal-month-grid">';
  
  // Cabecera: Lunes a Domingo
  NOMBRES_DOW_FULL.slice(1).concat(["Domingo"]).forEach((d) => {
    html += `<div class="cal-dow">${d}</div>`;
  });

  // 4. Ciclo único para renderizar todas las celdas de la cuadrícula
  for (let i = 0; i < totalCeldas; i++) {
    const diaNum = i - offset + 1;
    
    if (diaNum < 1 || diaNum > diasEnMes) {
      // Días de los meses adyacentes (anterior o posterior)
      let otroDia, otroMes, otroAño;
      if (diaNum < 1) {
        const u = new Date(año, mes, 0);
        otroDia = u.getDate() + diaNum;
        otroMes = mes === 0 ? 11 : mes - 1;
        otroAño = mes === 0 ? año - 1 : año;
      } else {
        otroDia = diaNum - diasEnMes;
        otroMes = mes === 11 ? 0 : mes + 1;
        otroAño = mes === 11 ? año + 1 : año;
      }
      
      const fecha = new Date(otroAño, otroMes, otroDia);
      const ymdStr = ymd(fecha);
      const evts = eventosGlobal.filter((e) => e.date === ymdStr);
      
      html += `<div class="cal-day out" data-fecha="${ymdStr}">`;
      html += `<div class="cal-day-num">${otroDia}</div>`;
      if (evts.length) {
        html += `<div class="cal-events">`;
        evts.slice(0, 2).forEach((e) => {
          html += `<div class="cal-event cat-${e.category}" data-titulo="${escapeHtml(e.title)}">${escapeHtml(e.title)}</div>`;
        });
        if (evts.length > 2) html += `<div class="cal-event more">+${evts.length - 2} más</div>`;
        html += `</div>`;
      }
      html += `</div>`;
      
    } else {
      // Días pertenecientes al mes en curso
      const fecha = new Date(año, mes, diaNum);
      const ymdStr = ymd(fecha);
      const evts = eventosPorDia.get(ymdStr) || [];
      const esHoy = mismoDia(fecha, hoy);
      const esPasado = ymdStr < ymd(hoy);
      
      html += `<div class="cal-day${esHoy ? " today" : ""}${esPasado ? " past" : ""}" data-fecha="${ymdStr}">`;
      html += `<div class="cal-day-num">${diaNum}</div>`;
      if (evts.length) {
        html += `<div class="cal-events">`;
        evts.slice(0, 3).forEach((e) => {
          html += `<div class="cal-event cat-${e.category}" data-titulo="${escapeHtml(e.title)}">${escapeHtml(e.title)}</div>`;
        });
        if (evts.length > 3) html += `<div class="cal-event more">+${evts.length - 3} más</div>`;
        html += `</div>`;
      }
      html += `</div>`;
    }
  }
  
  html += '</div>';
  return html;
}

function renderVistaAgenda() {
  const hoy = new Date()
  const hoyStr = ymd(hoy)
  const eventos = eventosGlobal.filter((e) => e.date >= hoyStr).slice(0, 50)

  if (eventos.length === 0) {
    return '<div class="cal-loading">No hay eventos próximos.</div>'
  }

  const porDia = new Map()
  eventos.forEach((e) => {
    if (!porDia.has(e.date)) porDia.set(e.date, [])
    porDia.get(e.date).push(e)
  })

  let html = '<div class="cal-agenda">'
  Array.from(porDia.entries()).forEach(([fecha, evts]) => {
    const [y, m, d] = fecha.split("-").map(Number)
    const dateObj = new Date(y, m - 1, d)
    const dow = NOMBRES_DOW_FULL[dateObj.getDay()]
    const esHoy = mismoDia(dateObj, hoy)
    html += `
      <div class="cal-agenda-day">
        <div class="cal-agenda-day-header">
          <span class="cal-agenda-day-num ${esHoy ? "today" : ""}">${d}</span>
          <span class="cal-agenda-day-name">${dow}${esHoy ? " · Hoy" : ""}</span>
          <span class="cal-agenda-day-year">${NOMBRES_MES[m]} ${y}</span>
        </div>
    `
    evts.forEach((e) => {
      const catInfo = CATEGORIAS.find((c) => c.key === e.category) || { color: "var(--cat-default)" }
      html += `
        <div class="cal-agenda-item" data-fecha="${fecha}" data-titulo="${escapeHtml(e.title)}">
          <div class="cal-agenda-dot" style="background:${catInfo.color}"></div>
          <div class="cal-agenda-content">
            <div class="cal-agenda-title">${escapeHtml(e.title)}</div>
            ${e.time ? `<div class="cal-agenda-meta">${e.time} hrs</div>` : `<div class="cal-agenda-meta">Todo el día</div>`}
          </div>
        </div>
      `
    })
    html += `</div>`
  })
  html += '</div>'
  return html
}

function escapeHtml(s) {
  const d = document.createElement("div")
  d.textContent = s ?? ""
  return d.innerHTML.replace(/"/g, "&quot;")
}

// ---- Render principal ----
function renderTodo() {
  const app = document.getElementById("calApp")
  if (!app) return
  app.innerHTML = `
    ${renderSidebar()}
    <div class="cal-main">
      ${renderHeader()}
      ${vistaActual === "mes" ? renderVistaMes() : renderVistaAgenda()}
    </div>
  `
  wireUp()
}

// ---- Modal de evento ----
function abrirModal(evento) {
  const catInfo = CATEGORIAS.find((c) => c.key === evento.category) || { label: evento.category.toUpperCase() }
  const fechaObj = new Date(evento.date + "T00:00:00")
  const fechaStr = `${fechaObj.getDate()} de ${NOMBRES_MES[fechaObj.getMonth() + 1]} de ${fechaObj.getFullYear()}`

  const modal = document.createElement("div")
  modal.className = "cal-modal-bg active"
  modal.innerHTML = `
    <div class="cal-modal" onclick="event.stopPropagation()">
      <button class="cal-modal-close" id="calModalClose">×</button>
      <span class="cal-modal-cat" style="background:${catInfo.color}">${catInfo.label}</span>
      <h2>${escapeHtml(evento.title)}</h2>
      <div class="cal-modal-date">${fechaStr}${evento.time ? " · " + evento.time + " hrs" : " · Todo el día"}</div>
      ${evento.description ? `<p>${escapeHtml(evento.description)}</p>` : ""}
    </div>
  `
  document.body.appendChild(modal)
  document.body.style.overflow = "hidden"

  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal()
  })
  modal.querySelector("#calModalClose").addEventListener("click", cerrarModal)
}

function cerrarModal() {
  document.querySelectorAll(".cal-modal-bg").forEach((m) => m.remove())
  document.body.style.overflow = ""
}

// ---- Wire up eventos ----
function wireUp() {
  document.getElementById("calPrevMes")?.addEventListener("click", () => {
    mesActual = new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1)
    renderTodo()
  })
  document.getElementById("calNextMes")?.addEventListener("click", () => {
    mesActual = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1)
    renderTodo()
  })
  document.getElementById("calTodayBtn")?.addEventListener("click", () => {
    mesActual = new Date()
    renderTodo()
  })

  document.querySelectorAll(".cal-view-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      vistaActual = btn.dataset.view
      renderTodo()
    })
  })

  // Click en día (vista mes) → abrir modal del primer evento o del día
  document.querySelectorAll(".cal-day").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (e.target.classList.contains("cal-event")) {
        const ev = eventosGlobal.find((x) => x.title === e.target.dataset.titulo && x.date === el.dataset.fecha)
        if (ev) abrirModal(ev)
      } else {
        const evts = eventosGlobal.filter((x) => x.date === el.dataset.fecha)
        if (evts.length > 0) abrirModal(evts[0])
        else {
          // ir al día en agenda? por ahora solo abrimos modal genérico
          console.log("Sin eventos en", el.dataset.fecha)
        }
      }
    })
  })

  // Click en evento (agenda)
  document.querySelectorAll(".cal-agenda-item").forEach((el) => {
    el.addEventListener("click", () => {
      const ev = eventosGlobal.find((x) => x.title === el.dataset.titulo && x.date === el.dataset.fecha)
      if (ev) abrirModal(ev)
    })
  })

  // Click en mini-calendario
  document.querySelectorAll(".cal-mini-day:not(.out)").forEach((el) => {
    el.addEventListener("click", () => {
      const fecha = el.dataset.fecha
      if (fecha) {
        const [y, m, d] = fecha.split("-").map(Number)
        mesActual = new Date(y, m - 1, d)
        vistaActual = "mes"
        renderTodo()
      }
    })
  })
}

// ---- Init ----
async function initCalendario() {
  const app = document.getElementById("calApp")
  if (!app) return
  app.innerHTML = `<div class="cal-loading"><div class="spinner"></div><div>Cargando calendario…</div></div>`

  eventosGlobal = await fetchEventos()
  renderTodo()
}

document.addEventListener("DOMContentLoaded", initCalendario)

// Teclado: ← →
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return
  if (e.key === "ArrowLeft") {
    mesActual = new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1)
    renderTodo()
  } else if (e.key === "ArrowRight") {
    mesActual = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1)
    renderTodo()
  }
})