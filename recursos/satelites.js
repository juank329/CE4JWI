/* ============================================================
 * CE4JWI - Seguimiento de satélites de radioaficionado
 * ============================================================
 * - TLEs desde Celestrak (se actualizan varias veces al día)
 * - Cálculo de pasos con satellite.js
 * - El usuario escribe su grid locator (se guarda en localStorage)
 * - Mapa Leaflet con órbita y posición en vivo
 * ============================================================ */

const SATELITES = [
  /* --- FM (repetidora FM accesible con portátil) --- */
  { nombre: "ISS (Estación Espacial)", norad: 25544, modo: "FM", subida: "144.490", bajada: "145.800", tone: "sin tono" },
  { nombre: "SO-50 (SaudiSat-1C)", norad: 27607, modo: "FM", subida: "145.850", bajada: "436.795", tone: "67.0 Hz" },
  { nombre: "AO-91 (RadFxSat)", norad: 43017, modo: "FM", subida: "435.250", bajada: "145.960", tone: "67.0 Hz" },
  { nombre: "PO-101 (Diwata-2)", norad: 43678, modo: "FM", subida: "437.500", bajada: "145.900", tone: "141.3 Hz" },
  { nombre: "AO-27 (Eyesat-A)", norad: 22825, modo: "FM", subida: "145.850", bajada: "436.795", tone: "67.0 Hz" },
  { nombre: "AO-85 (Fox-1A)", norad: 40967, modo: "FM", subida: "435.180", bajada: "145.980", tone: "67.0 Hz" },
  { nombre: "AO-95 (Fox-1Cliff)", norad: 43770, modo: "FM", subida: "435.250", bajada: "145.880", tone: "67.0 Hz" },
  { nombre: "JO-97 (JY1Sat)", norad: 43803, modo: "FM", subida: "145.940", bajada: "145.860", tone: "67.0 Hz" },
  /* --- Lineales (SSB/CW con transpondedor) --- */
  { nombre: "AO-7 (AMSAT-OSCAR 7)", norad: 7530, modo: "Lineal", subida: "432.125-432.175", bajada: "145.975-145.925", tone: "—" },
  { nombre: "FO-29 (Fuji-OSCAR 29)", norad: 24278, modo: "Lineal", subida: "145.900-146.000", bajada: "435.800-435.900", tone: "—" },
  { nombre: "AO-73 (FUNcube-1)", norad: 39444, modo: "Lineal", subida: "435.130-435.150", bajada: "145.950-145.970", tone: "—" },
  { nombre: "RS-44 (Radio-2017)", norad: 44909, modo: "Lineal", subida: "435.605-435.705", bajada: "145.930-145.830", tone: "—" },
  { nombre: "XW-3 (CAS-9)", norad: 50466, modo: "Lineal", subida: "145.855-145.885", bajada: "435.165-435.195", tone: "—" },
  { nombre: "AO-10 (Phase 3B)", norad: 14129, modo: "Lineal", subida: "435.030-435.180", bajada: "145.975-145.825", tone: "—" },
  { nombre: "RS-15 (Radio Sputnik)", norad: 23439, modo: "Lineal", subida: "145.857-145.897", bajada: "29.357-29.397", tone: "—" }
]

const TLE_API = "https://tle.ivanstanojevic.me/api/tle"
const STORAGE_KEY = "ce4jwi_sat_grid"

const zonaHoraria = (() => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return tz || "America/Santiago"
  } catch (e) {
    return "America/Santiago"
  }
})()

let satrecs = new Map()
let observer = null
let observadorStr = ""

function setEstado(txt, tipo) {
  const el = document.getElementById("satEstado")
  if (!el) return
  el.textContent = txt
  el.className = "sat-estado " + (tipo || "")
}

/* ---------- Grid locator -> lat/lon ---------- */

function gridToLatLon(grid) {
  const g = String(grid || "").replace(/\s+/g, "").toUpperCase()
  if (!/^[A-R]{2}\d{2}([A-X]{2})?(\d{2})?$/.test(g)) return null
  const lon = -180 + (g.charCodeAt(0) - 65) * 20 + (g.charCodeAt(2) - 48) * 2 +
    (g.length >= 5 ? (g.charCodeAt(4) - 65) * (5 / 60) + (5 / 120) : 1)
  const lat = -90 + (g.charCodeAt(1) - 65) * 10 + (g.charCodeAt(3) - 48) +
    (g.length >= 5 ? (g.charCodeAt(5) - 65) * (2.5 / 60) + (2.5 / 120) : 0.5)
  return { lat, lon }
}

