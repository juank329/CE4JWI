/**
* ============================================================
 * CE4JWI - SELECCION DE IDIOMA - SOLO ESPANOL (17-sep-2026)
 * ============================================================
 * Version 20260917 -- REVISION: el sitio es 100% en espanol.
 * No hay boton ES|EN. El motor borra cualquier preferencia de
 * idioma guardada (localStorage) y fuerza siempre "es".
 *
 * Documentacion corta (el sitio es SOLO en espanol):
 *   - ES : unico diccionario, claves con prefijo de seccion.
 *   - I18N.t('namespace.clave') devuelve el texto en espanol.
 *   - I18N.t('estado.PRÓXIMAMENTE') etc para el badge del ranking:
 *     nunca devuelve la clave cruda en pantalla; si la clave no
 *     existe, devuelve el texto tras el ultimo punto.
 *   - No hay segundo idioma, ni selector, ni boton de idioma.
 * ============================================================
 */
(function () {
  var CLAVE = "ce4jwi_idioma";

  // ---- API global previa (evita romper llamadas de viejos scripts)
  if (typeof window.I18N === "object" && window.I18N) return;
  window.I18N = {};

  /* ============================================================
   * Diccionario ES (unico idioma real)
   * ============================================================ */
  var ES = {
    // ---- Badges / semaforo del estado de cada actividad (ranking)
    "estado.ACTIVO": "ACTIVO",
    "estado.EN CURSO": "EN CURSO",
    "estado.FINALIZADO": "FINALIZADO",
    "estado.PRÓXIMAMENTE": "PRÓXIMAMENTE",
    // ---- Estados crudos tal como vienen del JSON (sin traduccion)
    "estado.ACTIVO_CRUDO": "ACTIVO",
    "estado.EN CURSO_CRUDO": "EN CURSO",
    "estado.FINALIZADO_CRUDO": "FINALIZADO",
    "estado.PRÓXIMAMENTE_CRUDO": "PRÓXIMAMENTE",
  };

  var actual = "es";

  /* Retorna el texto para una clave. Si no existe la clave:
   *  - nunca devuelve la clave cruda con prefijo.
   *  - devuelve el diccionario ES (o, si tampoco, el texto tras el
   *    ultimo punto, ej. "estado.PRÓXIMAMENTE" -> "PRÓXIMAMENTE"). */
  function t(clave) {
    if (typeof clave !== "string" || !clave) return "";
    if (ES[clave] !== undefined) return ES[clave];
    var idx = clave.lastIndexOf(".");
    return idx >= 0 ? clave.substring(idx + 1) : clave;
  }

  function formatear(clave, datos) {
    var texto = t(clave);
    if (!datos) return texto;
    Object.keys(datos).forEach(function (k) {
      texto = texto.split("{" + k + "}").join(String(datos[k]));
    });
    return texto;
  }

  function cambiarIdioma(lang) {
    // No-op total: el idioma siempre es espanol.
    try { if (localStorage) localStorage.removeItem(CLAVE); } catch (e) {}
    return "es";
  }

  function aplicarDom() {}

  function aplicarRanking() {
    // Ajusta tambien el texto de los badges del ranking si por
    // cualquier cache viejo llegaron como clave cruda.
    document.querySelectorAll("[data-i18n^='estado.']").forEach(function (el) {
      var clave = el.getAttribute("data-i18n");
      var texto = t(clave);
      if (el.textContent !== texto) el.textContent = texto;
    });
  }

  function aplicarTodo() {
    aplicarDom();
    aplicarRanking();
  }

  // ---- Exponer API estable
  window.I18N = {
    t: t,
    formatear: formatear,
    cambiarIdioma: cambiarIdioma,
    aplicarDom: aplicarDom,
    aplicarRanking: aplicarRanking,
    aplicarTodo: aplicarTodo,
    es: function () { return true; },
    actual: function () { return "es"; },
  };

  // ---- Forzar ES al cargar: limpiar preferencia guardada DE UNA VEZ
  try {
    if (localStorage && localStorage.removeItem) {
      localStorage.removeItem(CLAVE);
      localStorage.removeItem("ce4jwi_idioma_en");
    }
  } catch (e) {}

  // Si ya cargo el DOM, aplicar; si no, a DOMContentLoaded
  function alListo() { aplicarTodo(); }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", alListo);
  } else {
    alListo();
  }
})();
