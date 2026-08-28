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
      <a href="index.html" class="nav-link" data-page="index"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><g transform="scale(1.33333)"><path d="M13,13.25l-.342,1.447c-.208,.909-1.017,1.553-1.949,1.553h-1.959" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path><path d="M3.75,7.353l-1.123,.567c-.813,.411-1.246,1.319-1.053,2.209l.335,1.545c.199,.92,1.013,1.576,1.955,1.576h1.137s-1.084-5-1.084-5c-.099-.403-.166-.817-.166-1.25,0-2.899,2.351-5.25,5.25-5.25s5.25,2.351,5.25,5.25c0,.433-.067,.847-.166,1.25l-1.084,5h1.137c.941,0,1.755-.656,1.955-1.576l.335-1.545c.193-.89-.24-1.799-1.053-2.209l-1.123-.567" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path></g></svg> ACTIVIDADES</a>
      <a href="calendario.html" class="nav-link" data-page="calendario"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M17 14C17.5523 14 18 13.5523 18 13C18 12.4477 17.5523 12 17 12C16.4477 12 16 12.4477 16 13C16 13.5523 16.4477 14 17 14Z" fill="currentColor"/><path d="M17 18C17.5523 18 18 17.5523 18 17C18 16.4477 17.5523 16 17 16C16.4477 16 16 16.4477 16 17C16 17.5523 16.4477 18 17 18Z" fill="currentColor"/><path d="M13 13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13C11 12.4477 11.4477 12 12 12C12.5523 12 13 12.4477 13 13Z" fill="currentColor"/><path d="M13 17C13 17.5523 12.5523 18 12 18C11.4477 18 11 17.5523 11 17C11 16.4477 11.4477 16 12 16C12.5523 16 13 16.4477 13 17Z" fill="currentColor"/><path d="M7 14C7.55229 14 8 13.5523 8 13C8 12.4477 7.55229 12 7 12C6.44772 12 6 12.4477 6 13C6 13.5523 6.44772 14 7 14Z" fill="currentColor"/><path d="M7 18C7.55229 18 8 17.5523 8 17C8 16.4477 7.55229 16 7 16C6.44772 16 6 16.4477 6 17C6 17.5523 6.44772 18 7 18Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7 1.75C7.41421 1.75 7.75 2.08579 7.75 2.5V3.26272C8.412 3.24999 9.14133 3.24999 9.94346 3.25H14.0564C14.8586 3.24999 15.588 3.24999 16.25 3.26272V2.5C16.25 2.08579 16.5858 1.75 17 1.75C17.4142 1.75 17.75 2.08579 17.75 2.5V3.32709C18.0099 3.34691 18.2561 3.37182 18.489 3.40313C19.6614 3.56076 20.6104 3.89288 21.3588 4.64124C22.1071 5.38961 22.4392 6.33855 22.5969 7.51098C22.75 8.65018 22.75 10.1058 22.75 11.9435V14.0564C22.75 15.8941 22.75 17.3498 22.5969 18.489C22.4392 19.6614 22.1071 20.6104 21.3588 21.3588C20.6104 22.1071 19.6614 22.4392 18.489 22.5969C17.3498 22.75 15.8942 22.75 14.0565 22.75H9.94359C8.10585 22.75 6.65018 22.75 5.51098 22.5969C4.33856 22.4392 3.38961 22.1071 2.64124 21.3588C1.89288 20.6104 1.56076 19.6614 1.40314 18.489C1.24997 17.3498 1.24998 15.8942 1.25 14.0564V11.9436C1.24998 10.1058 1.24997 8.65019 1.40314 7.51098C1.56076 6.33855 1.89288 5.38961 2.64124 4.64124C3.38961 3.89288 4.33856 3.56076 5.51098 3.40313C5.7439 3.37182 5.99006 3.34691 6.25 3.32709V2.5C6.25 2.08579 6.58579 1.75 7 1.75ZM5.71085 4.88976C4.70476 5.02502 4.12511 5.27869 3.7019 5.7019C3.27869 6.12511 3.02502 6.70476 2.88976 7.71085C2.86685 7.88123 2.8477 8.06061 2.83168 8.25H21.1683C21.1523 8.06061 21.1331 7.88124 21.1102 7.71085C20.975 6.70476 20.7213 6.12511 20.2981 5.7019C19.8749 5.27869 19.2952 5.02502 18.2892 4.88976C17.2615 4.75159 15.9068 4.75 14 4.75H10C8.09318 4.75 6.73851 4.75159 5.71085 4.88976ZM2.75 12C2.75 11.146 2.75032 10.4027 2.76309 9.75H21.2369C21.2497 10.4027 21.25 11.146 21.25 12V14C21.25 15.9068 21.2484 17.2615 21.1102 18.2892C20.975 19.2952 20.7213 19.8749 20.2981 20.2981C19.8749 20.7213 19.2952 20.975 18.2892 21.1102C17.2615 21.2484 15.9068 21.25 14 21.25H10C8.09318 21.25 6.73851 21.2484 5.71085 21.1102C4.70476 20.975 4.12511 20.7213 3.7019 20.2981C3.27869 19.8749 3.02502 19.2952 2.88976 18.2892C2.75159 17.2615 2.75 15.9068 2.75 14V12Z" fill="currentColor"/></svg> CALENDARIO</a>
      <a href="qsls.html" class="nav-link" data-page="descarga"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V8.18934L14.4697 6.46967C14.7626 6.17678 15.2374 6.17678 15.5303 6.46967C15.8232 6.76256 15.8232 7.23744 15.5303 7.53033L12.5303 10.5303C12.2374 10.8232 11.7626 10.8232 11.4697 10.5303L8.46967 7.53033C8.17678 7.23744 8.17678 6.76256 8.46967 6.46967C8.76256 6.17678 9.23744 6.17678 9.53033 6.46967L11.25 8.18934V2C11.25 1.58579 11.5858 1.25 12 1.25ZM16.2536 2.05354C16.2941 1.64131 16.6612 1.34001 17.0734 1.38056C18.7643 1.54688 20.0677 1.93602 21.0659 2.93422C21.9607 3.82903 22.366 4.96906 22.5603 6.41379C22.75 7.82528 22.75 9.63432 22.75 11.9427V12.0575C22.75 12.3718 22.75 12.677 22.7495 12.9731C22.7498 12.982 22.75 12.991 22.75 13C22.75 13.0099 22.7498 13.0197 22.7494 13.0295C22.746 14.8816 22.7225 16.3794 22.5603 17.5864C22.366 19.0311 21.9607 20.1711 21.0659 21.066C20.1711 21.9608 19.031 22.3661 17.5863 22.5603C16.1748 22.7501 14.3658 22.7501 12.0574 22.7501H11.9426C9.63423 22.7501 7.82519 22.7501 6.41371 22.5603C4.96897 22.3661 3.82895 21.9608 2.93414 21.066C2.03933 20.1711 1.63399 19.0311 1.43975 17.5864C1.27747 16.3794 1.25397 14.8816 1.25057 13.0295C1.25019 13.0197 1.25 13.0099 1.25 13C1.25 12.991 1.25016 12.982 1.25047 12.9731C1.25 12.677 1.25 12.3718 1.25 12.0575V11.9427C1.24999 9.63432 1.24998 7.82528 1.43975 6.41379C1.63399 4.96906 2.03933 3.82903 2.93414 2.93422C3.93234 1.93602 5.23569 1.54688 6.92658 1.38056C7.33881 1.34001 7.70585 1.64131 7.7464 2.05354C7.78695 2.46576 7.48564 2.8328 7.07342 2.87335C5.51402 3.02674 4.62954 3.36014 3.9948 3.99488C3.42514 4.56454 3.09825 5.33526 2.92637 6.61366C2.75159 7.91364 2.75 9.62186 2.75 12.0001C2.75 12.0842 2.75 12.1675 2.75001 12.25H5.16026C5.20556 12.25 5.25031 12.25 5.29454 12.2499C6.06705 12.2491 6.67886 12.2485 7.22924 12.5016C7.77961 12.7547 8.17729 13.2197 8.67941 13.8067C8.70816 13.8403 8.73725 13.8743 8.76673 13.9087L9.37216 14.6151C10.0059 15.3544 10.1838 15.5373 10.3975 15.6356C10.6113 15.734 10.8659 15.75 11.8397 15.75H12.1603C13.1341 15.75 13.3887 15.734 13.6025 15.6356C13.8162 15.5373 13.9941 15.3544 14.6278 14.6151L15.2333 13.9087C15.2628 13.8743 15.2918 13.8403 15.3206 13.8067C15.8227 13.2197 16.2204 12.7547 16.7708 12.5016C17.3211 12.2485 17.933 12.2491 18.7055 12.2499C18.7497 12.25 18.7944 12.25 18.8397 12.25H21.25C21.25 12.1675 21.25 12.0842 21.25 12.0001C21.25 9.62186 21.2484 7.91364 21.0736 6.61366C20.9018 5.33526 20.5749 4.56454 20.0052 3.99488C19.3705 3.36014 18.486 3.02674 16.9266 2.87335C16.5144 2.8328 16.2131 2.46576 16.2536 2.05354ZM21.2465 13.75H18.8397C17.8659 13.75 17.6113 13.766 17.3975 13.8644C17.1838 13.9627 17.0059 14.1456 16.3722 14.8849L15.7667 15.5913C15.7372 15.6257 15.7082 15.6597 15.6794 15.6933C15.1773 16.2803 14.7796 16.7453 14.2292 16.9984C13.6789 17.2515 13.067 17.2509 12.2945 17.2501C12.2503 17.25 12.2056 17.25 12.1603 17.25H11.8397C11.7944 17.25 11.7497 17.25 11.7055 17.2501C10.933 17.2509 10.3211 17.2515 9.77076 16.9984C9.22039 16.7453 8.82271 16.2803 8.32059 15.6933C8.29184 15.6597 8.26275 15.6257 8.23327 15.5913L7.62784 14.8849C6.9941 14.1456 6.81622 13.9627 6.60245 13.8644C6.38869 13.766 6.13407 13.75 5.16026 13.75H2.7535C2.76294 15.2527 2.79778 16.4301 2.92637 17.3865C3.09825 18.6649 3.42514 19.4356 3.9948 20.0053C4.56445 20.5749 5.33517 20.9018 6.61358 21.0737C7.91356 21.2485 9.62177 21.2501 12 21.2501C14.3782 21.2501 16.0864 21.2485 17.3864 21.0737C18.6648 20.9018 19.4355 20.5749 20.0052 20.0053C20.5749 19.4356 20.9018 18.6649 21.0736 17.3865C21.2022 16.4301 21.2371 15.2527 21.2465 13.75Z" fill="currentColor"/></svg> DESCARGA DE QSLs</a>
      <a href="log.html" class="nav-link" data-page="log"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg> LOG EN TIEMPO REAL</a>

      <div class="nav-dropdown" id="navDropdownHerramientas">
        <button type="button" class="nav-link nav-dropdown-toggle" aria-haspopup="true" aria-expanded="false" aria-label="Herramientas">
          Herramientas
        </button>
        <div class="nav-dropdown-menu">
          <a href="herramienta-fonetico.html" class="nav-link" data-page="fonetico">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12a8 8 0 1 1 8 8"/><path d="M4 12v6"/><path d="M4 12l3-3M4 12l3 3"/></svg>
            Código Fonético y Morse
          </a>
          <a href="QSO_logger.html" class="nav-link" data-page="qsologger">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 4v5"/></svg>
            Generador de QSLs
          </a>
          <a href="herramienta-indicativos.html" class="nav-link" data-page="indicativos">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/><path d="M8 11h6"/></svg>
            Buscar Indicativos (SUBTEL)
          </a>
          <a href="herramienta-satelites.html" class="nav-link" data-page="satelites">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h5v5l10-10h-5z"/><path d="M16 8l2-2"/><path d="M21 21l-4-4"/></svg>
            Seguimiento de Satélites FM
          </a>
          <a href="herramienta-propagacion.html" class="nav-link" data-page="propagacion">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v3"/><path d="M12 18v3"/><path d="M3 12h3"/><path d="M18 12h3"/><path d="M5.6 5.6l2.1 2.1"/><path d="M16.3 16.3l2.1 2.1"/><path d="M5.6 18.4l2.1-2.1"/><path d="M16.3 7.7l2.1-2.1"/></svg>
            Propagación HF en Tiempo Real
          </a>
          <a href="herramienta-aprs.html" class="nav-link" data-page="aprs">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-5.1-7-11a7 7 0 0 1 14 0c0 5.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/><path d="M8.8 7.8a4.4 4.4 0 0 0 0 4.4"/><path d="M15.2 7.8a4.4 4.4 0 0 1 0 4.4"/></svg>
            Mapa APRS Chile
          </a>
          <a href="herramienta-mapa-radio.html" class="nav-link" data-page="mapa-radio">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14"/><path d="M15 6v14"/></svg>
            Mapa de Radioaficionados
          </a>
        </div>
      </div>
      <a href="crear_qsl.html" class="nav-link" data-page="crear-qsl" title="Crear QSL (privado)"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> 🔒</a>
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
    PRÓXIMAS ACTIVIDADES
  </div>
  <div class="marquee-wrapper">
    <div class="marquee-content" id="marqueeContent">
      <span class="marquee-item">Cargando próximas actividades...</span>
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
            <h3>Modos de Contacto</h3>
      </div>
      <div class="widget slider-widget">
        <div class="slider-container">
          <div class="slider-track" id="sliderTrack">
            <div class="slide active">
              <img src="public/ADN ACTIVA2.png" alt="ADN SYSTEMS 73040">
            </div>
           <div class="slide">
              <img src="public/HFk (2).png" alt="HF">
            </div>
           <div class="slide">
              <img src="public/APRS CARROUSEL.png" alt="APRS">
            </div>
            
            
          </div>
          <button class="slider-btn prev" id="sliderPrev" aria-label="Imagen anterior">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button class="slider-btn next" id="sliderNext" aria-label="Imagen siguiente">
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
      
  <!-- Widget: Último Contacto (última QSL generada) -->
  <div class="widget">
    <div class="widget-header">
      <svg class="widget-icon teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
      <h3>Último Contacto</h3>
    </div>
    <div class="widget-content">
      <div class="ult-qsl" id="ultQslWidget">
        <div class="ult-qsl-cargando">Cargando última QSL…</div>
      </div>
    </div>
  </div>
      
  
  <!-- Widget: Buscar en QRZ.COM -->
  <div class="widget">
    <div class="widget-header">
      <img src="public/qrz_com.png" alt="QRZ" width="18" height="18">
      <h3>Buscar en QRZ.COM</h3>
    </div>
    <div class="widget-content">
      <form id="topcall" action="https://www.qrz.com/lookup" method="post" target="_new">
        <input autocomplete="off" id="tquery" name="tquery" type="text" maxlength="80" value="" placeholder="Ingresa Indicativo"/>
        <input id="mode" name="mode" type="hidden" maxlength="80" value="callsign" />
        <input id="tsubmit" type="submit" value="Buscar" />
      </form>
    </div>
  </div>
  

  

  <!-- Widget: Reloj local -->
  <div class="widget">
    <div class="widget-header">
      <svg class="widget-icon purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <h3>Hora Local</h3>
    </div>
    <div class="widget-content widget-clock">
      <h3><span style="color:gray;">Hora actual</span> · Local Talca</h3>
      <p id="relojLocal" style="font-size:2.2rem;font-weight:700;color:#1a4d8f;margin:0.5rem 0 0;font-family:'JetBrains Mono',monospace;">--:--:--</p>
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
      <h3>Visitas en la Web!</h3>
    </div>
    <div class="content">
      <a href="https://info.flagcounter.com/7pzT">
        <img src="https://s01.flagcounter.com/count/7pzT/bg_FFFFFF/txt_000000/border_CCCCCC/columns_3/maxflags_250/viewers_View/labels_1/pageviews_1/flags_1/percent_0/" alt="Flag Counter" border="0" style="width:100%;max-width:100%;">
      </a>
    </div>
  </div>