function mostrarUbicacion(grid) {
  const el = document.getElementById("satUbicacion")
  const p = gridToLatLon(grid)
  if (p) {
    observadorStr = `${p.lat.toFixed(3)}°, ${p.lon.toFixed(3)}°`
    el.textContent = `Calculando pasos para el grid ${grid.toUpperCase()} (${observadorStr})`
  } else {
    observadorStr = ""
    el.textContent = ""
  }
}

/* ---------- Carga de TLEs ---------- */

async function cargarTLEs() {
  setEstado("Obteniendo datos orbitales actualizados…", "cargando")
  const pendientes = SATELITES.filter((s) => !satrecs.has(s.norad))
  if (pendientes.length === 0) {
    setEstado(`Datos orbitales listos: ${satrecs.size} satélites.`, "ok")
    return
  }
  let encontrados = 0
  let errores = 0
  await Promise.all(
    pendientes.map(async (sat) => {
      try {
        const resp = await fetch(`${TLE_API}/${sat.norad}`, { cache: "no-store" })
        if (!resp.ok) throw new Error("HTTP " + resp.status)
        const datos = await resp.json()
        const l1 = String(datos.line1 || "").trim()
        const l2 = String(datos.line2 || "").trim()
        if (!/^1\s\d{5}/.test(l1) || !/^2\s\d{5}/.test(l2)) throw new Error("TLE inválido")
        satrecs.set(sat.norad, satellite.twoline2satrec(l1, l2))
        encontrados++
      } catch (e) {
        console.error("[satelites] TLE " + sat.norad + ":", e.message || e)
        errores++
      }
    })
  )

  if (satrecs.size > 0) {
    setEstado(
      `Datos orbitales actualizados: ${satrecs.size} satélites listos.` + (errores > 0 ? ` (${errores} sin datos)` : ""),
      "ok"
    )
  } else {
    setEstado("No se pudieron obtener los datos orbitales. Revisa tu conexión e inténtalo de nuevo.", "error")
  }
}

/* ---------- Cálculo de pasos ---------- */

function crearObservador(lat, lon) {
  return {
    lat: (lat * Math.PI) / 180,
    lon: (lon * Math.PI) / 180,
    height: 50
  }
}

function elevacionEn(satrec, fecha, obs) {
  const pv = satellite.propagate(satrec, fecha)
  if (!pv.position) return null
  const gst = satellite.gstime(fecha)
  const look = satellite.eciToLookAngles(obs, pv.position, gst)
  return { elev: (look.elevation * 180) / Math.PI, azimut: (look.azimuth * 180) / Math.PI }
}

function calcularPasos(satrec, obs, horas = 24) {
  const ahora = new Date()
  const fin = new Date(ahora.getTime() + horas * 3600 * 1000)
  const pasos = []
  let t = new Date(ahora)
  const paso = 10 * 1000
  let enPaso = false
  let inicio = null
  let maxEl = -90
  let maxT = null
  let maxAz = 0

  const evalPunto = (fecha) => {
    const r = elevacionEn(satrec, fecha, obs)
    if (r === null) return
    const arriba = r.elev > 0
    if (arriba) {
      if (!enPaso) { enPaso = true; inicio = new Date(fecha); maxEl = -90 }
      if (r.elev > maxEl) { maxEl = r.elev; maxT = new Date(fecha); maxAz = r.azimut }
    } else if (enPaso) {
      pasos.push({ inicio, maxT, finPaso: new Date(fecha), maxElev: maxEl, maxAzimut: maxAz })
      enPaso = false
    }
  }

  while (t < fin) {
    evalPunto(t)
    t = new Date(t.getTime() + paso)
  }
  if (enPaso) pasos.push({ inicio, maxT, finPaso: new Date(fin), maxElev: maxEl, maxAzimut: maxAz })

  return pasos.filter((p) => p.maxElev >= 10)
}

/* ---------- Formato ---------- */

function fmtHoraLocal(fecha) {
  return fecha.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", timeZone: zonaHoraria })
}

function fmtFechaLocal(fecha) {
  return fecha.toLocaleDateString("es-CL", { weekday: "short", day: "2-digit", month: "short", timeZone: zonaHoraria })
}

