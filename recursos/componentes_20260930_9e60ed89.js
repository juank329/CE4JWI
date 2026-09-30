/**
 * ============================================================
 * CE4JWI - Sistema de componentes reutilizables
 * ============================================================
 * Header, marquesina, sidebar y footer se definen como strings
 * de HTML y se inyectan en los contenedores vacíos de cada
 * página (header-container, marquee-container, etc.) con JS.
 *
 * Ventajas:
 *  - Funciona sin servidor (archivo:// o cualquier hosting estático)
 *  - Un solo lugar para editar el menú, footer y widgets del sidebar
 *  - Cualquier página nueva solo necesita copiar los <div> contenedores
 *
 * Para añadir una página al menú: agrega un <a> en COMPONENTES.header
 * con la clase .nav-link y data-page="nombre".
 * ============================================================
 */

const COMPONENTES = {
  header: `
<!-- Header -->
<header class="header">
  <div class="header-content">
    <a href="index.html" class="logo">
      <img src="public/favicon-32x32.png" alt="logo">
      <span>CE4JWI</span>
    </a>
    
    <!-- Botón hamburguesa para móviles -->
    <button class="menu-toggle" id="menuToggle" aria-label="Abrir menú" aria-expanded="false">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      
    </button>
    
    <nav class="nav" id="mainNav">
      <a href="index.html" class="nav-link" data-page="index"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><g transform="scale(1.33333)"><path d="M13,13.25l-.342,1.447c-.208,.909-1.017,1.553-1.949,1.553h-1.959" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path><path d="M3.75,7.353l-1.123,.567c-.813,.411-1.246,1.319-1.053,2.209l.335,1.545c.199,.92,1.013,1.576,1.955,1.576h1.137s-1.084-5-1.084-5c-.099-.403-.166-.817-.166-1.25,0-2.899,2.351-5.25,5.25-5.25s5.25,2.351,5.25,5.25c0,.433-.067,.847-.166,1.25l-1.084,5h1.137c.941,0,1.755-.656,1.955-1.576l.335-1.545c.193-.89-.24-1.799-1.053-2.209l-1.123-.567" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path></g></svg> <span data-i18n="nav.actividades">ACTIVIDADES</span></a>
      <a href="calendario.html" class="nav-link" data-page="calendario"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M17 14C17.5523 14 18 13.5523 18 13C18 12.4477 17.5523 12 17 12C16.4477 12 16 12.4477 16 13C16 13.5523 16.4477 14 17 14Z" fill="currentColor"/><path d="M17 18C17.5523 18 18 17.5523 18 17C18 16.4477 17.5523 16 17 16C16.4477 16 16 16.4477 16 17C16 17.5523 16.4477 18 17 18Z" fill="currentColor"/><path d="M13 13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13C11 12.4477 11.4477 12 12 12C12.5523 12 13 12.4477 13 13Z" fill="currentColor"/><path d="M13 17C13 17.5523 12.5523 18 12 18C11.4477 18 11 17.5523 11 17C11 16.4477 11.4477 16 12 16C12.5523 16 13 16.4477 13 17Z" fill="currentColor"/><path d="M7 14C7.55229 14 8 13.5523 8 13C8 12.4477 7.55229 12 7 12C6.44772 12 6 12.4477 6 13C6 13.5523 6.44772 14 7 14Z" fill="currentColor"/><path d="M7 18C7.55229 18 8 17.5523 8 17C8 16.4477 7.55229 16 7 16C6.44772 16 6 16.4477 6 17C6 17.5523 6.44772 18 7 18Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7 1.75C7.41421 1.75 7.75 2.08579 7.75 2.5V3.26272C8.412 3.24999 9.14133 3.24999 9.94346 3.25H14.0564C14.8586 3.24999 15.588 3.24999 16.25 3.26272V2.5C16.25 2.08579 16.5858 1.75 17 1.75C17.4142 1.75 17.75 2.08579 17.75 2.5V3.32709C18.0099 3.34691 18.2561 3.37182 18.489 3.40313C19.6614 3.56076 20.6104 3.89288 21.3588 4.64124C22.1071 5.38961 22.4392 6.33855 22.5969 7.51098C22.75 8.65018 22.75 10.1058 22.75 11.9435V14.0564C22.75 15.8941 22.75 17.3498 22.5969 18.489C22.4392 19.6614 22.1071 20.6104 21.3588 21.3588C20.6104 22.1071 19.6614 22.4392 18.489 22.5969C17.3498 22.75 15.8942 22.75 14.0565 22.75H9.94359C8.10585 22.75 6.65018 22.75 5.51098 22.5969C4.33856 22.4392 3.38961 22.1071 2.64124 21.3588C1.89288 20.6104 1.56076 19.6614 1.40314 18.489C1.24997 17.3498 1.24998 15.8942 1.25 14.0564V11.9436C1.24998 10.1058 1.24997 8.65019 1.40314 7.51098C1.56076 6.33855 1.89288 5.38961 2.64124 4.64124C3.38961 3.89288 4.33856 3.56076 5.51098 3.40313C5.7439 3.37182 5.99006 3.34691 6.25 3.32709V2.5C6.25 2.08579 6.58579 1.75 7 1.75ZM5.71085 4.88976C4.70476 5.02502 4.12511 5.27869 3.7019 5.7019C3.27869 6.12511 3.02502 6.70476 2.88976 7.71085C2.86685 7.88123 2.8477 8.06061 2.83168 8.25H21.1683C21.1523 8.06061 21.1331 7.88124 21.1102 7.71085C20.975 6.70476 20.7213 6.12511 20.2981 5.7019C19.8749 5.27869 19.2952 5.02502 18.2892 4.88976C17.2615 4.75159 15.9068 4.75 14 4.75H10C8.09318 4.75 6.73851 4.75159 5.71085 4.88976ZM2.75 12C2.75 11.146 2.75032 10.4027 2.76309 9.75H21.2369C21.2497 10.4027 21.25 11.146 21.25 12V14C21.25 15.9068 21.2484 17.2615 21.1102 18.2892C20.975 19.2952 20.7213 19.8749 20.2981 20.2981C19.8749 20.7213 19.2952 20.975 18.2892 21.1102C17.2615 21.2484 15.9068 21.25 14 21.25H10C8.09318 21.25 6.73851 21.2484 5.71085 21.1102C4.70476 20.975 4.12511 20.7213 3.7019 20.2981C3.27869 19.8749 3.02502 19.2952 2.88976 18.2892C2.75159 17.2615 2.75 15.9068 2.75 14V12Z" fill="currentColor"/></svg> CALENDARIO</a>
      <a href="QSO_logger.html" class="nav-link" data-page="qsologger"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 4v5"/></svg> <span data-i18n="nav.generador">GENERADOR DE QSL</span></a>
      <a href="descargar-qsl.html" class="nav-link" data-page="descarga-qsl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 21h16"/></svg> <span data-i18n="nav.descarga">DESCARGA DE QSL</span></a>
      </nav>
  </div>
</header>
  `,

  marquee: `
<!-- ==========================================================
     Marquesina de NOVEDADES (scroll horizontal infinito).
     El contenido se duplica con JS (initMarquee) para que la
      animación CSS (translateX -50%) haga un loop sin cortes.
      El contenido se genera con JS (renderizarMarquee) desde el array
      compartido ACTIVIDADES (recursos/actividades.js): solo actividades
      con etiqueta PRÓXIMAMENTE; si no hay, repite las 3 últimas FINALIZADO.
      Cada ítem enlaza a la página de la actividad.
      ========================================================== -->
<div class="marquee-container">
  <div class="marquee-label">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    <span data-i18n="marquee.titulo">PRÓXIMAS ACTIVIDADES</span>
  </div>
  <div class="marquee-wrapper">
    <div class="marquee-content" id="marqueeContent">
      <span class="marquee-item" data-i18n="marquee.cargando">Cargando próximas actividades...</span>
    </div>
  </div>
</div>
  `,

  sidebar: `
<!-- Sidebar -->
<aside class="sidebar">
    
    
  <!-- Widget: Slider de Imágenes -->
    <div class="widget">
      <div class="widget-header">
          <img src="public/walkie-talkie.png" alt="" width="18" height="18">
            <h3 data-i18n="sidebar.modos">Modos de Contacto</h3>
      </div>
      <div class="widget slider-widget">
        <div class="slider-container">
          <div class="slider-track" id="sliderTrack">
            <div class="slide active">
              <img src="public/ADN ACTIVA2.png" alt="ADN SYSTEMS 73040">
            </div>
           <div class="slide">
              <img src="public/APRS CARROUSEL.png" alt="APRS">
            </div>
           <div class="slide">
              <img src="public/peanut.png" alt="Peanut">
            </div>
            
            
          </div>
          <button class="slider-btn prev" id="sliderPrev" aria-label="Imagen anterior" data-i18n-title="sidebar.imgAnterior">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button class="slider-btn next" id="sliderNext" aria-label="Imagen siguiente" data-i18n-title="sidebar.imgSiguiente">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
          <div class="slider-dots" id="sliderDots">
            <span class="dot active" data-slide="0"></span>
            <span class="dot" data-slide="1"></span>
            <span class="dot" data-slide="2"></span>
          </div>
        </div>
      </div>
  </div>
      
<!-- Widget: Reloj local -->
  <div class="widget">
    <div class="widget-header">
      <svg class="widget-icon purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <h3 data-i18n="sidebar.hora">Hora Local</h3>
    </div>
    <div class="widget-content widget-clock">
      <h3><span style="color:gray;"><span data-i18n="sidebar.horaActual">Hora actual</span></span> <span data-i18n="sidebar.localTalca">· Local Talca</span></h3>
      <p id="relojLocal" style="font-size:2.2rem;font-weight:700;color:#1a4d8f;margin:0.5rem 0 0;font-family:'JetBrains Mono',monospace;">--:--:--</p>
    </div>
  </div>
  
  <!-- Widget: QSL por Telegram -->
  <div class="widget widget-telegram">
    <div class="widget-header">
      <svg class="widget-icon telegram" viewBox="0 0 256 256" fill="currentColor" preserveAspectRatio="xMidYMid"><path d="M57.94 126.648c37.32-16.256 62.2-26.974 74.64-32.152 35.56-14.786 42.94-17.354 47.76-17.441 1.06-.017 3.42.245 4.96 1.49 1.28 1.05 1.64 2.47 1.82 3.467.16.996.38 3.266.2 5.038-1.92 20.24-10.26 69.356-14.5 92.026-1.78 9.592-5.32 12.808-8.74 13.122-7.44.684-13.08-4.912-20.28-9.63-11.26-7.386-17.62-11.982-28.56-19.188-12.64-8.328-4.44-12.906 2.76-20.386 1.88-1.958 34.64-31.748 35.26-34.45.08-.338.16-1.598-.6-2.262-.74-.666-1.84-.438-2.64-.258-1.14.256-19.12 12.152-54 35.686-5.1 3.508-9.72 5.218-13.88 5.128-4.56-.098-13.36-2.584-19.9-4.708-8-2.606-14.38-3.984-13.82-8.41.28-2.304 3.46-4.662 9.52-7.072Z"/></svg>
      <h3>QSL por Telegram</h3>
    </div>
    <div class="widget-content widget-telegram-body">
      <a href="https://t.me/Ce4jwi_qsl_bot" target="_blank" rel="noopener" class="telegram-qr-link" title="Abrir el bot en Telegram">
        <img src="public/qr_telegram_main.png" alt="Código QR del bot CE4JWI QSL por Telegram" class="telegram-qr-img">
      </a>
      <p class="telegram-qr-text">¡Escanéame y recibe tus QSL directo en tu Telegram!</p>
      <span class="telegram-qr-pill">@Ce4jwi_qsl_bot</span>
    </div>
  </div>
  

  



  <!-- Widget: Visitas en la Web! -->
  <div class="widget">
    <div class="widget-header">
      <svg class="widget-icon yellow" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
        <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2"/>
        <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2"/>
        <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2"/>
      </svg>
      <h3 data-i18n="sidebar.visitas">Visitas en la Web!</h3>
    </div>
    <div class="content">
      <a href="https://info.flagcounter.com/7pzT">
        <img src="https://s01.flagcounter.com/count/7pzT/bg_FFFFFF/txt_000000/border_CCCCCC/columns_3/maxflags_250/viewers_View/labels_1/pageviews_1/flags_1/percent_0/" alt="Flag Counter" border="0" style="width:100%;max-width:100%;">
      </a>
    </div>
  </div>
</aside>

  `,

  footer: `
<!-- Footer -->
<footer class="footer">
  <div class="footer-bottom">
    <p>&copy; <span id="footerYear">2025</span> - CE4JWI</p>
    <p class="footer-tagline" data-i18n="footer.tagline">73 de CE4JWI - ¡Nos escuchamos en el aire!</p>
  </div>
</footer>

<!-- Botones flotantes de contacto -->
<div class="floating-contact" aria-label="Contacto">
  <a href="mailto:ce4jwi@outlook.com" class="floating-btn float-mail" title="Escríbenos por correo" aria-label="Correo" data-i18n-title="footer.correo">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  </a>
  <a href="https://t.me/ce4jwi" target="_blank" rel="noopener" class="floating-btn float-telegram" title="Contáctanos por Telegram" aria-label="Telegram" data-i18n-title="footer.telegram">
    <svg viewBox="0 0 256 256" fill="currentColor" preserveAspectRatio="xMidYMid"><path d="M57.94 126.648c37.32-16.256 62.2-26.974 74.64-32.152 35.56-14.786 42.94-17.354 47.76-17.441 1.06-.017 3.42.245 4.96 1.49 1.28 1.05 1.64 2.47 1.82 3.467.16.996.38 3.266.2 5.038-1.92 20.24-10.26 69.356-14.5 92.026-1.78 9.592-5.32 12.808-8.74 13.122-7.44.684-13.08-4.912-20.28-9.63-11.26-7.386-17.62-11.982-28.56-19.188-12.64-8.328-4.44-12.906 2.76-20.386 1.88-1.958 34.64-31.748 35.26-34.45.08-.338.16-1.598-.6-2.262-.74-.666-1.84-.438-2.64-.258-1.14.256-19.12 12.152-54 35.686-5.1 3.508-9.72 5.218-13.88 5.128-4.56-.098-13.36-2.584-19.9-4.708-8-2.606-14.38-3.984-13.82-8.41.28-2.304 3.46-4.662 9.52-7.072Z"/></svg>
  </a>
</div>
  `,
}