</aside>

<!-- Lightbox Última QSL -->
<div class="ult-qsl-lightbox" id="ultQslLightbox">
  <button class="ult-qsl-lightbox-close" id="ultQslLightboxClose" aria-label="Cerrar">×</button>
  <img class="ult-qsl-lightbox-img" id="ultQslLightboxImg" src="" alt="Última QSL">
  <div class="ult-qsl-lightbox-info" id="ultQslLightboxInfo"></div>
</div>
  `,

  footer: `
<!-- Footer -->
<footer class="footer">
  <div class="weather-ticker" id="clima">
    <div class="weather-ticker-label">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19a4.5 4.5 0 0 0 0-9h-1.8A7 7 0 1 0 4 15.5"/></svg>
      Región del Maule
    </div>
    <div class="weather-ticker-wrapper">
      <div class="weather-ticker-content" id="weatherTickerContent">
        <span class="weather-item">Cargando clima de la región...</span>
      </div>
    </div>
  </div>
  <div class="footer-content">
    <div class="footer-section">
      <div class="footer-logo">
        <img src="public/favicon-32x32.png" alt="logo">
        <span>CE4JWI</span>
      </div>
      <p class="footer-description">Estación de radioaficionados activa desde Chile, promoviendo la comunicación y el compañerismo entre operadores de todo el mundo.</p>
    </div>
    
    <div class="footer-section">
      <h4>Contacto</h4>
      <ul class="footer-list">
        <li>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          <a href="mailto:ce4jwi@outlook.com" style="color:white;">ce4jwi@outlook.com</a>
        </li>
        <li>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Región del Maule, Chile
        </li>
        <li>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          Grid: FF44dl
        </li>
      </ul>
    </div>
    
    <div class="footer-section">
      <h4>Enlaces</h4>
      <ul class="footer-list links">
        <li><a href="https://www.qrz.com/db/CE4JWI" target="_blank">QRZ.com</a></li>
        <li><a href="https://www.eqsl.cc" target="_blank">eQSL.cc</a></li>
        <li><a href="https://lotw.arrl.org" target="_blank">LoTW</a></li>
        
      </ul>
    </div>
    
    <div class="footer-section">
      <h4>Sígueme</h4>
      <div class="social-links">
       
        <a href="https://www.instagram.com/ce4jwi/" class="social-btn" aria-label="Instagram">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
        </a>
        <a href="https://wa.me/56982859707" class="social-btn" aria-label="WhatsApp">
          <svg fill="currentColor" viewBox="0 0 360 362"><path fill-rule="evenodd" d="M307.546 52.566C273.709 18.684 228.706.017 180.756 0 81.951 0 1.538 80.404 1.504 179.235c-.017 31.594 8.242 62.432 23.928 89.609L0 361.736l95.024-24.925c26.179 14.285 55.659 21.805 85.655 21.814h.077c98.788 0 179.21-80.413 179.244-179.244.017-47.898-18.608-92.926-52.454-126.807v-.008Zm-126.79 275.788h-.06c-26.73-.008-52.952-7.194-75.831-20.765l-5.44-3.231-56.391 14.791 15.05-54.981-3.542-5.638c-14.912-23.721-22.793-51.139-22.776-79.286.035-82.14 66.867-148.973 149.051-148.973 39.793.017 77.198 15.53 105.328 43.695 28.131 28.157 43.61 65.596 43.593 105.398-.035 82.149-66.867 148.982-148.982 148.982v.008Zm81.719-111.577c-4.478-2.243-26.497-13.073-30.606-14.568-4.108-1.496-7.09-2.243-10.073 2.243-2.982 4.487-11.568 14.577-14.181 17.559-2.613 2.991-5.226 3.361-9.704 1.117-4.477-2.243-18.908-6.97-36.02-22.226-13.313-11.878-22.304-26.54-24.916-31.027-2.613-4.486-.275-6.91 1.959-9.136 2.011-2.011 4.478-5.234 6.721-7.847 2.244-2.613 2.983-4.486 4.478-7.469 1.496-2.991.748-5.603-.369-7.847-1.118-2.243-10.073-24.289-13.812-33.253-3.636-8.732-7.331-7.546-10.073-7.692-2.613-.13-5.595-.155-8.586-.155-2.991 0-7.839 1.118-11.947 5.604-4.108 4.486-15.677 15.324-15.677 37.361s16.047 43.344 18.29 46.335c2.243 2.991 31.585 48.225 76.51 67.632 10.684 4.615 19.029 7.374 25.535 9.437 10.727 3.412 20.49 2.931 28.208 1.779 8.604-1.289 26.498-10.838 30.228-21.298 3.73-10.46 3.73-19.433 2.613-21.298-1.117-1.865-4.108-2.991-8.586-5.234l.008-.017Z" clip-rule="evenodd"/></svg>
        </a>
        <a href="https://t.me/ce4jwi" class="social-btn" aria-label="Telegram">
          <svg viewBox="0 0 256 256" fill="currentColor" preserveAspectRatio="xMidYMid"><path d="M57.94 126.648c37.32-16.256 62.2-26.974 74.64-32.152 35.56-14.786 42.94-17.354 47.76-17.441 1.06-.017 3.42.245 4.96 1.49 1.28 1.05 1.64 2.47 1.82 3.467.16.996.38 3.266.2 5.038-1.92 20.24-10.26 69.356-14.5 92.026-1.78 9.592-5.32 12.808-8.74 13.122-7.44.684-13.08-4.912-20.28-9.63-11.26-7.386-17.62-11.982-28.56-19.188-12.64-8.328-4.44-12.906 2.76-20.386 1.88-1.958 34.64-31.748 35.26-34.45.08-.338.16-1.598-.6-2.262-.74-.666-1.84-.438-2.64-.258-1.14.256-19.12 12.152-54 35.686-5.1 3.508-9.72 5.218-13.88 5.128-4.56-.098-13.36-2.584-19.9-4.708-8-2.606-14.38-3.984-13.82-8.41.28-2.304 3.46-4.662 9.52-7.072Z"/></svg>
        </a>
        <a href="https://x.com/CE4JWI" class="social-btn" aria-label="X">
          <svg fill="currentColor" viewBox="0 0 1200 1227"><path d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"/></svg>
        </a>
      </div>
    </div>
  </div>
  
  <div class="footer-bottom">
    <p>&copy; <span id="footerYear">2025</span> - CE4JWI</p>
    <p class="footer-tagline">73 de CE4JWI - ¡Nos escuchamos en el aire!</p>
  </div>