function fmtDuracion(inicio, fin) {
  const min = Math.round((fin - inicio) / 60000)
  if (min < 1) return "<1 min"
  return min + " min"
}

function dirCardinal(az) {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"]
  return dirs[Math.round(az / 22.5) % 16]
}

function diffMin(ahora, fecha) {
  return Math.round((fecha - ahora) / 60000)
}

/* ---------- Render ---------- */

function renderSatelites(ahora) {
  const cont = document.getElementById("satLista")
  const ahoraBox = document.getElementById("satAhora")
  if (!cont) return

  if (satrecs.size === 0 || !observer) {
    cont.innerHTML = `<p class="sat-sin-pasadas">Escribe tu grid locator y presiona "Calcular pasos" para ver los próximos pases.</p>`
    ahoraBox.style.display = "none"
    return
  }

  const pasosTotales = []
  let html = ""

  SATELITES.forEach((sat) => {
    const satrec = satrecs.get(sat.norad)
    if (!satrec) return
    const pasos = calcularPasos(satrec, observer).slice(0, 4)
    pasosTotales.push(...pasos.map((p) => Object.assign({ sat }, p)))

    html += `<div class="sat-sat">
      <h3>${sat.nombre}</h3>
      <span class="sat-modo">${sat.modo}</span>
      <div class="sat-freq">Subida ${sat.subida} MHz · Bajada ${sat.bajada} MHz · Tono ${sat.tone}</div>`

    if (pasos.length === 0) {
      html += `<div class="sat-sin-pasadas">Sin pasos útiles (≥10°) en las próximas 24 h.</div>`
    } else {
      pasos.forEach((p) => {
        html += `<div class="sat-pasada">
          <span class="fecha">${fmtFechaLocal(p.inicio)}</span>
          <span class="hora">${fmtHoraLocal(p.inicio)}</span>
          <span class="elev">${p.maxElev.toFixed(0)}°</span>
          <span class="detalle">Máx a las ${fmtHoraLocal(p.maxT)} · ${dirCardinal(p.maxAzimut)} · ${fmtDuracion(p.inicio, p.finPaso)}</span>
        </div>`
      })
    }
    html += `</div>`
  })

  cont.innerHTML = html

  const ahoraLista = pasosTotales
    .filter((p) => p.inicio <= ahora && p.finPaso >= ahora)
    .sort((a, b) => b.maxElev - a.maxElev)

  if (ahoraLista.length > 0) {
    const a = ahoraLista[0]
    ahoraBox.style.display = "block"
    ahoraBox.innerHTML = `<div class="titulo">● EN EL AIRE AHORA MISMO</div>
      <p><b>${a.sat.nombre}</b> pasando en este momento (elevación actual hacia máx. ${a.maxElev.toFixed(0)}°). Escucha en ${a.sat.bajada} MHz. Termina aprox. ${fmtHoraLocal(a.finPaso)}.</p>`
  } else {
    const proximo = pasosTotales
      .filter((p) => p.inicio > ahora)
      .sort((a, b) => a.inicio - b.inicio)[0]
    if (proximo) {
      const en = diffMin(ahora, proximo.inicio)
      ahoraBox.style.display = "block"
      ahoraBox.innerHTML = `<div class="titulo">PRÓXIMO PASO</div>
        <p><b>${proximo.sat.nombre}</b> en ${fmtHoraLocal(proximo.inicio)} (${fmtFechaLocal(proximo.inicio)}) · en ~${en} min · elevación máxima ${proximo.maxElev.toFixed(0)}° en ${fmtHoraLocal(proximo.maxT)}.</p>`
    } else {
      ahoraBox.style.display = "none"
    }
  }
}