/**
 * Inyecta un componente en su contenedor
 */
function cargarComponente(nombre, containerId) {
  const container = document.getElementById(containerId)
  if (container && COMPONENTES[nombre]) {
    container.innerHTML = COMPONENTES[nombre]
  }
}

/**
 * Marca el enlace de navegación activo según la página actual
 */
function marcarNavActivo() {
  // Obtenemos la URL actual limpia (sin almohadillas # ni parámetros ?)
  const currentUrl = window.location.href.split('#')[0].split('?')[0];
  const enlaces = document.querySelectorAll(".nav-link");

  enlaces.forEach((enlace) => {
    // Comparamos la URL absoluta del href con la URL actual
    if (enlace.href === currentUrl) {
      enlace.classList.add("active");
    } else {
      enlace.classList.remove("active");
    }
  });
}

// No olvides llamar a la función al cargar el documento
document.addEventListener("DOMContentLoaded", marcarNavActivo);

/**
 * Inicializa el menú móvil responsive
 */
function inicializarMenuMovil() {
  const menuToggle = document.getElementById("menuToggle")
  const mainNav = document.getElementById("mainNav")

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("nav-open")
      menuToggle.classList.toggle("active")
      menuToggle.setAttribute("aria-expanded", isOpen)
    })

    // Cerrar menú al hacer clic en un enlace
    mainNav.querySelectorAll(".nav-link:not(.nav-dropdown-toggle)").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("nav-open")
        menuToggle.classList.remove("active")
        menuToggle.setAttribute("aria-expanded", "false")
      })
    })

    // Cerrar menú al hacer clic fuera
    document.addEventListener("click", (e) => {
      if (!menuToggle.contains(e.target) && !mainNav.contains(e.target)) {
        mainNav.classList.remove("nav-open")
        menuToggle.classList.remove("active")
        menuToggle.setAttribute("aria-expanded", "false")
      }
    })
  }
}