</footer>
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
 * Traduce un código de clima (WMO) usado por Open-Meteo a icono + descripción en español
 */
function interpretarClima(codigo) {
  const mapa = {
    0: ["☀️", "Despejado"],
    1: ["🌤️", "Poco nublado"],
    2: ["⛅", "Parcialmente nublado"],
    3: ["☁️", "Nublado"],
    45: ["🌫️", "Niebla"],
    48: ["🌫️", "Niebla"],
    51: ["🌦️", "Llovizna"],
    53: ["🌦️", "Llovizna"],
    55: ["🌦️", "Llovizna"],
    61: ["🌧️", "Lluvia débil"],
    63: ["🌧️", "Lluvia"],
    65: ["🌧️", "Lluvia fuerte"],
    71: ["❄️", "Nieve débil"],
    73: ["❄️", "Nieve"],
    75: ["❄️", "Nieve fuerte"],
    80: ["🌦️", "Chubascos"],
    81: ["🌦️", "Chubascos"],
    82: ["🌦️", "Chubascos fuertes"],
    95: ["⛈️", "Tormenta"],
    96: ["⛈️", "Tormenta con granizo"],
    99: ["⛈️", "Tormenta con granizo"],
  }
  const item = mapa[codigo]
  return item ? { icono: item[0], texto: item[1] } : { icono: "🌡️", texto: "—" }
}