function actualizar() {
  const grid = (document.getElementById("satGrid").value || "").trim()
  const p = gridToLatLon(grid)
  const cont = document.getElementById("satLista")

  if (typeof satellite === "undefined" || typeof L === "undefined") {
    setEstado("No se pudo cargar la librería de cálculo (satellite.js/Leaflet). Revisa tu conexión o el bloqueador de scripts.", "error")
    cont.innerHTML = `<p class="sat-sin-pasadas">Sin datos de cálculo disponibles.</p>`
    document.getElementById("satAhora").style.display = "none"
    return
  }

  if (!p) {
    cont.innerHTML = `<p class="sat-sin-pasadas">El grid "${grid}" no parece válido. Ejemplo: FF44dl, FF46, FG33.</p>`
    document.getElementById("satAhora").style.display = "none"
    return
  }

  observer = crearObservador(p.lat, p.lon)
  mostrarUbicacion(grid)
  try { localStorage.setItem(STORAGE_KEY, grid) } catch (e) { /* ignorar */ }

  iniciarMapa(p.lat, p.lon)

  if (satrecs.size === 0) {
    setEstado("Aún cargando los datos orbitales… se actualizará solo al terminar.", "cargando")
    cont.innerHTML = `<p class="sat-sin-pasadas">Esperando datos orbitales de Celestrak…</p>`
    document.getElementById("satAhora").style.display = "none"
    return
  }

  renderSatelites(new Date())
  if (satActualMapa) actualizarMapa()
}

/* ---------- Mapa Leaflet (órbita en tiempo real) ---------- */

let mapa = null
let capaOrbita = null
let marcadorSatelite = null
let polilineaOrbita = null
let marcadorQTH = null
let satActualMapa = null
let satMapaIniciado = false
let vistaAcercada = false
let polilineaRecorrido = null
let capaTodos = null
const marcadoresTodos = new Map()
const polilineasTodos = new Map()
let circuloCobertura = null
const circulosCobertura = new Map()
let seguimientoMovilIniciado = false

function esMovil() {
  return window.innerWidth <= 768 || ("ontouchstart" in window && window.innerWidth <= 1024)
}

function eciAGeo(satrec, fecha) {
  const pv = satellite.propagate(satrec, fecha)
  if (!pv.position) return null
  const gst = satellite.gstime(fecha)
  const geo = satellite.eciToGeodetic(pv.position, gst)
  return {
    lat: (geo.latitude * 180) / Math.PI,
    lon: (geo.longitude * 180) / Math.PI,
    alt: geo.height || 0
  }
}

function distanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const r = Math.PI / 180
  const dLat = (lat2 - lat1) * r
  const dLon = (lon2 - lon1) * r
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function radioCoberturaKm(altKm) {
  if (altKm <= 0) return 0
  const R = 6371
  const angulo = Math.acos(R / (R + altKm))
  return R * angulo
}

function actualizarCirculoCobertura(satrec, sat, color, lat, lon, key) {
  if (!mapa || !observer) return
  const pos = eciAGeo(satrec, new Date())
  if (!pos) return
  const radio = radioCoberturaKm(pos.alt)
  if (radio <= 0) return
  const obsLat = (observer.lat * 180) / Math.PI
  const obsLon = (observer.lon * 180) / Math.PI
  const dist = distanciaKm(obsLat, obsLon, pos.lat, pos.lon)

  let circ = key === "individual" ? circuloCobertura : circulosCobertura.get(key)
  const dentro = dist <= radio * 1.05

  if (dentro) {
    if (!circ) {
      circ = L.circle([pos.lat, pos.lon], {
        radius: radio * 1000,
        color: color,
        weight: 1.5,
        dashArray: "6 4",
        fillColor: color,
        fillOpacity: 0.08,
        interactive: false
      }).addTo(mapa)
      if (key === "individual") circuloCobertura = circ
      else circulosCobertura.set(key, circ)
    } else {
      circ.setLatLng([pos.lat, pos.lon])
      circ.setRadius(radio * 1000)
    }
  } else if (circ) {
    mapa.removeLayer(circ)
    if (key === "individual") circuloCobertura = null
    else circulosCobertura.delete(key)
  }
}

function rumboEntre(lat1, lon1, lat2, lon2) {
  const r = Math.PI / 180
  const f1 = lat1 * r
  const f2 = lat2 * r
  const dL = (lon2 - lon1) * r
  const y = Math.sin(dL) * Math.cos(f2)
  const x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dL)
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
}

function rotarIconoSatelite(marker, rumbo) {
  const el = marker.getElement()
  if (!el) return
  const icono = el.querySelector(".sat-icono svg")
  if (icono) icono.style.transform = `rotate(${rumbo}deg)`
}

