/**
 * Sistema de componentes reutilizables
 * Los componentes se definen como strings y se inyectan directamente (funciona sin servidor)
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
    <!--  <a href="novedades.html" class="nav-link" data-page="novedades"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><g transform="scale(1.33333)"><path d="M7.25,16.25l2-7H4.466c-.348,0-.589-.346-.469-.672L6.38,2.078c.072-.197,.26-.328,.469-.328h4.17c.352,0,.593,.353,.466,.681l-1.485,3.819h3.75c.412,0,.647,.47,.4,.8l-6.9,9.2Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path></g></svg> NOVEDADES</a>-->
      <a href="calendario.html" class="nav-link" data-page="calendario"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M17 14C17.5523 14 18 13.5523 18 13C18 12.4477 17.5523 12 17 12C16.4477 12 16 12.4477 16 13C16 13.5523 16.4477 14 17 14Z" fill="currentColor"/><path d="M17 18C17.5523 18 18 17.5523 18 17C18 16.4477 17.5523 16 17 16C16.4477 16 16 16.4477 16 17C16 17.5523 16.4477 18 17 18Z" fill="currentColor"/><path d="M13 13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13C11 12.4477 11.4477 12 12 12C12.5523 12 13 12.4477 13 13Z" fill="currentColor"/><path d="M13 17C13 17.5523 12.5523 18 12 18C11.4477 18 11 17.5523 11 17C11 16.4477 11.4477 16 12 16C12.5523 16 13 16.4477 13 17Z" fill="currentColor"/><path d="M7 14C7.55229 14 8 13.5523 8 13C8 12.4477 7.55229 12 7 12C6.44772 12 6 12.4477 6 13C6 13.5523 6.44772 14 7 14Z" fill="currentColor"/><path d="M7 18C7.55229 18 8 17.5523 8 17C8 16.4477 7.55229 16 7 16C6.44772 16 6 16.4477 6 17C6 17.5523 6.44772 18 7 18Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7 1.75C7.41421 1.75 7.75 2.08579 7.75 2.5V3.26272C8.412 3.24999 9.14133 3.24999 9.94346 3.25H14.0564C14.8586 3.24999 15.588 3.24999 16.25 3.26272V2.5C16.25 2.08579 16.5858 1.75 17 1.75C17.4142 1.75 17.75 2.08579 17.75 2.5V3.32709C18.0099 3.34691 18.2561 3.37182 18.489 3.40313C19.6614 3.56076 20.6104 3.89288 21.3588 4.64124C22.1071 5.38961 22.4392 6.33855 22.5969 7.51098C22.75 8.65018 22.75 10.1058 22.75 11.9435V14.0564C22.75 15.8941 22.75 17.3498 22.5969 18.489C22.4392 19.6614 22.1071 20.6104 21.3588 21.3588C20.6104 22.1071 19.6614 22.4392 18.489 22.5969C17.3498 22.75 15.8942 22.75 14.0565 22.75H9.94359C8.10585 22.75 6.65018 22.75 5.51098 22.5969C4.33856 22.4392 3.38961 22.1071 2.64124 21.3588C1.89288 20.6104 1.56076 19.6614 1.40314 18.489C1.24997 17.3498 1.24998 15.8942 1.25 14.0564V11.9436C1.24998 10.1058 1.24997 8.65019 1.40314 7.51098C1.56076 6.33855 1.89288 5.38961 2.64124 4.64124C3.38961 3.89288 4.33856 3.56076 5.51098 3.40313C5.7439 3.37182 5.99006 3.34691 6.25 3.32709V2.5C6.25 2.08579 6.58579 1.75 7 1.75ZM5.71085 4.88976C4.70476 5.02502 4.12511 5.27869 3.7019 5.7019C3.27869 6.12511 3.02502 6.70476 2.88976 7.71085C2.86685 7.88123 2.8477 8.06061 2.83168 8.25H21.1683C21.1523 8.06061 21.1331 7.88124 21.1102 7.71085C20.975 6.70476 20.7213 6.12511 20.2981 5.7019C19.8749 5.27869 19.2952 5.02502 18.2892 4.88976C17.2615 4.75159 15.9068 4.75 14 4.75H10C8.09318 4.75 6.73851 4.75159 5.71085 4.88976ZM2.75 12C2.75 11.146 2.75032 10.4027 2.76309 9.75H21.2369C21.2497 10.4027 21.25 11.146 21.25 12V14C21.25 15.9068 21.2484 17.2615 21.1102 18.2892C20.975 19.2952 20.7213 19.8749 20.2981 20.2981C19.8749 20.7213 19.2952 20.975 18.2892 21.1102C17.2615 21.2484 15.9068 21.25 14 21.25H10C8.09318 21.25 6.73851 21.2484 5.71085 21.1102C4.70476 20.975 4.12511 20.7213 3.7019 20.2981C3.27869 19.8749 3.02502 19.2952 2.88976 18.2892C2.75159 17.2615 2.75 15.9068 2.75 14V12Z" fill="currentColor"/></svg> CALENDARIO</a>
    <!--  <a href="log.html" class="nav-link" data-page="log"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.94513 1.25H15.0549C16.4225 1.24998 17.5248 1.24996 18.3918 1.36652C19.2919 1.48754 20.0497 1.74643 20.6517 2.34835C21.2536 2.95027 21.5125 3.70814 21.6335 4.60825C21.75 5.47522 21.75 6.57754 21.75 7.94513V16.0549C21.75 17.4225 21.75 18.5248 21.6335 19.3918C21.5125 20.2919 21.2536 21.0497 20.6517 21.6517C20.0497 22.2536 19.2919 22.5125 18.3918 22.6335C17.5248 22.75 16.4225 22.75 15.0549 22.75H8.94513C8.63162 22.75 8.33204 22.75 8.04605 22.7486C8.03082 22.7495 8.01546 22.75 8 22.75C7.98169 22.75 7.96353 22.7493 7.94555 22.7481C7.02806 22.7424 6.25306 22.7202 5.60825 22.6335C4.70814 22.5125 3.95027 22.2536 3.34835 21.6517C2.74643 21.0497 2.48754 20.2919 2.36652 19.3918C2.2704 18.6768 2.25356 17.8018 2.25062 16.75H2C1.58579 16.75 1.25 16.4142 1.25 16C1.25 15.5858 1.58579 15.25 2 15.25H2.25V12.75H2C1.58579 12.75 1.25 12.4142 1.25 12C1.25 11.5858 1.58579 11.25 2 11.25H2.25V8.75H2C1.58579 8.75 1.25 8.41421 1.25 8C1.25 7.58579 1.58579 7.25 2 7.25H2.25062C2.25356 6.19818 2.2704 5.32319 2.36652 4.60825C2.48754 3.70814 2.74643 2.95027 3.34835 2.34835C3.95027 1.74643 4.70814 1.48754 5.60825 1.36652C6.47522 1.24996 7.57754 1.24998 8.94513 1.25ZM3.75 8.75H4C4.41421 8.75 4.75 8.41421 4.75 8C4.75 7.58579 4.41421 7.25 4 7.25H3.75078C3.75398 6.2042 3.77029 5.42437 3.85315 4.80812C3.9518 4.07435 4.13225 3.68577 4.40901 3.40901C4.68577 3.13225 5.07434 2.9518 5.80812 2.85315C6.2098 2.79914 6.68097 2.77341 7.25 2.76115V21.2389C6.68097 21.2266 6.2098 21.2009 5.80812 21.1469C5.07434 21.0482 4.68577 20.8678 4.40901 20.591C4.13225 20.3142 3.9518 19.9257 3.85315 19.1919C3.77029 18.5756 3.75398 17.7958 3.75078 16.75H4C4.41421 16.75 4.75 16.4142 4.75 16C4.75 15.5858 4.41421 15.25 4 15.25H3.75V12.75H4C4.41421 12.75 4.75 12.4142 4.75 12C4.75 11.5858 4.41421 11.25 4 11.25H3.75V8.75ZM8.75 21.25C8.83184 21.25 8.91516 21.25 9 21.25H15C16.4354 21.25 17.4365 21.2484 18.1919 21.1469C18.9257 21.0482 19.3142 20.8678 19.591 20.591C19.8678 20.3142 20.0482 19.9257 20.1469 19.1919C20.2484 18.4365 20.25 17.4354 20.25 16V8C20.25 6.56458 20.2484 5.56347 20.1469 4.80812C20.0482 4.07435 19.8678 3.68577 19.591 3.40901C19.3142 3.13225 18.9257 2.9518 18.1919 2.85315C17.4365 2.75159 16.4354 2.75 15 2.75H9C8.91516 2.75 8.83184 2.75001 8.75 2.75004V21.25ZM10.75 6.5C10.75 6.08579 11.0858 5.75 11.5 5.75H16.5C16.9142 5.75 17.25 6.08579 17.25 6.5C17.25 6.91421 16.9142 7.25 16.5 7.25H11.5C11.0858 7.25 10.75 6.91421 10.75 6.5ZM10.75 10C10.75 9.58579 11.0858 9.25 11.5 9.25H16.5C16.9142 9.25 17.25 9.58579 17.25 10C17.25 10.4142 16.9142 10.75 16.5 10.75H11.5C11.0858 10.75 10.75 10.4142 10.75 10Z" fill="currentColor"/></svg> LOG EN TIEMPO REAL</a>-->
    <!--  <a href="QSO_logger.html" class="nav-link" data-page="qso_logger"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.56216 2.87174C6.14861 2.41455 6.82355 2.25 7.5 2.25H16.5C17.1765 2.25 17.8514 2.41455 18.4378 2.87174C19.0172 3.32344 19.4352 4.0024 19.7154 4.89243L19.7225 4.91513L22.2604 15.2159C22.5738 15.8383 22.75 16.5463 22.75 17.2941C22.75 19.7141 20.887 21.75 18.5 21.75H5.5C3.11298 21.75 1.25 19.7141 1.25 17.2941C1.25 16.5463 1.42621 15.8383 1.73961 15.2159L4.27747 4.91513L4.28461 4.89243C4.56481 4.0024 4.98276 3.32344 5.56216 2.87174ZM3.77626 13.2197C4.30106 12.9752 4.88373 12.8382 5.5 12.8382H18.5C19.1163 12.8382 19.6989 12.9752 20.2237 13.2197L18.2777 5.32094C18.0589 4.63669 17.7822 4.26258 17.5156 4.05473C17.2532 3.85015 16.9281 3.75 16.5 3.75H7.5C7.07188 3.75 6.74682 3.85015 6.48441 4.05473C6.21779 4.26258 5.94107 4.63669 5.72234 5.32094L3.77626 13.2197ZM5.5 14.3382C4.49271 14.3382 3.59139 14.9242 3.10912 15.8329C2.88147 16.2618 2.75 16.7597 2.75 17.2941C2.75 18.9676 4.02103 20.25 5.5 20.25H18.5C19.979 20.25 21.25 18.9676 21.25 17.2941C21.25 16.7597 21.1185 16.2618 20.8909 15.8329C20.4086 14.9242 19.5073 14.3382 18.5 14.3382H5.5ZM10.5 16.25C10.9142 16.25 11.25 16.5858 11.25 17V18C11.25 18.4142 10.9142 18.75 10.5 18.75C10.0858 18.75 9.75 18.4142 9.75 18V17C9.75 16.5858 10.0858 16.25 10.5 16.25ZM13 16.25C13.4142 16.25 13.75 16.5858 13.75 17V18C13.75 18.4142 13.4142 18.75 13 18.75C12.5858 18.75 12.25 18.4142 12.25 18V17C12.25 16.5858 12.5858 16.25 13 16.25ZM15.5 16.25C15.9142 16.25 16.25 16.5858 16.25 17V18C16.25 18.4142 15.9142 18.75 15.5 18.75C15.0858 18.75 14.75 18.4142 14.75 18V17C14.75 16.5858 15.0858 16.25 15.5 16.25ZM18 16.25C18.4142 16.25 18.75 16.5858 18.75 17V18C18.75 18.4142 18.4142 18.75 18 18.75C17.5858 18.75 17.25 18.4142 17.25 18V17C17.25 16.5858 17.5858 16.25 18 16.25Z" fill="currentColor"/></svg> CREADOR DE ADIF</a>-->
      <a href="qsls.html" class="nav-link" data-page="descarga"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V8.18934L14.4697 6.46967C14.7626 6.17678 15.2374 6.17678 15.5303 6.46967C15.8232 6.76256 15.8232 7.23744 15.5303 7.53033L12.5303 10.5303C12.2374 10.8232 11.7626 10.8232 11.4697 10.5303L8.46967 7.53033C8.17678 7.23744 8.17678 6.76256 8.46967 6.46967C8.76256 6.17678 9.23744 6.17678 9.53033 6.46967L11.25 8.18934V2C11.25 1.58579 11.5858 1.25 12 1.25ZM16.2536 2.05354C16.2941 1.64131 16.6612 1.34001 17.0734 1.38056C18.7643 1.54688 20.0677 1.93602 21.0659 2.93422C21.9607 3.82903 22.366 4.96906 22.5603 6.41379C22.75 7.82528 22.75 9.63432 22.75 11.9427V12.0575C22.75 12.3718 22.75 12.677 22.7495 12.9731C22.7498 12.982 22.75 12.991 22.75 13C22.75 13.0099 22.7498 13.0197 22.7494 13.0295C22.746 14.8816 22.7225 16.3794 22.5603 17.5864C22.366 19.0311 21.9607 20.1711 21.0659 21.066C20.1711 21.9608 19.031 22.3661 17.5863 22.5603C16.1748 22.7501 14.3658 22.7501 12.0574 22.7501H11.9426C9.63423 22.7501 7.82519 22.7501 6.41371 22.5603C4.96897 22.3661 3.82895 21.9608 2.93414 21.066C2.03933 20.1711 1.63399 19.0311 1.43975 17.5864C1.27747 16.3794 1.25397 14.8816 1.25057 13.0295C1.25019 13.0197 1.25 13.0099 1.25 13C1.25 12.991 1.25016 12.982 1.25047 12.9731C1.25 12.677 1.25 12.3718 1.25 12.0575V11.9427C1.24999 9.63432 1.24998 7.82528 1.43975 6.41379C1.63399 4.96906 2.03933 3.82903 2.93414 2.93422C3.93234 1.93602 5.23569 1.54688 6.92658 1.38056C7.33881 1.34001 7.70585 1.64131 7.7464 2.05354C7.78695 2.46576 7.48564 2.8328 7.07342 2.87335C5.51402 3.02674 4.62954 3.36014 3.9948 3.99488C3.42514 4.56454 3.09825 5.33526 2.92637 6.61366C2.75159 7.91364 2.75 9.62186 2.75 12.0001C2.75 12.0842 2.75 12.1675 2.75001 12.25H5.16026C5.20556 12.25 5.25031 12.25 5.29454 12.2499C6.06705 12.2491 6.67886 12.2485 7.22924 12.5016C7.77961 12.7547 8.17729 13.2197 8.67941 13.8067C8.70816 13.8403 8.73725 13.8743 8.76673 13.9087L9.37216 14.6151C10.0059 15.3544 10.1838 15.5373 10.3975 15.6356C10.6113 15.734 10.8659 15.75 11.8397 15.75H12.1603C13.1341 15.75 13.3887 15.734 13.6025 15.6356C13.8162 15.5373 13.9941 15.3544 14.6278 14.6151L15.2333 13.9087C15.2628 13.8743 15.2918 13.8403 15.3206 13.8067C15.8227 13.2197 16.2204 12.7547 16.7708 12.5016C17.3211 12.2485 17.933 12.2491 18.7055 12.2499C18.7497 12.25 18.7944 12.25 18.8397 12.25H21.25C21.25 12.1675 21.25 12.0842 21.25 12.0001C21.25 9.62186 21.2484 7.91364 21.0736 6.61366C20.9018 5.33526 20.5749 4.56454 20.0052 3.99488C19.3705 3.36014 18.486 3.02674 16.9266 2.87335C16.5144 2.8328 16.2131 2.46576 16.2536 2.05354ZM21.2465 13.75H18.8397C17.8659 13.75 17.6113 13.766 17.3975 13.8644C17.1838 13.9627 17.0059 14.1456 16.3722 14.8849L15.7667 15.5913C15.7372 15.6257 15.7082 15.6597 15.6794 15.6933C15.1773 16.2803 14.7796 16.7453 14.2292 16.9984C13.6789 17.2515 13.067 17.2509 12.2945 17.2501C12.2503 17.25 12.2056 17.25 12.1603 17.25H11.8397C11.7944 17.25 11.7497 17.25 11.7055 17.2501C10.933 17.2509 10.3211 17.2515 9.77076 16.9984C9.22039 16.7453 8.82271 16.2803 8.32059 15.6933C8.29184 15.6597 8.26275 15.6257 8.23327 15.5913L7.62784 14.8849C6.9941 14.1456 6.81622 13.9627 6.60245 13.8644C6.38869 13.766 6.13407 13.75 5.16026 13.75H2.7535C2.76294 15.2527 2.79778 16.4301 2.92637 17.3865C3.09825 18.6649 3.42514 19.4356 3.9948 20.0053C4.56445 20.5749 5.33517 20.9018 6.61358 21.0737C7.91356 21.2485 9.62177 21.2501 12 21.2501C14.3782 21.2501 16.0864 21.2485 17.3864 21.0737C18.6648 20.9018 19.4355 20.5749 20.0052 20.0053C20.5749 19.4356 20.9018 18.6649 21.0736 17.3865C21.2022 16.4301 21.2371 15.2527 21.2465 13.75Z" fill="currentColor"/></svg> DESCARGA DE QSLs</a>

      <div class="nav-dropdown" id="navDropdownHerramientas">
        <button type="button" class="nav-link nav-dropdown-toggle" aria-haspopup="true" aria-expanded="false">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          HERRAMIENTAS
          <svg class="nav-dropdown-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="nav-dropdown-menu">
          <a href="herramienta-fonetico.html" class="nav-link" data-page="fonetico">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12a8 8 0 1 1 8 8"/><path d="M4 12v6"/><path d="M4 12l3-3M4 12l3 3"/></svg>
            Código Fonético y Morse
          </a>
          <a href="log.html" class="nav-link" data-page="log">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="3"/></svg>
            Log en Tiempo Real
          </a>
          <a href="QSO_logger.html" class="nav-link" data-page="qsologger">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 4v5"/></svg>
            QSO Logger (Creador ADIF)
          </a>
          <a href="herramienta-indicativos.html" class="nav-link" data-page="indicativos">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/><path d="M8 11h6"/></svg>
            Buscar Indicativos (SUBTEL)
          </a>
        </div>
      </div>
    </nav>
  </div>
</header>
  `,

  marquee: `
<!-- Marquesina de Novedades -->
<div class="marquee-container">
  <div class="marquee-label">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    NOVEDADES
  </div>
  <div class="marquee-wrapper">
    <div class="marquee-content" id="marqueeContent">
      <span class="marquee-item">
       <span class="marquee-badge new">NUEVO</span>
        DÍA DEL MINERO EN CHILE  10-08-2026
      </span>
     <span class="marquee-separator">★</span>
      <span class="marquee-item">
        <span class="marquee-badge not">NOTICIA</span>
          Sólo Las QSLs por APRS se generan automáticamente, responder con la Frase del llamado !
      </span>  
      <span class="marquee-separator">★</span>
      <span class="marquee-item">
        <span class="marquee-badge hot">ACTIVO</span>
        Todas las QSLs se enviarán a los mails registrados en QRZ.com.
      </span>
      <span class="marquee-item">
        <span class="marquee-badge new">NUEVO</span>
        DÍA DE LA MIEL EN CHILE  06-08-2026
      </span>
     <span class="marquee-separator">★</span>
      <span class="marquee-item">
        <span class="marquee-badge not">NOTICIA</span>
         Regresamos... Próximamente más novedades!
      </span>  
      <span class="marquee-separator">★</span>
      <span class="marquee-item">
        <span class="marquee-badge hot">ACTIVO</span>
        Todas las QSLs se enviarán a los mails registrados en QRZ.com.
      </span>
      
      
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
          <img src="public/qrz_com.png" alt="" width="18" height="18">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
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
      <h3><a style="text-decoration:none;" href="https://www.zeitverschiebung.net/es/city/3870294">
        <span style="color:gray;">Hora actual en</span><br />Maule, Chile
      </a></h3>
      <iframe src="https://www.zeitverschiebung.net/clock-widget-iframe-v2?language=es&size=medium&timezone=America%2FSantiago" width="100%" height="115" frameborder="0" seamless loading="lazy"></iframe>
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
  <div class="weather-ticker">
    <div class="weather-ticker-label">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19a4.5 4.5 0 0 0 0-9h-1.8A7 7 0 1 0 4 15.5"/></svg>
      CLIMA REGIÓN DEL MAULE
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
      <h4>Síguenos</h4>
      <div class="social-links">
       
        <a href="https://www.instagram.com/ce4jwi/" class="social-btn" aria-label="Instagram">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
        </a>
        <a href="https://wa.me/56982859707" class="social-btn" aria-label="WhatsApp">
          <svg fill="none" viewBox="0 0 360 362"><path fill="#25D366" fill-rule="evenodd" d="M307.546 52.566C273.709 18.684 228.706.017 180.756 0 81.951 0 1.538 80.404 1.504 179.235c-.017 31.594 8.242 62.432 23.928 89.609L0 361.736l95.024-24.925c26.179 14.285 55.659 21.805 85.655 21.814h.077c98.788 0 179.21-80.413 179.244-179.244.017-47.898-18.608-92.926-52.454-126.807v-.008Zm-126.79 275.788h-.06c-26.73-.008-52.952-7.194-75.831-20.765l-5.44-3.231-56.391 14.791 15.05-54.981-3.542-5.638c-14.912-23.721-22.793-51.139-22.776-79.286.035-82.14 66.867-148.973 149.051-148.973 39.793.017 77.198 15.53 105.328 43.695 28.131 28.157 43.61 65.596 43.593 105.398-.035 82.149-66.867 148.982-148.982 148.982v.008Zm81.719-111.577c-4.478-2.243-26.497-13.073-30.606-14.568-4.108-1.496-7.09-2.243-10.073 2.243-2.982 4.487-11.568 14.577-14.181 17.559-2.613 2.991-5.226 3.361-9.704 1.117-4.477-2.243-18.908-6.97-36.02-22.226-13.313-11.878-22.304-26.54-24.916-31.027-2.613-4.486-.275-6.91 1.959-9.136 2.011-2.011 4.478-5.234 6.721-7.847 2.244-2.613 2.983-4.486 4.478-7.469 1.496-2.991.748-5.603-.369-7.847-1.118-2.243-10.073-24.289-13.812-33.253-3.636-8.732-7.331-7.546-10.073-7.692-2.613-.13-5.595-.155-8.586-.155-2.991 0-7.839 1.118-11.947 5.604-4.108 4.486-15.677 15.324-15.677 37.361s16.047 43.344 18.29 46.335c2.243 2.991 31.585 48.225 76.51 67.632 10.684 4.615 19.029 7.374 25.535 9.437 10.727 3.412 20.49 2.931 28.208 1.779 8.604-1.289 26.498-10.838 30.228-21.298 3.73-10.46 3.73-19.433 2.613-21.298-1.117-1.865-4.108-2.991-8.586-5.234l.008-.017Z" clip-rule="evenodd"/></svg>
        </a>
        <a href="https://t.me/ce4jwi" class="social-btn" aria-label="Telegram">
          <svg viewBox="0 0 256 256" preserveAspectRatio="xMidYMid"><defs><linearGradient id="telegram__a" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#2AABEE"/><stop offset="100%" stop-color="#229ED9"/></linearGradient></defs><path fill="url(#telegram__a)" d="M128 0C94.06 0 61.48 13.494 37.5 37.49A128.038 128.038 0 0 0 0 128c0 33.934 13.5 66.514 37.5 90.51C61.48 242.506 94.06 256 128 256s66.52-13.494 90.5-37.49c24-23.996 37.5-56.576 37.5-90.51 0-33.934-13.5-66.514-37.5-90.51C194.52 13.494 161.94 0 128 0Z"/><path fill="#FFF" d="M57.94 126.648c37.32-16.256 62.2-26.974 74.64-32.152 35.56-14.786 42.94-17.354 47.76-17.441 1.06-.017 3.42.245 4.96 1.49 1.28 1.05 1.64 2.47 1.82 3.467.16.996.38 3.266.2 5.038-1.92 20.24-10.26 69.356-14.5 92.026-1.78 9.592-5.32 12.808-8.74 13.122-7.44.684-13.08-4.912-20.28-9.63-11.26-7.386-17.62-11.982-28.56-19.188-12.64-8.328-4.44-12.906 2.76-20.386 1.88-1.958 34.64-31.748 35.26-34.45.08-.338.16-1.598-.6-2.262-.74-.666-1.84-.438-2.64-.258-1.14.256-19.12 12.152-54 35.686-5.1 3.508-9.72 5.218-13.88 5.128-4.56-.098-13.36-2.584-19.9-4.708-8-2.606-14.38-3.984-13.82-8.41.28-2.304 3.46-4.662 9.52-7.072Z"/></svg>
        </a>
        <a href="https://x.com/CE4JWI" class="social-btn" aria-label="X">
          <svg fill="none" viewBox="0 0 1200 1227"><path fill="#fff" d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"/></svg>
        </a>
      </div>
    </div>
  </div>
  
  <div class="footer-bottom">
    <p>&copy; 2025  -  CE4JWI </p>
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
 * Carga el clima en vivo (Open-Meteo, sin API key) solo para ciudades
 * de la Región del Maule y lo pinta en el ticker del footer.
 */
