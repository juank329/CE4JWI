// Activity Data
// ---------------------------------------------------------------
// Catálogo de actividades de radio mostradas en la portada.
// Cada elemento representa una tarjeta con: id, título, imagen,
// estado (FINALIZADO / EN CURSO / PRÓXIMAMENTE), descripción,
// fecha legible y URL a la página de la efeméride.
// La fecha se guarda en formato "DD Mes YYYY" en español para
// poder ordenarla con la función parseSpanishDate() de abajo.
// ---------------------------------------------------------------
// El array compartido vive en recursos/actividades.js (usado también
// por la marquesina de "PRÓXIMAS ACTIVIDADES").
const activities = ACTIVIDADES

const MESES_ES = {
    Enero: 0,
    Febrero: 1,
    Marzo: 2,
    Abril: 3,
    Mayo: 4,
    Junio: 5,
    Julio: 6,
    Agosto: 7,
    Septiembre: 8,
    Octubre: 9,
    Noviembre: 10,
    Diciembre: 11,
  }

function parseSpanishDate(dateStr) {
  const parts = dateStr.split(" ")
  const day = Number.parseInt(parts[0])
  const month = MESES_ES[parts[1]]
  const year = Number.parseInt(parts[2])

  return new Date(year, month, day)
}

// Devuelve la fecha de fin de una actividad. Soporta rangos multivia
// como "29-31 Enero 2026" (usa el último día) y fechas de un solo día.
function fechaFinActividad(activity) {
  const parts = activity.date.split(" ")
  const dayStr = parts[0]
  const dayFin = dayStr.includes("-") ? Number.parseInt(dayStr.split("-")[1]) : Number.parseInt(dayStr)
  return new Date(Number.parseInt(parts[2]), MESES_ES[parts[1]], dayFin)
}

// Render Activity Cards con paginación (9 tarjetas por página)
const ACTIVITIES_PER_PAGE = 9
let currentPage = 1
let sortedActivitiesCache = []

function renderActivities() {
  const grid = document.getElementById("activityGrid")

  sortedActivitiesCache = [...activities].filter(a => {
    const hoy = new Date(); hoy.setHours(0,0,0,0)
    // Regla dinámica: ocultar las actividades FUTURAS hasta 1 semana (7 días)
    // antes de su fecha, para que no le quiten protagonismo a la actividad en
    // curso. Las pasadas y las cercanas (<= 7 días) SIEMPRE se muestran.
    const fechaInicio = parseSpanishDate(a.date)
    const limite = new Date(hoy)
    limite.setDate(limite.getDate() + 7)
    if (fechaInicio > hoy && fechaInicio > limite) return false
    // Mecanismo adicional showAfter (fecha fija) si está definido
    if (a.showAfter && hoy < new Date(a.showAfter + "T00:00:00")) return false
    return true
  }).sort((a, b) => {
    return parseSpanishDate(b.date) - parseSpanishDate(a.date)
  })

  renderPage(1)
}

function renderPage(page) {
  const grid = document.getElementById("activityGrid")
  if (!grid) return

  currentPage = page
  grid.innerHTML = ""

  const inicio = (page - 1) * ACTIVITIES_PER_PAGE
  const fin = inicio + ACTIVITIES_PER_PAGE
  const paginaActual = sortedActivitiesCache.slice(inicio, fin)

  paginaActual.forEach((activity) => {
    const card = document.createElement("a")
    card.href = activity.url
    card.rel = "noopener noreferrer"
    card.className = "activity-card"

    // Estado efectivo según la fecha:
    // - hoy dentro del rango de la actividad -> ACTIVO
    // - la fecha de fin ya pasó                 -> FINALIZADO
    // - todavía no llega el día                 -> estado guardado (PRÓXIMAMENTE)
    const hoyInicio = new Date()
    hoyInicio.setHours(0, 0, 0, 0)
    const fechaInicio = parseSpanishDate(activity.date)
    const fechaFin = fechaFinActividad(activity)
    let estadoEfectivo = activity.status
    if (fechaFin < hoyInicio) {
      estadoEfectivo = "FINALIZADO"
    } else if (hoyInicio >= fechaInicio && hoyInicio <= fechaFin) {
      estadoEfectivo = "ACTIVO"
    }

    // Mapea el estado a la clase CSS correspondiente (colores y estilos)
    const statusClass = estadoEfectivo === "PRÓXIMAMENTE" ? "upcoming" : estadoEfectivo === "ACTIVO" ? "active" : estadoEfectivo === "EN CURSO" ? "now" : "finished"

    card.innerHTML = `
      <div class="card-image-container">
        <img src="${activity.image}" alt="${activity.title}" class="card-image">
      </div>
      <div class="card-content">
        <h3 class="card-title">${activity.title}</h3>
        <span class="card-status ${statusClass}">${estadoEfectivo}</span>
        <p class="card-description">${activity.description}</p>
        <p class="card-date">${activity.date}</p>
      </div>
    `

    grid.appendChild(card)
  })

  renderPagination()
  grid.scrollIntoView({ behavior: "smooth", block: "start" })
}

function renderPagination() {
  const contenedor = document.getElementById("pagination")
  if (!contenedor) return

  const totalPaginas = Math.ceil(sortedActivitiesCache.length / ACTIVITIES_PER_PAGE)
  if (totalPaginas <= 1) {
    contenedor.innerHTML = ""
    return
  }

  let html = ""

  html += `<button class="page-btn page-nav" ${currentPage === 1 ? "disabled" : ""} onclick="renderPage(${currentPage - 1})">‹ Anterior</button>`

  for (let i = 1; i <= totalPaginas; i++) {
    // Muestra siempre la primera, la última, la actual y las vecinas; el resto como "..."
    const esVisible = i === 1 || i === totalPaginas || Math.abs(i - currentPage) <= 1
    if (esVisible) {
      html += `<button class="page-btn ${i === currentPage ? "active" : ""}" onclick="renderPage(${i})">${i}</button>`
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<span class="page-dots">…</span>`
    }
  }

  html += `<button class="page-btn page-nav" ${currentPage === totalPaginas ? "disabled" : ""} onclick="renderPage(${currentPage + 1})">Siguiente ›</button>`

  contenedor.innerHTML = html
}

// ------------------------------------------------------------------
// Inicialización
// ------------------------------------------------------------------
// - renderActivities(): pinta las tarjetas de actividades en #activityGrid
//   (la navegación activa y la marquesina las maneja componentes.js)
document.addEventListener("DOMContentLoaded", () => {
  renderActivities()
})