function crearIconoSatelite() {
  const svg = `<svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" style="transform:rotate(0deg);">
    <g>
      <rect x="1" y="18" width="14" height="8" rx="1" fill="#002b7a" stroke="#fff" stroke-width="1"/>
      <rect x="29" y="18" width="14" height="8" rx="1" fill="#002b7a" stroke="#fff" stroke-width="1"/>
      <rect x="15" y="12" width="14" height="20" rx="2.5" fill="#0039a6" stroke="#fff" stroke-width="1.2"/>
      <line x1="22" y1="12" x2="22" y2="5" stroke="#fff" stroke-width="1.4"/>
      <circle cx="22" cy="4" r="1.8" fill="#d52b1e" stroke="#fff" stroke-width="0.8"/>
      <rect x="18" y="15" width="8" height="4" rx="1" fill="#7fb3d8"/>
    </g>
  </svg>`
  return L.divIcon({
    className: "sat-marker",
    html: `<div class="sat-icono">${svg}</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  })
}

function crearIconoMini(sat, color) {
  const svg = `<svg width="30" height="30" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" style="transform:rotate(0deg);">
    <g>
      <rect x="1" y="18" width="14" height="8" rx="1" fill="${color}" stroke="#fff" stroke-width="1"/>
      <rect x="29" y="18" width="14" height="8" rx="1" fill="${color}" stroke="#fff" stroke-width="1"/>
      <rect x="15" y="12" width="14" height="20" rx="2.5" fill="${color}" stroke="#fff" stroke-width="1.2"/>
      <line x1="22" y1="12" x2="22" y2="5" stroke="#fff" stroke-width="1.4"/>
      <circle cx="22" cy="4" r="1.8" fill="#e74c3c" stroke="#fff" stroke-width="0.8"/>
      <rect x="18" y="15" width="8" height="4" rx="1" fill="#d6e6f2"/>
    </g>
  </svg>`
  return L.divIcon({
    className: "sat-marker",
    html: `<div class="sat-icono">${svg}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  })
}

function crearIconoQTH() {
  return L.divIcon({
    className: "sat-marker-qth",
    html: '<div style="background:#c0392b;border:2px solid #fff;border-radius:50%;width:12px;height:12px;box-shadow:0 0 0 4px rgba(192,57,43,.3);"></div>',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  })
}

function iniciarMapa(lat, lon) {
  if (typeof L === "undefined") {
    const info = document.getElementById("satInfoOrbita")
    if (info) info.innerHTML = `<p class="sat-sin-pasadas">No se pudo cargar el mapa (Leaflet).</p>`
    return
  }
  if (!satMapaIniciado) {
    const cont = document.getElementById("satLeaflet")
    if (!cont) return
    mapa = L.map("satLeaflet", { zoomControl: true, attributionControl: true })
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapa)
    marcadorSatelite = L.marker([0, 0], { icon: crearIconoSatelite() }).addTo(mapa)
    marcadorSatelite.bindTooltip("", { permanent: true, direction: "top", offset: [0, -22], className: "sat-tooltip" })
    marcadorSatelite.bindPopup("", { className: "sat-popup", closeButton: false, autoPan: false })
    marcadorSatelite.on("mouseover", (e) => e.target.openPopup())
    marcadorSatelite.on("mouseout", (e) => e.target.closePopup())
    polilineaOrbita = L.polyline([], { color: "#1a4d8f", weight: 2, opacity: 0.7 }).addTo(mapa)
    polilineaRecorrido = L.polyline([], { color: "#e67e22", weight: 3, opacity: 0.95 }).addTo(mapa)
    capaOrbita = L.layerGroup([marcadorSatelite, polilineaOrbita, polilineaRecorrido]).addTo(mapa)
    satMapaIniciado = true
    mapa.attributionControl.setPrefix("")
  }
  if (!marcadorQTH) {
    marcadorQTH = L.marker([lat, lon], { icon: crearIconoQTH() }).addTo(mapa)
    const gridTxt = (document.getElementById("satGrid").value || "FF44dl").trim().toUpperCase()
    marcadorQTH.bindTooltip(`Tu QTH (${gridTxt})`, { permanent: true, direction: "top" })
  } else {
    marcadorQTH.setLatLng([lat, lon])
  }
  mapa.setView([0, 0], 2)
  setTimeout(() => { if (mapa) mapa.invalidateSize() }, 300)
}