/**
 * Carga el clima en vivo (Open-Meteo, sin API key) para las ciudades de
 * la Región del Maule y lo pinta en el ticker del footer. Se refresca
 * automáticamente cada 15 minutos con temperatura y pronóstico reales.
 */
const CIUDADES_MAULE = [
  { nombre: "Curicó", lat: -34.9828, lon: -71.2394 },
  { nombre: "Molina", lat: -35.1167, lon: -71.2833 },
  { nombre: "Talca", lat: -35.4264, lon: -71.6554 },
  { nombre: "Maule", lat: -35.52, lon: -71.68 },
  { nombre: "San Javier", lat: -35.6, lon: -71.7333 },
  { nombre: "Constitución", lat: -35.3333, lon: -72.4167 },
  { nombre: "Cauquenes", lat: -35.967, lon: -72.3106 },
  { nombre: "Parral", lat: -36.1444, lon: -71.8281 },
]

async function cargarClimaMaule() {
  const contenedor = document.getElementById("weatherTickerContent")
  if (!contenedor) return

  try {
    const lats = CIUDADES_MAULE.map((c) => c.lat).join(",")
    const lons = CIUDADES_MAULE.map((c) => c.lon).join(",")
    const url =
      "https://api.open-meteo.com/v1/forecast?" +
      `latitude=${lats}&longitude=${lons}` +
      "&current=temperature_2m,weather_code" +
      "&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=2" +
      "&timezone=America%2FSantiago"

    const respuesta = await fetch(url)
    if (!respuesta.ok) throw new Error("No se pudo obtener el clima")
    const datos = await respuesta.json()
    const lista = Array.isArray(datos) ? datos : [datos]

    const itemsHtml = CIUDADES_MAULE.map((ciudad, i) => {
      const d = lista[i]
      const temp = d && d.current ? Math.round(d.current.temperature_2m) : "--"
      const codigo = d && d.current ? d.current.weather_code : null
      const { icono, texto } = interpretarClima(codigo)

      let pronostico = ""
      if (d && d.daily && d.daily.temperature_2m_max && d.daily.temperature_2m_max[1]) {
        const max = Math.round(d.daily.temperature_2m_max[1])
        const min = Math.round(d.daily.temperature_2m_min[1])
        const codigoFut = d.daily.weather_code[1]
        const futuro = interpretarClima(codigoFut)
        pronostico = `<span class="weather-forecast">Mañana ${min}° / ${max}° ${futuro.icono}</span>`
      }

      return `<span class="weather-item"><span class="weather-city">${ciudad.nombre}</span><span class="weather-temp">${temp}°</span><span>${icono}</span><span>${texto}</span>${pronostico}</span><span class="weather-separator">•</span>`
    }).join("")

    // Se duplica el contenido para que el scroll infinito no deje espacios en blanco
    contenedor.innerHTML = itemsHtml + itemsHtml
  } catch (error) {
    contenedor.innerHTML = '<span class="weather-item">Clima no disponible en este momento, intenta más tarde.</span>'
  }
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

// ---- Widget "Último Contacto" (última QSL generada) -----------------

const ULT_QSL_URL = "https://juank329.github.io/ce4jwi-qsls/log_qsl.json"
const ULT_QSL_URL_QSLNET = "https://qsl.net/ce4jwi/log_qsl.json"
const ULT_QSL_CACHE_KEY = "ce4jwi_qsl_cache_v1"
const ULT_QSL_TTL_MS = 1 * 60 * 1000
const ULT_QSL_REFRESH_MS = 1 * 60 * 1000
let ultQslActual = null
let ultQslTimer = null

function ultQslParsearNombre(nombre) {
  const mFecha = nombre.match(/(\d{2})-(\d{2})-(\d{4})/)
  const mHora = nombre.match(/_(\d{4})_(?=[^_]*\.[a-z]+$)/i)
  const mModo = nombre.match(/_([A-Z0-9]+)\.[a-z]+$/i)
  return {
    fecha: mFecha ? `${mFecha[3]}-${mFecha[2]}-${mFecha[1]}` : "",
    fechaLegible: mFecha ? `${mFecha[1]}/${mFecha[2]}/${mFecha[3]}` : "",
    hora: mHora ? `${mHora[1].slice(0, 2)}:${mHora[1].slice(2, 4)}` : "",
    modo: mModo ? mModo[1] : "",
  }
}

async function ultQslFetch() {
  try {
    const raw = localStorage.getItem(ULT_QSL_CACHE_KEY)
    if (raw) {
      const cached = JSON.parse(raw)
      if (Date.now() - cached.ts < ULT_QSL_TTL_MS && Array.isArray(cached.data)) {
        return cached.data
      }
    }
  } catch { /* ignorar */ }

const ts = Date.now()
  const intentos = [
    { url: `/api/qsl-catalogo?t=${ts}`,                                             nombre: "Catalogo unificado" },
    { url: `${ULT_QSL_URL}?t=${ts}`,                                                nombre: "GitHub Pages" },
    { url: `https://api.allorigins.win/raw?url=${encodeURIComponent(`${ULT_QSL_URL_QSLNET}?t=${ts}`)}`, nombre: "allorigins" },
    { url: `https://corsproxy.io/?url=${encodeURIComponent(`${ULT_QSL_URL_QSLNET}?t=${ts}`)}`,          nombre: "corsproxy.io" },
    { url: `https://r.jina.ai/http://${encodeURIComponent(`${ULT_QSL_URL_QSLNET}?t=${ts}`)}`,           nombre: "jina.ai" },
  ]
  for (const intento of intentos) {
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 10000)
      const r = await fetch(intento.url, { signal: ctrl.signal, cache: "no-store" })
      clearTimeout(t)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      let data = await r.json()
      if (intento.nombre === "Catalogo unificado") data = data.results || []
      try {
        localStorage.setItem(ULT_QSL_CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
      } catch { /* ignorar */ }
      return data
    } catch (e) {
      console.warn(`[ultQsl] ${intento.nombre} falló:`, e.message || e)
    }
  }
  return null
}

