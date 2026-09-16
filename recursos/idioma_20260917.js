/**
 * ============================================================
 * CE4JWI - Bloqueador de idioma (SÓLO ESPAÑOL) - 17-sep-2026
 * ============================================================
 * El sitio es 100% en español. Este módulo garantiza que NUNCA
 * se active otro idioma ni cambie el contenido:
 *   - Elimina cualquier preferencia guardada (localStorage).
 *   - Fuerza idioma "es".
 *   - Expone window.I18N como API no-op mínima para que los
 *     demás scripts (componentes, script, clima, ranking,
 *     calendario, buscador) que llaman I18N.t()/cambiarIdioma()
 *     no fallen.
 * "es" es el idioma BASE (todo el contenido ya viene en español).
 * ============================================================
 */
(function () {
  var CLAVE = "ce4jwi_idioma";

  // 1) Borra preferencia previa y fuerza español
  try { localStorage.removeItem(CLAVE); } catch (e) {}

  // 2) API mínima de compatibilidad (no-op / siempre es)
  var actual = "es";

  function t(clave) {
    return clave;
  }

  function formatear(clave) {
    return t(clave);
  }

  function cambiarIdioma() {
    try { localStorage.removeItem(CLAVE); } catch (e) {}
    actual = "es";
  }

  function aplicarDom() {}
  function aplicarRanking() {}
  function aplicarTodo() {}

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
})();