function poblarSelectorSatelites() {
  const sel = document.getElementById("satSelector")
  if (!sel) return
  sel.innerHTML = `
    <option value="">Selecciona un satélite…</option>
    <option value="all">Todos los satélites</option>`
  SATELITES.forEach((sat) => {
    const opt = document.createElement("option")
    opt.value = sat.norad
    opt.textContent = sat.nombre
    sel.appendChild(opt)
  })
  sel.addEventListener("change", () => {
    const v = sel.value
    if (v === "all") {
      satActualMapa = "all"
      vistaAcercada = false
      limpiarIndividual()
      actualizarMapaTodos()
    } else if (v === "") {
      satActualMapa = null
      vistaAcercada = false
      limpiarTodos()
      limpiarIndividual()
      const info = document.getElementById("satInfoOrbita")
      if (info) info.innerHTML = ""
    } else {
      satActualMapa = SATELITES.find((s) => s.norad === parseInt(v, 10)) || null
      vistaAcercada = false
      seguimientoMovilIniciado = false
      limpiarTodos()
      if (capaOrbita && !mapa.hasLayer(capaOrbita)) capaOrbita.addTo(mapa)
      actualizarMapa()
    }
  })
  if (esMovil()) {
    const primero = SATELITES[0]
    satActualMapa = primero
    sel.value = String(primero.norad)
  } else {
    satActualMapa = "all"
    sel.value = "all"
  }
}

const COLORES_SAT = ["#1a4d8f", "#c0392b", "#27ae60", "#8e44ad", "#d35400", "#16a085", "#2980b9", "#e67e22", "#7f8c8d", "#f39c12", "#8e44ad", "#c0392b", "#16a085", "#27ae60", "#2980b9"]

function limpiarTodos() {
  if (capaTodos) capaTodos.clearLayers()
  marcadoresTodos.clear()
  polilineasTodos.clear()
  for (const [, circ] of circulosCobertura) {
    if (mapa) mapa.removeLayer(circ)
  }
  circulosCobertura.clear()
}

function limpiarIndividual() {
  polilineaOrbita.setLatLngs([])
  if (polilineaRecorrido) polilineaRecorrido.setLatLngs([])
  if (marcadorSatelite) {
    marcadorSatelite.setLatLng([0, 0])
    if (marcadorSatelite.getTooltip()) marcadorSatelite.closeTooltip()
  }
  if (circuloCobertura) {
    if (mapa) mapa.removeLayer(circuloCobertura)
    circuloCobertura = null
  }
  if (capaOrbita) mapa.removeLayer(capaOrbita)
}

function actualizarMapaTodos() {
  if (!satMapaIniciado || !observer) return
  if (!capaTodos) {
    capaTodos = L.layerGroup().addTo(mapa)
  }
  const ahora = new Date()
  const info = document.getElementById("satInfoOrbita")
  let n = 0
  SATELITES.forEach((sat, i) => {
    const satrec = satrecs.get(sat.norad)
    if (!satrec) return
    const pos = eciAGeo(satrec, ahora)
    if (!pos) return
    n++

    let marcador = marcadoresTodos.get(sat.norad)
    if (!marcador) {
      marcador = L.marker([pos.lat, pos.lon], { icon: crearIconoMini(sat, COLORES_SAT[i % COLORES_SAT.length]) }).addTo(capaTodos)
      marcador.bindTooltip(sat.nombre, { direction: "top", className: "sat-tooltip" })
      marcador.bindPopup(`
        <div class="sat-popup">
          <b>${sat.nombre}</b><br>
          <div class="f"><span class="l">Modo</span><span>${sat.modo}</span></div>
          <div class="f"><span class="l">Subida</span><span>${sat.subida} MHz</span></div>
          <div class="f"><span class="l">Bajada</span><span>${sat.bajada} MHz</span></div>
          <div class="f"><span class="l">Tono</span><span>${sat.tone}</span></div>
        </div>`, { className: "sat-popup", closeButton: false, autoPan: false })
      marcador.on("mouseover", (e) => e.target.openPopup())
      marcador.on("mouseout", (e) => e.target.closePopup())
      marcadoresTodos.set(sat.norad, marcador)
    } else {
      marcador.setLatLng([pos.lat, pos.lon])
    }

    actualizarCirculoCobertura(satrec, sat, COLORES_SAT[i % COLORES_SAT.length], pos.lat, pos.lon, sat.norad)

    const posSig = eciAGeo(satrec, new Date(ahora.getTime() + 60000))
    const rumbo = posSig ? rumboEntre(pos.lat, pos.lon, posSig.lat, posSig.lon) : 0
    rotarIconoSatelite(marcador, rumbo)

    const puntos = []
    for (let m = -60; m <= 60; m += 3) {
      const p = eciAGeo(satrec, new Date(ahora.getTime() + m * 60000))
      if (p) puntos.push([p.lat, p.lon])
    }
    let linea = polilineasTodos.get(sat.norad)
    if (!linea) {
      linea = L.polyline(puntos, { color: COLORES_SAT[i % COLORES_SAT.length], weight: 1.6, opacity: 0.7 }).addTo(capaTodos)
      polilineasTodos.set(sat.norad, linea)
    } else {
      linea.setLatLngs(puntos)
    }
  })
  if (info) {
    info.innerHTML = n > 0
      ? `<div class="item"><span class="label">Satélites con datos</span><span class="valor">${n} de ${SATELITES.length}</span></div>
         <div class="item"><span class="label">Pasa el mouse</span><span class="valor">para ver frecuencias</span></div>`
      : `<div class="item"><span class="label">Estado</span><span class="valor">Esperando datos orbitales…</span></div>`
  }
}

