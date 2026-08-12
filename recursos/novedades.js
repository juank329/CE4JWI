// Activity Data
const activities = [
{
    id: 1,
    title: "Físicas vs. Digitales: El debate de las QSL en la era moderna",
    image: "public/fisicas o digitales.jpg",
    status: "NOVEDADES",
    description:
      "Muchos empezamos en esto por el romanticismo de coleccionar tarjetas de cartón. Sin embargo, los tiempos cambian y la tecnología empuja fuerte. Analicemos los dos lados de la moneda: ...",
    date: "17 Mayo 2026",
    url: "fisicas_vs_digitales_2026.html",
  },
  {
    id: 2,
    title: "Primeros pasos en FT8 y FT4: Guía para no morir en el intento",
    image: "public/primeros pasos digitales ft8.jpg",
    status: "NOVEDADES",
    description:
      "Si has estado recorriendo las bandas de HF últimamente, seguro habrás escuchado ese sonido constante que parece un enjambre de abejas electrónicas. Sí, estamos hablando de FT8 y FT4, los modos digitales...",
    date: "18 Mayo 2026",
    url: "primeros_pasos_ft8_ft4_2026.html",
  },
  {
    id: 3,
    title: "Automatizando tus contactos: Sincronización entre tu Logbook local, eQSL y LoTW (Logbook of the World)",
    image: "public/Automatizando tus contactos.jpg",
    status: "NOVEDADES",
    description:
      "Hacer el contacto de radio en el aire es solo la mitad del camino. La otra mitad, igualmente emocionante, es lograr la confirmación oficial de ese QSO para validar nuestros países ...",
    date: "11 Junio 2026",
    url: "automatizando_tus_contactos_2026.html",
  },
  
 
]

function parseSpanishDate(dateStr) {
  const months = {
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

  const parts = dateStr.split(" ")
  const day = Number.parseInt(parts[0])
  const month = months[parts[1]]
  const year = Number.parseInt(parts[2])

  return new Date(year, month, day)
}

// Render Activity Cards
function renderActivities() {
  const grid = document.getElementById("activityGrid")

  const sortedActivities = [...activities].sort((a, b) => {
    return parseSpanishDate(b.date) - parseSpanishDate(a.date)
  })

  sortedActivities.forEach((activity) => {
    const card = document.createElement("a")
    card.href = activity.url
    card.target = ""
    card.rel = "noopener noreferrer"
    card.className = "activity-card"

    // Limpiamos el texto para evitar fallos por mayúsculas/minúsculas o espacios
    const currentStatus = (activity.status || "").toUpperCase().trim();

    // Evaluamos incluyendo el nuevo estado NOVEDADES (asigna la clase "news")
    const statusClass = currentStatus === "PRÓXIMAMENTE" ? "upcoming" 
                      : currentStatus === "EN CURSO" ? "now" 
                      : currentStatus === "NOVEDADES" ? "news" 
                      : "finished";

    card.innerHTML = `
      <div class="card-image-container">
        <img src="${activity.image}" alt="${activity.title}" class="card-image">
      </div>
      <div class="card-content">
        <h3 class="card-title">${activity.title}</h3>
        <span class="card-status ${statusClass}">${activity.status}</span>
        <p class="card-description">${activity.description}</p>
        <p class="card-date">${activity.date}</p>
      </div>
    `; // Nota: Corregí un pequeño error de sintaxis al final de tu plantilla string original (tenías un '>')
    
    grid.appendChild(card); // Asegúrate de mantener esta línea al final de tu bucle si ya la tenías
  });
}

 


// Navigation
function setupNavigation() {
  const navButtons = document.querySelectorAll(".nav-btn")

  navButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      navButtons.forEach((b) => b.classList.remove("active"))
      this.classList.add("active")
    })
  })
}
// Initialize Marquee
function initMarquee() {
  const marqueeContent = document.getElementById("marqueeContent")
  if (!marqueeContent) return

  // Duplicar el contenido para crear un loop infinito sin cortes
  const originalContent = marqueeContent.innerHTML
  marqueeContent.innerHTML = originalContent + originalContent
}


// Initialize
document.addEventListener("DOMContentLoaded", () => {
  renderActivities()
  setupNavigation()
  initMarquee()
})