function ultQslExpirada(item) {
  const fuente = (item.fuente || "log4om").toLowerCase()
  const duracion = fuente === "aprs" ? 30 * 24 * 60 * 60 * 1000 : 2 * 365 * 24 * 60 * 60 * 1000
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

function ultQslElegir(data) {
  if (!Array.isArray(data)) return null
  const conFecha = data
    .filter((item) => !ultQslExpirada(item))
    .map((item) => {
      const meta = ultQslParsearNombre(item.archivo || "")
      // Preferir los campos directos del JSON (bots y manuales) sobre el parseo del nombre
      let fechaOrden = meta.fecha
      let fechaLegible = meta.fechaLegible
      let hora = meta.hora
      if (item.fecha) {
        const partes = String(item.fecha).split("/")
        if (partes.length === 3) {
          fechaOrden = `${partes[2]}-${partes[1]}-${partes[0]}`
          fechaLegible = `${partes[0]}/${partes[1]}/${partes[2]}`
        } else if (/^\d{4}-\d{2}-\d{2}/.test(item.fecha)) {
          fechaOrden = item.fecha.slice(0, 10)
          const p = item.fecha.split("-")
          fechaLegible = `${p[2]}/${p[1]}/${p[0]}`
        }
      }
      if (item.hora) hora = String(item.hora).replace(/(\d{2}):(\d{2}).*/, "$1:$2")
      return { item, meta: { ...meta, fecha: fechaOrden, fechaLegible, hora } }
    })
    .filter((q) => q.meta.fecha)
    .sort((a, b) => (a.meta.fecha + a.meta.hora).localeCompare(b.meta.fecha + b.meta.hora))
  const ultima = conFecha[conFecha.length - 1]
  return ultima
    ? {
        indicativo: (ultima.item.call || "").toUpperCase().trim(),
        actividad: (ultima.item.carpeta || "").replace(/_/g, " "),
        url: ultima.item.url || "",
        archivo: ultima.item.archivo || "",
        ...ultima.meta,
      }
    : null
}

function ultQslRender(q) {
  const cont = document.getElementById("ultQslWidget")
  if (!cont) return

  if (!q) {
    cont.innerHTML = `<div class="ult-qsl-vacio">Aún no hay QSLs generadas.</div>`
    return
  }

  cont.innerHTML = `
    <div class="ult-qsl-card" id="ultQslCard">
      <div class="ult-qsl-img-wrap">
        <img class="ult-qsl-img" src="${q.url.replace(/"/g, "&quot;")}" alt="QSL ${q.indicativo}"
             onerror="ultQslOcultar(this)">
      </div>
      <div class="ult-qsl-datos">
        <div class="ult-qsl-call">${q.indicativo}</div>
        <div class="ult-qsl-actividad">${q.actividad}</div>
        <div class="ult-qsl-meta">
          ${q.fechaLegible || ""} ${q.hora || ""} · ${q.modo || ""}
        </div>
      </div>
    </div>
    <div class="ult-qsl-hint">Haz clic en la QSL para ampliarla</div>
  `

  const card = document.getElementById("ultQslCard")
  if (card) {
    card.addEventListener("click", () => ultQslAbrirLightbox(q))
  }
}

function ultQslOcultar(img) {
  const wrap = img?.closest(".ult-qsl-img-wrap")
  if (wrap) {
    wrap.innerHTML = `<div class="ult-qsl-vacio">Imagen no disponible</div>`
  }
}

function ultQslAbrirLightbox(q) {
  if (!q) return
  ultQslActual = q
  const img = document.getElementById("ultQslLightboxImg")
  const info = document.getElementById("ultQslLightboxInfo")
  const lb = document.getElementById("ultQslLightbox")
  if (!img || !lb) return
  img.src = q.url
  info.innerHTML = `
    <strong>${q.indicativo}</strong> · ${q.actividad}<br>
    ${q.fechaLegible || ""} ${q.hora || ""} · ${q.modo || ""}`
  lb.classList.add("active")
  document.body.style.overflow = "hidden"
}

function ultQslCerrarLightbox() {
  const lb = document.getElementById("ultQslLightbox")
  if (lb) lb.classList.remove("active")
  document.body.style.overflow = ""
}

function ultQslInit() {
  if (!document.getElementById("ultQslWidget")) return

  const render = async () => {
    const data = await ultQslFetch()
    ultQslRender(ultQslElegir(data))
  }
  render()

  // Cerrar lightbox: botón ×, click fuera o Escape
  document.getElementById("ultQslLightboxClose")?.addEventListener("click", ultQslCerrarLightbox)
  document.getElementById("ultQslLightbox")?.addEventListener("click", (e) => {
    if (e.target === document.getElementById("ultQslLightbox")) ultQslCerrarLightbox()
  })
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") ultQslCerrarLightbox()
  })

  // Refrescar al instante cuando la página QSL actualiza el catálogo,
  // cuando otra pestaña guarda la caché, o al volver a esta pestaña.
  window.addEventListener("qsl:actualizado", render)
  window.addEventListener("storage", (e) => {
    if (e.key === ULT_QSL_CACHE_KEY) render()
  })
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") render()
  })

  // Refresco periódico de respaldo
  clearInterval(ultQslTimer)
  ultQslTimer = setInterval(render, ULT_QSL_REFRESH_MS)
}

