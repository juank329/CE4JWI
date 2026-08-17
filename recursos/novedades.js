// ==================================================================
// CE4JWI - Página de NOVEDADES
// ==================================================================
// Similar a script.js pero para la sección Novedades: muestra
// tarjetas con los artículos recientes en #activityGrid.
// (La navegación activa la maneja marcarNavActivo() en componentes.js)
// ==================================================================

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
  {
    id: 4,
    title: "Libro de guardia: El diario de tu estación",
    image: "public/libro de guardia.svg",
    status: "NOVEDADES",
    description:
      "El logbook es la memoria de la estación. Aprende los datos obligatorios de cada QSO, las diferencias entre papel y digital, y el formato ADIF que conecta tu registro con LoTW, eQSL y QRZ: ...",
    date: "14 Agosto 2026",
    url: "libro_de_guardia_2026.html",
  },
  {
    id: 5,
    title: "Medidor de ROE: La salud de tu antena",
    image: "public/medidor de roe.svg",
    status: "NOVEDADES",
    description:
      "El ROE (SWR) es el pulso de tu sistema irradiante. Descubre qué es la onda estacionaria, cómo se mide en línea con el transceptor y qué hacer cuando el valor se dispara: ...",
    date: "15 Agosto 2026",
    url: "medidor_de_roe_2026.html",
  },
  {
    id: 6,
    title: "El Código Q: El idioma universal de las bandas",
    image: "public/codigo q.svg",
    status: "NOVEDADES",
    description:
      "QRZ, QSL, QRM, QRP... tres letras bastan para comunicarte con el mundo. Conoce la historia del código Q, su uso en CW, fonía y digitales, y los códigos que usamos a diario: ...",
    date: "16 Agosto 2026",
    url: "codigo_q_2026.html",
  },
  {
    id: 7,
    title: "Antenas básicas para empezar en HF",
    image: "public/antenas basicas.svg",
    status: "NOVEDADES",
    description:
      "La antena es la mitad del rendimiento. Dipolo, vertical y yagi: te cuento cuál elegir para dar tus primeros pasos, los cálculos rápidos y los errores de novato que todos cometemos: ...",
    date: "17 Agosto 2026",
    url: "antenas_basicas_2026.html",
  },
  {
    id: 8,
    title: "La licencia de radioaficionado en Chile",
    image: "public/licencia_radioaficionado_chile.jpg",
    status: "NOVEDADES",
    description:
      "El camino hacia tu diploma ante SUBTEL: el examen, las categorías, las bandas autorizadas y el indicativo que será tu nombre en las bandas, como el CE4JWI de este blog: ...",
    date: "18 Agosto 2026",
    url: "licencia_radioaficionado_chile_2026.html",
  },
  {
    id: 9,
    title: "QRZ.com: La base de datos de indicativos que une a la radioafición",
    image: "public/qrz_com.png",
    status: "NOVEDADES",
    description:
      "El 'directorio telefónico' de la radioafición: busca cualquier indicativo del mundo, crea tu página personal, confirma tus QSO en el QRZ Logbook y conéctalo a tu software: ...",
    date: "19 Agosto 2026",
    url: "qrz_com_2026.html",
  },
  {
    id: 10,
    title: "eQSL.cc: Las tarjetas QSL electrónicas",
    image: "public/eQSL.jpg",
    status: "NOVEDADES",
    description:
      "La confirmación de QSO que viaja por Internet: gratis, en minutos y con sus propios diplomas. Te cuento el registro en dos pasos, el sistema AG y los eAwards: ...",
    date: "20 Agosto 2026",
    url: "eqsl_cc_2026.html",
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
  if (!grid) return

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
        <img src="${activity.image}" alt="${activity.title}" class="card-image${activity.url === "qrz_com_2026.html" || activity.url === "eqsl_cc_2026.html" ? " card-image-fit" : ""}">
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

 
 

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  renderActivities()
})
