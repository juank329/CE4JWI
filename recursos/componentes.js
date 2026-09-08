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
      <div class="nav-dropdown" id="navDropdownHerramientas">
        <button type="button" class="nav-link nav-dropdown-toggle" aria-haspopup="true" aria-expanded="false" aria-label="Herramientas">
          Herramientas
        </button>
        <div class="nav-dropdown-menu">
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
          <a href="herramienta-mapa-radio.html" class="nav-link" data-page="mapa-radio">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14"/><path d="M15 6v14"/></svg>
            Mapa de Radioaficionados
          </a>
        </div>
      </div>
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
  



  <!-- Widget: Top Indicativos (todas las actividades) -->
  <div class="widget">
    <div class="widget-header">
      <svg class="widget-icon green" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 21h8"/>
        <path d="M12 17v4"/>
        <path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/>
        <path d="M17 9a3 3 0 0 1 0 6"/>
        <path d="M7 9a3 3 0 0 0 0 6"/>
      </svg>
      <h3>Top Indicativos</h3>
    </div>
    <div class="content">
      <p style="margin:0 0 .3rem;font-size:.72rem;color:#666;">Contactos sumados de todas las actividades</p>
      <ol id="rankingGeneralList" style="margin:0;padding:0;list-style:none;">
        <li style="color:#888;font-size:.8rem;padding:.15rem 0;">Cargando ranking…</li>
      </ol>
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

  // Próximas (fecha de inicio en el futuro o de hoy en adelante).
  // Regla dinámica: se ocultan las futuras hasta 1 semana (7 días) antes de su
  // fecha, para no quitarle protagonismo a la actividad en curso. Las pasadas
  // y las que están a <= 7 días de su fecha siempre se muestran.
  const fechaHoy = new Date()
  fechaHoy.setHours(0, 0, 0, 0)
  const limiteSemana = new Date(fechaHoy)
  limiteSemana.setDate(limiteSemana.getDate() + 7)
  const proximas = ACTIVIDADES
    .filter((a) => mqEstadoEfectivo(a) === "PRÓXIMAMENTE")
    .filter((a) => {
      const ini = mqParseFecha(a.date)
      if (ini > fechaHoy && ini > limiteSemana) return false
      return true
    })
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
 * Widget "Top Indicativos": ranking general sumando todas las actividades.
 * Pinta el top 10 en la barra lateral y agrega la bandera de cada call
 * usando la API de RadioID.net (para el pais) y flagcdn (bandera PNG).
 */
