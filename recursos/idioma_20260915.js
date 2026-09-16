/**
 * ============================================================
 * CE4JWI - Selector de idioma ES / EN (15-sep-2026)
 * ============================================================
 * Español es el idioma base (texto ya en las páginas). La
 * opción EN traduce SOLO el layout/UI (menú, marquesina,
 * sidebar, footer, clima, estados, ranking, buscador QSL).
 * Las frases de cada actividad (títulos, descripciones,
 * "la frase COPIHUE", etc.) se mantienen SIN traducir.
 *
 * API global (window.I18N):
 *  - I18N.t('clave')        -> texto en el idioma activo
 *  - I18N.cambiarIdioma('es'|'en')
 *  - I18N.es()              -> true si el idioma activo es es
 *  - I18N.actual()          -> 'es'|'en'
 *  - I18N.aplicarDom()      -> aplica data-i18n al DOM
 *
 * Uso en HTML:  <span data-i18n="clave">...</span>
 *  - data-i18n        textContent
 *  - data-i18n-ph     placeholder
 *  - data-i18n-val    attribute value
 *  - data-i18n-title  attribute title
 * ============================================================
 */
(function () {
  var CLAVE = "ce4jwi_idioma";

  function idiomaGuardado() {
    try { return localStorage.getItem(CLAVE) || "es"; } catch (e) { return "es"; }
  }
  var actual = idiomaGuardado() === "en" ? "en" : "es";

  var ES = {
    "nav.actividades": "ACTIVIDADES",
    "nav.calendario": "CALENDARIO",
    "nav.generador": "GENERADOR DE QSL",
    "nav.descarga": "DESCARGA DE QSL",
    "nav.herramientas": "Herramientas",
    "nav.indicativos": "Buscar Indicativos (SUBTEL)",
    "nav.satelites": "Seguimiento de Satélites FM",
    "nav.propagacion": "Propagación HF en Tiempo Real",
    "nav.mapa": "Mapa de Radioaficionados",
    "marquee.titulo": "PRÓXIMAS ACTIVIDADES",
    "marquee.cargando": "Cargando próximas actividades...",
    "marquee.proximamente": "PRÓXIMAMENTE",
    "marquee.finalizada": "FINALIZADA",
    "marquee.vacio": "Próximamente más actividades.",
    "sidebar.modos": "Modos de Contacto",
    "sidebar.qrz": "Buscar en QRZ.COM",
    "sidebar.ingresa": "Ingresa Indicativo",
    "sidebar.buscar": "Buscar",
    "sidebar.hora": "Hora Local",
    "sidebar.horaActual": "Hora actual",
    "sidebar.localTalca": "· Local Talca",
    "sidebar.visitas": "Visitas en la Web!",
    "sidebar.imgAnterior": "Imagen anterior",
    "sidebar.imgSiguiente": "Imagen siguiente",
    "footer.region": "Región del Maule",
    "footer.cargandoClima": "Cargando clima de la región...",
    "footer.climaError": "Clima no disponible en este momento, intenta más tarde.",
    "footer.climaManana": "Mañana",
    "footer.tagline": "73 de CE4JWI - ¡Nos escuchamos en el aire!",
    "footer.correo": "Escríbenos por correo",
    "footer.telegram": "Contáctanos por Telegram",
    "clima.0": "Despejado",
    "clima.1": "Poco nublado",
    "clima.2": "Parcialmente nublado",
    "clima.3": "Nublado",
    "clima.45": "Niebla",
    "clima.48": "Niebla",
    "clima.51": "Llovizna",
    "clima.53": "Llovizna",
    "clima.55": "Llovizna",
    "clima.61": "Lluvia débil",
    "clima.63": "Lluvia",
    "clima.65": "Lluvia fuerte",
    "clima.71": "Nieve débil",
    "clima.73": "Nieve",
    "clima.75": "Nieve fuerte",
    "clima.80": "Chubascos",
    "clima.81": "Chubascos",
    "clima.82": "Chubascos fuertes",
    "clima.95": "Tormenta",
    "clima.96": "Tormenta con granizo",
    "clima.99": "Tormenta con granizo",
    "estado.FINALIZADO": "FINALIZADO",
    "estado.ACTIVO": "ACTIVO",
    "estado.PRÓXIMAMENTE": "PRÓXIMAMENTE",
    "estado.EN VIVO": "EN VIVO",
    "estado.EN CURSO": "EN CURSO",
    "paginacion.anterior": "‹ Anterior",
    "paginacion.siguiente": "Siguiente ›",
    "index.titulo": "Actividades de Radioaficionados",
    "ranking.titulo": "Ranking de la Actividad",
    "ranking.tiempoReal": "Ranking <strong>en tiempo real</strong> de los contactos APRS con la frase",
    "ranking.estaciones": "Estaciones Participantes",
    "ranking.enVivo": "En vivo",
    "ranking.finalizado": "Finalizado",
    "ranking.cargando": "Cargando…",
    "ranking.cargandoRanking": "Cargando ranking…",
    "ranking.th.indicativo": "Indicativo",
    "ranking.th.qso": "QSO",
    "ranking.th.ultimo": "Último Contacto",
    "ranking.actualizado": "Actualizado el",
    "ranking.vacio": "Aún no hay contactos registrados.",
    "ranking.error": "No se pudo cargar el ranking.",
    "ranking.footer": "Ranking en tiempo real",
    "qsl.titulo": "Buscador de Tarjetas QSL Online",
    "qsl.nota": "Ingresa tu indicativo para descargar en tiempo real tus confirmaciones de radio.",
    "qsl.indicativo": "Indicativo",
    "qsl.placeholder": "Ej: XR4MAU",
    "qsl.buscar": "BUSCAR QSL",
    "qsl.limpiar": "Limpiar",
    "qsl.estacion": "Estación:",
    "qsl.todas": "Todas",
    "qsl.cargando": "⏳ Consultando el libro de guardia...",
    "qsl.descargar": "DESCARGAR QSL",
    "qsl.vacio": "Sin tarjetas de {emisora} para este indicativo.",
    "qsl.grupo": "Estación {em} — {n} tarjeta{s}",
    "qsl.noEncontradas": "❌ No se encontraron tarjetas para el indicativo {call} en el libro de guardia.",
    "qsl.stats": "📇 {n} tarjeta{s} encontrada{s} para {call}",
    "qsl.indice": "Índice en línea: {total} tarjetas — {ce4} de CE4JWI y {xr} de XR4MAU en un solo lugar.",
    "qsl.sinActivas": "⚠️ Aún no se han registrado activaciones en el servidor. Intenta nuevamente en un momento.",
    "cal.titulo": "Calendario de Actividades",
    "cal.cargando": "Cargando calendario…",
    "cal.mesAnterior": "Mes anterior",
    "cal.mesSiguiente": "Mes siguiente",
    "cal.hoy": "Hoy",
    "cal.todoElDia": "Todo el día",
    "cal.hrs": "hrs",
    "cal.vacio": "No hay eventos próximos.",
    "cal.categorias": "Categorías",
  };

  var EN = {
    "nav.actividades": "ACTIVITIES",
    "nav.calendario": "CALENDAR",
    "nav.generador": "QSL GENERATOR",
    "nav.descarga": "QSL DOWNLOAD",
    "nav.herramientas": "Tools",
    "nav.indicativos": "Find Callsigns (SUBTEL)",
    "nav.satelites": "FM Satellite Tracking",
    "nav.propagacion": "Live HF Propagation",
    "nav.mapa": "Amateur Radio Map",
    "marquee.titulo": "UPCOMING ACTIVITIES",
    "marquee.cargando": "Loading upcoming activities...",
    "marquee.proximamente": "UPCOMING",
    "marquee.finalizada": "FINISHED",
    "marquee.vacio": "More activities coming soon.",
    "sidebar.modos": "Contact Modes",
    "sidebar.qrz": "Search on QRZ.COM",
    "sidebar.ingresa": "Enter Callsign",
    "sidebar.buscar": "Search",
    "sidebar.hora": "Local Time",
    "sidebar.horaActual": "Current time",
    "sidebar.localTalca": "· Talca Local Time",
    "sidebar.visitas": "Website Visits!",
    "sidebar.imgAnterior": "Previous image",
    "sidebar.imgSiguiente": "Next image",
    "footer.region": "Maule Region",
    "footer.cargandoClima": "Loading region weather...",
    "footer.climaError": "Weather unavailable right now, try later.",
    "footer.climaManana": "Tomorrow",
    "footer.tagline": "73 de CE4JWI - See you on the air!",
    "footer.correo": "Email us",
    "footer.telegram": "Contact us on Telegram",
    "clima.0": "Clear",
    "clima.1": "Partly cloudy",
    "clima.2": "Partly cloudy",
    "clima.3": "Cloudy",
    "clima.45": "Fog",
    "clima.48": "Fog",
    "clima.51": "Drizzle",
    "clima.53": "Drizzle",
    "clima.55": "Drizzle",
    "clima.61": "Light rain",
    "clima.63": "Rain",
    "clima.65": "Heavy rain",
    "clima.71": "Light snow",
    "clima.73": "Snow",
    "clima.75": "Heavy snow",
    "clima.80": "Showers",
    "clima.81": "Showers",
    "clima.82": "Heavy showers",
    "clima.95": "Thunderstorm",
    "clima.96": "Thunderstorm with hail",
    "clima.99": "Thunderstorm with hail",
    "estado.FINALIZADO": "FINISHED",
    "estado.ACTIVO": "ACTIVE",
    "estado.PRÓXIMAMENTE": "UPCOMING",
    "estado.EN VIVO": "LIVE",
    "estado.EN CURSO": "IN PROGRESS",
    "paginacion.anterior": "‹ Previous",
    "paginacion.siguiente": "Next ›",
    "index.titulo": "Amateur Radio Activities",
    "ranking.titulo": "Activity Ranking",
    "ranking.tiempoReal": "Live <strong>ranking</strong> of APRS contacts with the phrase",
    "ranking.estaciones": "Participating Stations",
    "ranking.enVivo": "Live",
    "ranking.finalizado": "Finished",
    "ranking.cargando": "Loading…",
    "ranking.cargandoRanking": "Loading ranking…",
    "ranking.th.indicativo": "Callsign",
    "ranking.th.qso": "QSO",
    "ranking.th.ultimo": "Last Contact",
    "ranking.actualizado": "Updated on",
    "ranking.vacio": "No contacts registered yet.",
    "ranking.error": "Could not load the ranking.",
    "ranking.footer": "Live ranking",
    "qsl.titulo": "Online QSL Card Search",
    "qsl.nota": "Enter your callsign to download your radio confirmations in real time.",
    "qsl.indicativo": "Callsign",
    "qsl.placeholder": "e.g. XR4MAU",
    "qsl.buscar": "SEARCH QSL",
    "qsl.limpiar": "Clear",
    "qsl.estacion": "Station:",
    "qsl.todas": "All",
    "qsl.cargando": "⏳ Checking the logbook...",
    "qsl.descargar": "DOWNLOAD QSL",
    "qsl.vacio": "No cards from {emisora} for this callsign.",
    "qsl.grupo": "Station {em} — {n} card{s}",
    "qsl.noEncontradas": "❌ No QSL cards found for callsign {call} in the logbook.",
    "qsl.stats": "📇 {n} card{s} found for {call}",
    "qsl.indice": "Online index: {total} cards — {ce4} from CE4JWI and {xr} from XR4MAU in one place.",
    "qsl.sinActivas": "⚠️ No activations registered on the server yet. Try again in a moment.",
    "cal.titulo": "Activity Calendar",
    "cal.cargando": "Loading calendar…",
    "cal.mesAnterior": "Previous month",
    "cal.mesSiguiente": "Next month",
    "cal.hoy": "Today",
    "cal.todoElDia": "All day",
    "cal.hrs": "hrs",
    "cal.vacio": "No upcoming events.",
    "cal.categorias": "Categories",
  };

  function t(clave) {
    var dict = actual === "en" ? EN : ES;
    return dict[clave] !== undefined ? dict[clave] : clave;
  }

  function formatear(clave, vars) {
    var texto = t(clave);
    if (!vars) return texto;
    Object.keys(vars).forEach(function (k) {
      texto = texto.split("{" + k + "}").join(String(vars[k]));
    });
    return texto;
  }

  function cambiarIdioma(lang) {
    lang = lang === "en" ? "en" : "es";
    if (lang === actual) return;
    actual = lang;
    try { localStorage.setItem(CLAVE, lang); } catch (e) {}
    window.location.reload();
  }

  function aplicarDom() {
    document.documentElement.lang = actual;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
    });
    document.querySelectorAll("[data-i18n-val]").forEach(function (el) {
      el.setAttribute("value", t(el.getAttribute("data-i18n-val")));
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
    });
  }

  /**
   * Re-traduce los textos del ranking de una actividad (etiquetas de
   * layout/UI solamente). Se ejecuta también vía MutationObserver porque
   * las páginas de actividad re-pintan el ranking con JS cada 60 s en
   * español y los textos deben volverse a traducir sin tocarlas.
   * Las frases propias de la actividad (p. ej. "ORGANILLERO") NO cambian.
   */
  function aplicarRanking() {
    if (actual !== "en") return;

    function reemplazar(el, mapa) {
      if (!el || !el.innerHTML) return;
      var html = el.innerHTML;
      var nuevo = html;
      Object.keys(mapa).forEach(function (es) {
        nuevo = nuevo.split(es).join(mapa[es]);
      });
      if (nuevo !== html) el.innerHTML = nuevo;
    }

    var live = document.querySelector(".ranking-live");
    if (live) {
      live.textContent = live.textContent.indexOf("Finalizado") !== -1 ? EN["ranking.finalizado"] : EN["ranking.enVivo"];
    }

    var badge = document.querySelector(".ranking-header .total-badge");
    if (badge) reemplazar(badge, { "estaciones": "stations", "Cargando&hellip;": EN["ranking.cargando"], "Cargando…": EN["ranking.cargando"] });

    var upd = document.getElementById("ranking-updated");
    if (upd) reemplazar(upd, { "Actualizado el": EN["ranking.actualizado"], " a las ": " " });

    document.querySelectorAll(".ranking-empty").forEach(function (el) {
      reemplazar(el, {
        "Cargando ranking&hellip;": EN["ranking.cargandoRanking"],
        "Cargando ranking…": EN["ranking.cargandoRanking"],
        "Aún no hay contactos registrados.": EN["ranking.vacio"],
        "No se pudo cargar el ranking.": EN["ranking.error"],
      });
    });

    document.querySelectorAll(".ranking-table th").forEach(function (el) {
      reemplazar(el, { "Indicativo": EN["ranking.th.indicativo"], "Último Contacto": EN["ranking.th.ultimo"] });
    });

    document.querySelectorAll(".ranking-title h2").forEach(function (el) {
      reemplazar(el, { "Ranking de la Actividad": EN["ranking.titulo"] });
    });
    document.querySelectorAll(".ranking-title p").forEach(function (el) {
      reemplazar(el, {
        "Ranking ": "Live ",
        "<strong>en tiempo real</strong>": "<strong>ranking</strong>",
        " de los contactos APRS con la frase": " of APRS contacts with the phrase",
      });
    });
    document.querySelectorAll(".ranking-header h2").forEach(function (el) {
      reemplazar(el, { "Estaciones Participantes": EN["ranking.estaciones"] });
    });
    document.querySelectorAll(".ranking-footer").forEach(function (el) {
      reemplazar(el, {
        "Ranking en tiempo real": EN["ranking.footer"],
        "Ranking <strong>en tiempo real</strong>": "Live <strong>ranking</strong>",
      });
    });
  }

  var observerActivo = false;
  function iniciarObserver() {
    if (observerActivo) return;
    observerActivo = true;
    new MutationObserver(function () {
      aplicarRanking();
    }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  }

  function aplicarTodo() {
    if (actual === "en") {
      // data-i18n debe aplicarse ANTES de los componentes (que se inyectan
      // con innerHTML por componentes.js tras el DOMContentLoaded).
      aplicarDom();
      aplicarRanking();
      iniciarObserver();
    }
  }

  document.addEventListener("DOMContentLoaded", aplicarTodo);

  window.I18N = {
    t: t,
    formatear: formatear,
    cambiarIdioma: cambiarIdioma,
    aplicarDom: aplicarDom,
    aplicarRanking: aplicarRanking,
    aplicarTodo: aplicarTodo,
    es: function () { return actual === "es"; },
    actual: function () { return actual; }
  };
})();