/**
 * Inicializa los menús desplegables del header (ej: "Herramientas")
 */
function inicializarDropdowns() {
  const toggles = document.querySelectorAll(".nav-dropdown-toggle")

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()
      const dropdown = toggle.closest(".nav-dropdown")
      const yaAbierto = dropdown.classList.contains("open")

      document.querySelectorAll(".nav-dropdown.open").forEach((d) => {
        d.classList.remove("open")
        d.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded", "false")
      })

      if (!yaAbierto) {
        dropdown.classList.add("open")
        toggle.setAttribute("aria-expanded", "true")
      }
    })
  })

  document.addEventListener("click", (e) => {
    document.querySelectorAll(".nav-dropdown.open").forEach((dropdown) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove("open")
        dropdown.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded", "false")
      }
    })
  })
}

/**
 * Inicializa el slider de imágenes del sidebar
 */
function inicializarSlider() {
  const slides = document.querySelectorAll(".slide")
  const track = document.getElementById("sliderTrack")
  const dots = document.querySelectorAll(".dot")
  const prevBtn = document.getElementById("sliderPrev")
  const nextBtn = document.getElementById("sliderNext")

  if (!slides.length) return

  let currentSlide = 0
  let autoSlideInterval

  function showSlide(index) {
    // Ajustar índice si sale de rango
    if (index >= slides.length) currentSlide = 0
    else if (index < 0) currentSlide = slides.length - 1
    else currentSlide = index

    // Deslizar el track horizontalmente
    if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`

    // Actualizar dots
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentSlide)
    })
  }

  function nextSlide() {
    showSlide(currentSlide + 1)
  }

  function prevSlide() {
    showSlide(currentSlide - 1)
  }

  function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 4000)
  }

  function stopAutoSlide() {
    clearInterval(autoSlideInterval)
  }

  // Event listeners
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      prevSlide()
      stopAutoSlide()
      startAutoSlide()
    })
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      nextSlide()
      stopAutoSlide()
      startAutoSlide()
    })
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showSlide(Number.parseInt(dot.dataset.slide))
      stopAutoSlide()
      startAutoSlide()
    })
  })

  // Iniciar auto-slide
  startAutoSlide()
}

/**
 * Actualiza automáticamente el año mostrado en el footer.
 * Así no hay que editar el HTML cada vez que cambia el año.
 */
function actualizarAnioFooter() {
  const span = document.getElementById("footerYear")
  if (span) span.textContent = new Date().getFullYear()
}

// ---- Marquesina "PRÓXIMAS ACTIVIDADES" -----------------------------
const MQ_MESES = {
  Enero: 0, Febrero: 1, Marzo: 2, Abril: 3, Mayo: 4, Junio: 5,
  Julio: 6, Agosto: 7, Septiembre: 8, Octubre: 9, Noviembre: 10, Diciembre: 11,
}

// Todo el calculo de fechas de la marquesina va en UTC a proposito: la
// ventana de cada actividad es de 00:00 a 23:59 UTC (regla del usuario
// del 29-sep-2026), asi que el estado no puede depender de la zona horaria
// de quien visita. Antes comparaba contra la medianoche LOCAL.
function mqHoyUTC() {
  const d = new Date()
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

function mqParseFecha(fechaStr) {
  const partes = fechaStr.split(" ")
  const dia = Number.parseInt(partes[0])
  return Date.UTC(Number.parseInt(partes[2]), MQ_MESES[partes[1]], dia)
}

// Fecha de fin: soporta rangos "29-31 Enero 2026" (usa el último día)
function mqFechaFin(actividad) {
  const partes = actividad.date.split(" ")
  const dias = partes[0]
  const diaFin = dias.includes("-") ? Number.parseInt(dias.split("-")[1]) : Number.parseInt(dias)
  // El ultimo dia de la actividad termina a las 23:59:59 UTC.
  return Date.UTC(Number.parseInt(partes[2]), MQ_MESES[partes[1]], diaFin, 23, 59, 59)
}

// Estado efectivo según la fecha (misma lógica que la portada):
// - la fecha de fin ya pasó  -> FINALIZADO
// - hoy cae dentro del rango -> ACTIVO
// - todavía no llega el día  -> estado guardado (PRÓXIMAMENTE)
function mqEstadoEfectivo(actividad) {
  const hoy = mqHoyUTC()
  // = medianoche UTC de hoy (ver mqHoyUTC())
  const fin = mqFechaFin(actividad)
  if (fin < hoy) return "FINALIZADO"
  const inicio = mqParseFecha(actividad.date)
  if (hoy >= inicio && hoy <= fin) return "ACTIVO"
  return actividad.status
}

/**
 * Renderiza la marquesina con las actividades PRÓXIMAMENTE.
 * Si no hay ninguna, repite las 3 últimas FINALIZADO.
 * Cada ítem enlaza a la página de la actividad. El contenido se
 * duplica para que el loop CSS (translateX -50%) sea continuo.
 */
function renderizarMarquee() {
  const contenedor = document.getElementById("marqueeContent")
  if (!contenedor) return
  if (typeof ACTIVIDADES === "undefined" || !Array.isArray(ACTIVIDADES)) return

  const hoy = mqHoyUTC()
  // = medianoche UTC de hoy (ver mqHoyUTC())

  // Próximas (fecha de inicio en el futuro o de hoy en adelante).
  // Las que ya finalizaron se excluyen automáticamente por mqEstadoEfectivo.
  const fechaHoy = mqHoyUTC()
  // = medianoche UTC de hoy (ver mqHoyUTC())
  const proximas = ACTIVIDADES
    .filter((a) => mqEstadoEfectivo(a) === "PRÓXIMAMENTE")
    .filter((a) => !a.showAfter || hoy >= new Date(a.showAfter + "T00:00:00Z"))
    .sort((a, b) => mqParseFecha(a.date) - mqParseFecha(b.date))

  let seleccion = proximas

  if (seleccion.length === 0) {
    const vacio = (typeof I18N !== "undefined" && I18N.t) ? I18N.t("marquee.vacio") : "Próximamente más actividades."
    contenedor.innerHTML = `<span class="marquee-item">${vacio}</span>`
    return
  }

  const itemsHtml = seleccion
    .map((actividad) => {
      const esProxima = mqEstadoEfectivo(actividad) === "PRÓXIMAMENTE"
      const tProxima = (typeof I18N !== "undefined" && I18N.t) ? I18N.t("marquee.proximamente") : "PRÓXIMAMENTE"
      const tFinalizada = (typeof I18N !== "undefined" && I18N.t) ? I18N.t("marquee.finalizada") : "FINALIZADA"
      const badge = esProxima
        ? `<span class="marquee-badge upcoming">${tProxima}</span>`
        : `<span class="marquee-badge not">${tFinalizada}</span>`
      return `
      <a class="marquee-item marquee-link" href="${actividad.url}">
        ${badge}
        <span class="marquee-text">${actividad.title}</span>
        <span class="marquee-date">${actividad.date}</span>
      </a>
      <span class="marquee-separator">★</span>
    `
    })
    .join("")

  contenedor.innerHTML = itemsHtml + itemsHtml
}

/**
 * Inicia el reloj local de la barra lateral
 */
function iniciarReloj() {
  const el = document.getElementById("relojLocal");
  if (!el) return;
  function actualizar() {
    try {
      el.textContent = new Date().toLocaleTimeString("es-CL", { timeZone: "America/Santiago", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    } catch (e) {
      el.textContent = new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    }
  }
  actualizar();
  setInterval(actualizar, 1000);
}

/**
 * Inicializa todos los componentes de la página
 */
function inicializarComponentes() {
  // Cargar componentes
  cargarComponente("header", "header-container")
  cargarComponente("marquee", "marquee-container")
  cargarComponente("sidebar", "sidebar-container")
  cargarComponente("footer", "footer-container")

  // Iniciar el reloj local de la barra lateral
  iniciarReloj()

  // Renderizar la marquesina de próximas actividades
  renderizarMarquee()

  // Marcar navegación activa
  marcarNavActivo()

  // Actualizar el año del footer
  actualizarAnioFooter()

  // Inicializar menú móvil
  inicializarMenuMovil()

  // Inicializar menú desplegable "Herramientas"
  inicializarDropdowns()

  // Inicializar slider del sidebar
  inicializarSlider()

  // Re-aplicar los estados del ranking (el sitio es solo en espanol)
  if (typeof I18N !== "undefined" && I18N.aplicarTodo) I18N.aplicarTodo()
}

// Ejecutar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", inicializarComponentes)