async function cargarClimaMaule() {
  const contenedor = document.getElementById("weatherTickerContent")
  if (!contenedor) return

  const ciudades = [
    { nombre: "Talca", lat: -35.4264, lon: -71.6554 },
    { nombre: "Curicó", lat: -34.9828, lon: -71.2394 },
    { nombre: "Linares", lat: -35.848, lon: -71.5934 },
    { nombre: "Cauquenes", lat: -35.967, lon: -72.3106 },
    { nombre: "Constitución", lat: -35.3333, lon: -72.4167 },
    { nombre: "Molina", lat: -35.1167, lon: -71.2833 },
    { nombre: "San Javier", lat: -35.6, lon: -71.7333 },
    { nombre: "Parral", lat: -36.1444, lon: -71.8281 },
  ]

  try {
    const lats = ciudades.map((c) => c.lat).join(",")
    const lons = ciudades.map((c) => c.lon).join(",")
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,weather_code&timezone=America%2FSantiago`

    const respuesta = await fetch(url)
    if (!respuesta.ok) throw new Error("No se pudo obtener el clima")
    const datos = await respuesta.json()
    const lista = Array.isArray(datos) ? datos : [datos]

    const itemsHtml = ciudades
      .map((ciudad, i) => {
        const d = lista[i]
        const temp = d && d.current ? Math.round(d.current.temperature_2m) : "--"
        const codigo = d && d.current ? d.current.weather_code : null
        const { icono, texto } = interpretarClima(codigo)
        return `<span class="weather-item"><span class="weather-city">${ciudad.nombre}</span><span class="weather-temp">${temp}°</span><span>${icono}</span><span>${texto}</span></span><span class="weather-separator">•</span>`
      })
      .join("")

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

    // Actualizar slides
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === currentSlide)
    })

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
 * Inicializa todos los componentes de la página
 */
function inicializarComponentes() {
  // Cargar componentes
  cargarComponente("header", "header-container")
  cargarComponente("marquee", "marquee-container")
  cargarComponente("sidebar", "sidebar-container")
  cargarComponente("footer", "footer-container")

  // Marcar navegación activa
  marcarNavActivo()

  // Inicializar menú móvil
  inicializarMenuMovil()

  // Inicializar menú desplegable "Herramientas"
  inicializarDropdowns()

  // Inicializar slider del sidebar
  inicializarSlider()

  // Cargar el clima en vivo de la Región del Maule en el footer
  cargarClimaMaule()
}

// Ejecutar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", inicializarComponentes)