// ---- Marquesina "PRÓXIMAS ACTIVIDADES" -----------------------------
const MQ_MESES = {
  Enero: 0, Febrero: 1, Marzo: 2, Abril: 3, Mayo: 4, Junio: 5,
  Julio: 6, Agosto: 7, Septiembre: 8, Octubre: 9, Noviembre: 10, Diciembre: 11,
}

function mqParseFecha(fechaStr) {
  const partes = fechaStr.split(" ")
  const dia = Number.parseInt(partes[0])
  return new Date(Number.parseInt(partes[2]), MQ_MESES[partes[1]], dia)
}

// Fecha de fin: soporta rangos "29-31 Enero 2026" (usa el último día)
function mqFechaFin(actividad) {
  const partes = actividad.date.split(" ")
  const dias = partes[0]
  const diaFin = dias.includes("-") ? Number.parseInt(dias.split("-")[1]) : Number.parseInt(dias)
  return new Date(Number.parseInt(partes[2]), MQ_MESES[partes[1]], diaFin)
}

// Estado efectivo según la fecha (misma lógica que la portada):
// - la fecha de fin ya pasó  -> FINALIZADO
// - hoy cae dentro del rango -> ACTIVO
// - todavía no llega el día  -> estado guardado (PRÓXIMAMENTE)
function mqEstadoEfectivo(actividad) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
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

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  // Próximas (fecha de inicio en el futuro o de hoy en adelante)
  const proximas = ACTIVIDADES
    .filter((a) => mqEstadoEfectivo(a) === "PRÓXIMAMENTE")
    .filter((a) => !a.showAfter || hoy >= new Date(a.showAfter + "T00:00:00"))
    .sort((a, b) => mqParseFecha(a.date) - mqParseFecha(b.date))

  let seleccion
  if (proximas.length > 0) {
    seleccion = proximas
  } else {
    // Últimas 3 finalizadas (por fecha de inicio descendente)
    seleccion = ACTIVIDADES
      .filter((a) => mqEstadoEfectivo(a) === "FINALIZADO")
      .sort((a, b) => mqParseFecha(b.date) - mqParseFecha(a.date))
      .slice(0, 3)
  }

  if (seleccion.length === 0) {
    contenedor.innerHTML = '<span class="marquee-item">Próximamente más actividades.</span>'
    return
  }

  const itemsHtml = seleccion
    .map((actividad) => {
      const esProxima = mqEstadoEfectivo(actividad) === "PRÓXIMAMENTE"
      const badge = esProxima
        ? '<span class="marquee-badge upcoming">PRÓXIMAMENTE</span>'
        : '<span class="marquee-badge not">FINALIZADA</span>'
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

  // Widget "Último Contacto" (última QSL generada)
  ultQslInit()

  // Cargar el clima en vivo de la Región del Maule en el footer
  cargarClimaMaule()
  // Actualizar el clima automáticamente cada 15 minutos
  setInterval(cargarClimaMaule, 15 * 60 * 1000)
}

// Ejecutar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", inicializarComponentes)