function dibujarOrbita(satrec, obs) {
  const ahora = new Date()
  const puntosOrbita = []
  const puntosRecorrido = []
  for (let m = -90; m <= 90; m += 3) {
    const t = new Date(ahora.getTime() + m * 60000)
    const p = eciAGeo(satrec, t)
    if (!p) continue
    if (m <= 0) {
      puntosRecorrido.push([p.lat, p.lon])
    } else {
      puntosOrbita.push([p.lat, p.lon])
    }
  }
  polilineaOrbita.setLatLngs(puntosOrbita)
  polilineaRecorrido.setLatLngs(puntosRecorrido)

  const pos = eciAGeo(satrec, ahora)
  if (!pos) return

  marcadorSatelite.setLatLng([pos.lat, pos.lon])

  actualizarCirculoCobertura(satrec, satActualMapa, "#0039a6", pos.lat, pos.lon, "individual")

  const posSig = eciAGeo(satrec, new Date(ahora.getTime() + 60000))
  const rumbo = posSig ? rumboEntre(pos.lat, pos.lon, posSig.lat, posSig.lon) : 0
  rotarIconoSatelite(marcadorSatelite, rumbo)

  const nombre = satActualMapa ? satActualMapa.nombre : "Satélite"
  if (marcadorSatelite.getTooltip()) {
    marcadorSatelite.setTooltipContent(nombre)
    if (!marcadorSatelite.isTooltipOpen()) marcadorSatelite.openTooltip()
  }

  if (satActualMapa && marcadorSatelite.getPopup()) {
    marcadorSatelite.setPopupContent(`
      <div class="sat-popup">
        <b>${satActualMapa.nombre}</b><br>
        <div class="f"><span class="l">Modo</span><span>${satActualMapa.modo}</span></div>
        <div class="f"><span class="l">Subida</span><span>${satActualMapa.subida} MHz</span></div>
        <div class="f"><span class="l">Bajada</span><span>${satActualMapa.bajada} MHz</span></div>
        <div class="f"><span class="l">Tono</span><span>${satActualMapa.tone}</span></div>
        <div class="f"><span class="l">Dir.</span><span>${dirCardinal(rumbo)} (${rumbo.toFixed(0)}°)</span></div>
      </div>`)
  }

  if (esMovil()) {
    if (!seguimientoMovilIniciado) {
      mapa.setView([pos.lat, pos.lon], 5)
      seguimientoMovilIniciado = true
    } else {
      mapa.panTo([pos.lat, pos.lon], { animate: true, duration: 1.5 })
    }
    return
  }

  const pv = satellite.propagate(satrec, ahora)
  if (pv.position) {
    const gst = satellite.gstime(ahora)
    const look = satellite.eciToLookAngles(obs, pv.position, gst)
    const elev = (look.elevation * 180) / Math.PI

    if (elev >= 10) {
      if (!vistaAcercada) {
        const qth = L.latLng(obs.lat * 180 / Math.PI, obs.lon * 180 / Math.PI)
        const sat = L.latLng(pos.lat, pos.lon)
        mapa.fitBounds(L.latLngBounds(qth, sat), { padding: [50, 50], maxZoom: 6 })
        vistaAcercada = true
      }
    } else if (vistaAcercada) {
      mapa.setView([0, 0], 2)
      vistaAcercada = false
    }
  }
}