function cargarRankingGeneral() {
  const cont = document.getElementById("rankingGeneralList");
  if (!cont) return;

  // Pais (nombre) -> ISO alpha-2 usando la API de RadioID.net cuando el call
  // esta registrado (base DMR). Respaldo: derivar el ISO desde el prefijo.
  const PAISES_ISO = {
    "chile":"CL","argentina":"AR","argentina republic":"AR","uruguay":"UY","bolivia":"BO","brasil":"BR","brazil":"BR",
    "peru":"PE","paraguay":"PY","ecuador":"EC","colombia":"CO","venezuela":"VE","panama":"PA",
    "españa":"ES","espana":"ES","spain":"ES","portugal":"PT","italy":"IT","italia":"IT",
    "france":"FR","francia":"FR","germany":"DE","alemania":"DE","england":"GB","united kingdom":"GB",
    "netherlands":"NL","belgium":"BE","switzerland":"CH","austria":"AT","poland":"PL","ukraine":"UA",
    "russia":"RU","sweden":"SE","norway":"NO","denmark":"DK","finland":"FI","greece":"GR","hungary":"HU",
    "usa":"US","united states":"US","estados unidos":"US","canada":"CA","canada:":"CA","mexico":"MX",
    "méxico":"MX","cuba":"CU","puerto rico":"PR","dominican republic":"DO","costa rica":"CR",
    "guatemala":"GT","honduras":"HN","el salvador":"SV","nicaragua":"NI","jamaica":"JM",
    "australia":"AU","new zealand":"NZ","japan":"JP","china":"CN","south korea":"KR","korea":"KR",
    "india":"IN","indonesia":"ID","malaysia":"MY","philippines":"PH","filipinas":"PH",
    "thailand":"TH","vietnam":"VN","singapore":"SG","south africa":"ZA","sudafrica":"ZA",
    "egypt":"EG","morocco":"MA","algiers":"DZ","algeria":"DZ","turkey":"TR","israel":"IL",
    "ireland":"IE","iceland":"IS","czech republic":"CZ","czechia":"CZ","slovakia":"SK","croatia":"HR",
    "romania":"RO","bulgaria":"BG","serbia":"RS","slovenia":"SI","lithuania":"LT","latvia":"LV",
    "estonia":"EE","belarus":"BY","kazakhstan":"KZ","mongolia":"MN","pakistan":"PK",
    "sri lanka":"LK","nepal":"NP","bangladesh":"BD","fiji":"FJ","greenland":"GL"
  };

  // Prefijo de indicativo (2-3 letras iniciales) -> ISO alpha-2
  function isoPorPrefijo(call) {
    const p = call.slice(0, 2);
    const prefs = {
      "CE":"CL","CA":"CL","CB":"CL","CC":"CL","CD":"CL","CF":"CL","CG":"CL","CH":"CL","CI":"CL","CJ":"CL","CK":"CL","CL":"CL","CM":"CL","CN":"CL","CO":"CL","CP":"CL","CQ":"CL","CR":"CL","CS":"CL","CT":"CL","CU":"CL","CV":"CL","CW":"CL","CY":"CL",
      "CX":"UY","LU":"AR","LQ":"AR","LT":"AR","LW":"AR","LY":"AR","LZ":"AR","7L":"AR","7T":"AR","8B":"AR","A6":"AR",
      "PY":"BR","PP":"BR","PQ":"BR","PR":"BR","PS":"BR","PT":"BR","PV":"BR","PW":"BR","PX":"BR","PZ":"BR","ZW":"BR","ZY":"BR","8B":"BR","AD":"BR",
      "CP":"BO","5C":"MA","CX":"UY","4F":"PH","4I":"PH","DV":"PH","DU":"PH",
      "EA":"ES","EB":"ES","EC":"ES","ED":"ES","EE":"ES","EF":"ES","EG":"ES","EH":"ES","EI":"IR","EJ":"IE","EK":"AM","EL":"LR","EM":"UA","EN":"UA","EO":"UA","EP":"IR","ER":"MD","ES":"EE","ET":"ET","EU":"BY",
      "W":"US","K":"US","N":"US","A":"US","AA":"US","AC":"US","AK":"US","AL":"US","KA":"US","KB":"US","KC":"US","KD":"US","KE":"US","KF":"US","KG":"US","KH":"US","KI":"US","KJ":"US","KK":"US","KL":"US","KM":"US","KN":"US","KO":"US","KP":"US","KQ":"US","KR":"US","KS":"US","KT":"US","KU":"US","KV":"US","KW":"US","KX":"US","KY":"US","KZ":"US","WA":"US","WB":"US","WC":"US","WD":"US","WE":"US","WF":"US","WG":"US","WH":"US","WI":"US","WJ":"US","WK":"US","WL":"US","WM":"US","WN":"US","WO":"US","WP":"US","WQ":"US","WR":"US","WS":"US","WT":"US","WU":"US","WV":"US","WW":"US","WX":"US","WY":"US","WZ":"US","NP":"US","NQ":"US","NR":"US","NS":"US","NT":"US","NU":"US","NV":"US","NW":"US","NX":"US","NY":"US","NZ":"US",
      "VE":"CA","VA":"CA","VB":"CA","VC":"CA","VD":"CA","VY":"CA","VO":"CA","VX":"CA","VY":"CA","VY":"CA","C6":"BS","C9":"MZ","C7":"MV",
      "XE":"MX","XD":"MX","XF":"MX","XG":"MX","XH":"MX","XI":"MX","XJ":"MX","XL":"MX","XM":"MX","XN":"MX","XP":"MX","XQ":"MX","XR":"MX","XS":"MX","XT":"MX","XU":"MX","XV":"MX","XW":"MX","XX":"MX","XY":"MX","XZ":"MX","4A":"MX","6D":"MX",
      "YV":"VE","YY":"VE","4M":"VE","HF":"PL","HP":"PA","HO":"PA","HR":"HN","HT":"NI","HU":"SV","TI":"CR","TE":"CR","TG":"GT","TN":"CG","TT":"TD","TU":"CI","TY":"BJ","TZ":"ML","T7":"SM","T9":"BA",
      "YB":"ID","YC":"ID","YD":"ID","YE":"ID","YF":"ID","YG":"ID","YH":"ID","YI":"IQ","YJ":"VU","YK":"SY","YL":"LV","YM":"TR","YN":"NI","YO":"RO","YP":"AL","YQ":"DO","YR":"RO","YS":"SV","YT":"AL","YU":"RS","YV":"VE","YW":"VE","YX":"VE","YY":"VE","YZ":"RS","7A":"ID","8A":"ID","9A":"HR","9K":"KW","9M":"MY","9N":"NP","9V":"SG","9W":"MY","9X":"RW","9Y":"TT","9Z":"TT",
      "DL":"DE","DK":"DE","DA":"DE","DB":"DE","DC":"DE","DF":"DE","DH":"DE","DJ":"DE","DM":"DE","DN":"DE","DO":"DE","DP":"DE","DQ":"DE","DR":"DE","DS":"DE","DT":"DE","DV":"DE","DX":"PH","DZ":"PH",
      "F":"FR","G":"GB","M":"GB","GW":"GB","GD":"GB","GI":"GB","GM":"GB","GU":"GB","2E":"GB","2M":"GB","2W":"GB",
      "I":"IT","IK":"IT","IU":"IT","IZ":"IT","IN":"IT","IP":"IT","IS":"IT","ISM":"IT",
      "JA":"JP","JH":"JP","JI":"JP","JJ":"JP","JK":"JP","JL":"JP","JM":"JP","JN":"JP","JO":"JP","JP":"JP","JQ":"JP","JR":"JP","JS":"JP","JT":"MN","JY":"JO",
      "PA":"NL","PB":"NL","PC":"NL","PD":"NL","PE":"NL","PF":"NL","PG":"NL","PH":"NL","PI":"NL","PJ":"NL","PK":"NL","PL":"NL","PZ":"BR",
      "OH":"FI","OJ":"FI","OG":"FI","OF":"FI","TA":"TR","TC":"TR","TB":"TR","TM":"TR",
      "UA":"RU","UB":"UA","UC":"BY","UD":"AZ","UE":"RU","UF":"RU","UG":"GE","UH":"RU","UI":"RU","UJ":"UZ","UK":"UZ","UL":"KZ","UM":"BY","UN":"KZ","UO":"RU","UP":"KZ","UQ":"BY","UR":"UA","US":"UA","UT":"UA","UU":"UA","UV":"UA","UW":"UA","UX":"UA","UY":"UA","UZ":"UA",
      "VK":"AU","VI":"AU","VH":"AU","VJ":"AU","VM":"AU","VK":"AU","VZ":"AU","AX":"AU","X":"AU",
      "ZL":"NZ","ZM":"NZ","ZK":"NZ","ZP":"PY","ZS":"ZA","ZR":"ZA","ZU":"ZA","ZV":"ZA","ZW":"ZA","ZX":"ZA","ZY":"BR","Z3":"MK","Z6":"XK",
      "4X":"IL","4Z":"IL","5B":"CY","5H":"TZ","5N":"NG","5R":"MG","5T":"MR","5U":"NE","5V":"TG","5W":"WS","5X":"UG","5Z":"KE","6M":"HK","6Y":"JM","7P":"LS","7Q":"MW","7X":"DZ","8P":"BB","8R":"GY","8S":"SE","8Z":"SA","9J":"ZM","9O":"CD",
      "E5":"CK","E7":"BA","EX":"KG","EY":"TJ","EZ":"TM","FJ":"GF","FM":"MQ","FG":"GP","FH":"YT","FK":"NC","FO":"PF","FP":"PM","FR":"RE","FS":"PM","FT":"TF"
    };
    const c = prefs[p];
    if (c) return c;
    const p3 = call.slice(0, 3);
    if (/^[A-Z]{1}\d/.test(call)) return "US"; // AH, K1, N5, W1...
    if (/^9[0-49]/.test(call)) return "MY";
    if (/^7[0-9]/.test(call)) return "JP";
    if (/^8[0-9]/.test(call)) return "JP";
    return "";
  }

  function ccDePais(nombre) {
    const n = (nombre || "").toLowerCase().trim().replace(/\s+/g, " ");
    return PAISES_ISO[n] || PAISES_ISO[n.replace(/-/g, " ")] || "";
  }

  function ponerBandera(call, cc) {
    const celda = document.getElementById("band-" + call);
    if (!celda || !/^[A-Z]{2}$/.test(cc || "")) return;
    celda.innerHTML = '<img src="https://flagcdn.com/w40/' + cc.toLowerCase() + '.png" alt="' + cc + '" width="22" height="15" style="border:1px solid #ddd;border-radius:2px;display:block;">';
  }

  function cargarBandera(call) {
    const ck = "bco_iso_" + call;
    try {
      const cache = localStorage.getItem(ck);
      if (cache !== null) { ponerBandera(call, cache); return; }
    } catch (e) { /* sin localStorage */ }
    fetch("https://radioid.net/api/users?callsign=" + encodeURIComponent(call) + "&callsign_sel==")
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (j) {
        let cc = "";
        if (j && Array.isArray(j.results) && j.results.length && j.results[0] && j.results[0].country) {
          cc = ccDePais(j.results[0].country);
        }
        if (!cc) cc = isoPorPrefijo(call);
        try { localStorage.setItem(ck, cc); } catch (e) {}
        ponerBandera(call, cc);
      })
      .catch(function () {
        const cc = isoPorPrefijo(call);
        try { localStorage.setItem(ck, cc); } catch (e) {}
        ponerBandera(call, cc);
      });
  }

  fetch("/api/ranking-general")
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (d) {
      if (!d || !d.ok || !Array.isArray(d.top)) throw new Error("formato invalido");
      const filas = d.top.slice(0, 10);
      cont.innerHTML = filas.map(function (f, i) {
        return '<li style="display:flex;align-items:center;gap:6px;padding:.25rem 0;border-bottom:1px solid #f0f0f0;">'
          + '<span id="band-' + f.call + '" style="display:inline-block;width:22px;height:15px;vertical-align:-2px;flex:0 0 22px;border:1px solid #ddd;border-radius:2px;background:#f7f7f7;"></span>'
          + '<a href="https://www.qrz.com/db/' + f.call + '" target="_blank" rel="noopener" style="flex:1;font-family:JetBrains Mono,monospace;font-weight:700;color:#1a4d8f;font-size:.78rem;text-decoration:none;">' + f.call + '</a>'
          + '<span style="font-weight:700;color:#16a34a;font-size:.8rem;">' + f.puntos + '</span>'
          + '</li>';
      }).join("") || '<li style="color:#888;font-size:.8rem;">Sin datos todavia.</li>';
      filas.forEach(function (f) { cargarBandera(f.call); });
    })
    .catch(function (e) {
      cont.innerHTML = '<li style="color:#a00;font-size:.8rem;">Ranking no disponible.</li>';
    });
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

  // Widget "Top Indicativos" de la barra lateral
  cargarRankingGeneral()

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


  // Cargar el clima en vivo de la Región del Maule en el footer
  cargarClimaMaule()
  // Actualizar el clima automáticamente cada 15 minutos
  setInterval(cargarClimaMaule, 15 * 60 * 1000)
}

// Ejecutar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", inicializarComponentes)