function mostrarInfoOrbita(satrec, obs) {
  const info = document.getElementById("satInfoOrbita")
  if (!info || !satActualMapa) return
  const ahora = new Date()
  const pv = satellite.propagate(satrec, ahora)
  if (!pv.position) return
  const gst = satellite.gstime(ahora)
  const look = satellite.eciToLookAngles(obs, pv.position, gst)
  const elev = (look.elevation * 180) / Math.PI
  const az = (look.azimuth * 180) / Math.PI
  const velocidad = Math.sqrt(pv.velocity.x ** 2 + pv.velocity.y ** 2 + pv.velocity.z ** 2) / 1000
  const direccion = dirCardinal(az)

  const pos = eciAGeo(satrec, ahora)
  const radio = pos ? radioCoberturaKm(pos.alt) : 0
  const obsLat = (obs.lat * 180) / Math.PI
  const obsLon = (obs.lon * 180) / Math.PI
  const dist = pos ? distanciaKm(obsLat, obsLon, pos.lat, pos.lon) : 0
  const alcanza = pos && dist <= radio * 1.05

  const coberturaItem = alcanza
    ? `<div class="item"><span class="label">Cobertura</span><span class="valor" style="color:#2e7d32;">Te llega (${radio.toFixed(0)} km)</span></div>`
    : `<div class="item"><span class="label">Cobertura</span><span class="valor">A ${dist.toFixed(0)} km (radio ${radio.toFixed(0)} km)</span></div>`

  info.innerHTML = `
    <div class="item"><span class="label">Modo</span><span class="valor">${satActualMapa.modo}</span></div>
    <div class="item"><span class="label">Subida</span><span class="valor">${satActualMapa.subida} MHz</span></div>
    <div class="item"><span class="label">Bajada</span><span class="valor">${satActualMapa.bajada} MHz</span></div>
    <div class="item"><span class="label">Elevación</span><span class="valor">${elev.toFixed(1)}°</span></div>
    <div class="item"><span class="label">Azimut</span><span class="valor">${direccion} (${az.toFixed(0)}°)</span></div>
    <div class="item"><span class="label">Velocidad</span><span class="valor">${velocidad.toFixed(1)} km/s</span></div>
    ${coberturaItem}
  `
}

function actualizarMapa() {
  if (!satMapaIniciado || !observer) return
  if (satActualMapa === "all") {
    actualizarMapaTodos()
    return
  }
  if (!satActualMapa) return
  let satrec = satrecs.get(satActualMapa.norad)
  if (!satrec) {
    const info = document.getElementById("satInfoOrbita")
    if (info) info.innerHTML = `<div class="item"><span class="label">Estado</span><span class="valor">Esperando datos orbitales…</span></div>`
    return
  }
  dibujarOrbita(satrec, observer)
  mostrarInfoOrbita(satrec, observer)
}

/* ---------- Init ---------- */

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("satGrid")
  let gridGuardado = ""
  try { gridGuardado = localStorage.getItem(STORAGE_KEY) || "" } catch (e) { /* ignorar */ }
  input.value = gridGuardado || "FF44dl"

  const pInicial = gridToLatLon(input.value)
  if (pInicial) {
    observer = crearObservador(pInicial.lat, pInicial.lon)
    iniciarMapa(pInicial.lat, pInicial.lon)
  }

  poblarSelectorSatelites()
  if (satActualMapa === "all") limpiarIndividual()

  document.getElementById("satForm").addEventListener("submit", (e) => {
    e.preventDefault()
    actualizar()
  })

  cargarTLEs().then(() => {
    if (satrecs.size > 0 && observer) {
      renderSatelites(new Date())
      actualizarMapa()
    } else {
      setEstado("No se obtuvieron datos orbitales. Reintentando en 20 segundos…", "cargando")
      setTimeout(() => cargarTLEs().then(() => {
        if (satrecs.size > 0 && observer) {
          renderSatelites(new Date())
          actualizarMapa()
        }
      }), 20000)
    }
  })

  actualizar()

  setInterval(() => {
    if (observer) renderSatelites(new Date())
  }, 30000)

  setInterval(() => {
    actualizarMapa()
  }, 2000)

  window.addEventListener("resize", () => {
    if (mapa) setTimeout(() => mapa.invalidateSize(), 200)
  })
})
