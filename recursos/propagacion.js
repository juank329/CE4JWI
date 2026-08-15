/*
 * ============================================================
 *  Propagación HF en Tiempo Real - CE4JWI
 *  Fuente de datos: reporte N0NBH (hamqsl.com/solarxml.php) vía
 *  proxy CORS. Estado por banda individual (160m-6m) calculado con
 *  SFI, índice K y hora local de Chile.
 * ============================================================
 */

(() => {
  "use strict";

  const URL_DIRECTA = "https://www.hamqsl.com/solarxml.php";
  const URL_PROXY = "https://api.allorigins.win/raw?url=" + encodeURIComponent(URL_DIRECTA);
  const INTERVALO_MINUTOS = 15;

  const ZONA_CHILE = "America/Santiago";

  const BANDAS = [
    { id: "160m", nombre: "160 Metros", freq: "1.8 MHz", lon: 160 },
    { id: "80m", nombre: "80 Metros", freq: "3.5 MHz", lon: 80 },
    { id: "40m", nombre: "40 Metros", freq: "7 MHz", lon: 40 },
    { id: "30m", nombre: "30 Metros", freq: "10 MHz", lon: 30 },
    { id: "20m", nombre: "20 Metros", freq: "14 MHz", lon: 20 },
    { id: "17m", nombre: "17 Metros", freq: "18 MHz", lon: 17 },
    { id: "15m", nombre: "15 Metros", freq: "21 MHz", lon: 15 },
    { id: "12m", nombre: "12 Metros", freq: "24 MHz", lon: 12 },
    { id: "10m", nombre: "10 Metros", freq: "28 MHz", lon: 10 },
    { id: "6m", nombre: "6 Metros", freq: "50 MHz", lon: 6 }
  ];

  const CONDICIONES = {
    excellent: { clase: "excelente", etiqueta: "Excelente" },
    good: { clase: "buena", etiqueta: "Buena" },
    fair: { clase: "regular", etiqueta: "Regular" },
    poor: { clase: "pobre", etiqueta: "Pobre" },
    closed: { clase: "cerrada", etiqueta: "Cerrada" }
  };

  const DESC = {
    "160m": {
      excellent: "DX nocturno continental en su mejor momento.",
      good: "Buenas condiciones regionales de noche.",
      regular: "Atenuada durante el día, solo regional.",
      pobre: "Alta absorción diurna, solo contactos locales.",
      cerrada: "Banda sin propagación útil."
    },
    "80m": {
      excellent: "Perfecta para DX nocturno y gray line.",
      good: "Buena de noche y al amanecer.",
      regular: "Atenuada durante el día.",
      pobre: "Absorción diurna fuerte.",
      cerrada: "Fuera de servicio."
    },
    "40m": {
      excellent: "La banda todoterreno en su mejor momento.",
      good: "Confiable día y noche.",
      regular: "Usable con limitaciones diurnas.",
      pobre: "Condiciones degradadas.",
      cerrada: "Fuera de servicio."
    },
    "30m": {
      excellent: "Ideal para DX confiable.",
      good: "Muy estable.",
      regular: "Aceptable.",
      pobre: "Propagación limitada.",
      cerrada: "Inoperativa."
    },
    "20m": {
      excellent: "La banda reina: DX internacional.",
      good: "Excelente para DX de media y larga distancia.",
      regular: "Buena para media distancia.",
      pobre: "Degradada por la tormenta.",
      cerrada: "Cerrada."
    },
    "17m": {
      excellent: "Joya para DX diurno.",
      good: "Muy buena con SFI elevado.",
      regular: "Requiere condiciones favorables.",
      pobre: "Marginal, SFI insuficiente.",
      cerrada: "Cerrada."
    },
    "15m": {
      excellent: "Fantástica para DX de larga distancia.",
      good: "Muy buena en horas diurnas.",
      regular: "Funcional con SFI moderado.",
      pobre: "SFI bajo o de noche.",
      cerrada: "Cerrada."
    },
    "12m": {
      excellent: "Extraordinaria para DX diurno.",
      good: "Excelente con alto SFI.",
      regular: "Marginal, necesita más sol.",
      pobre: "Apenas utilizable.",
      cerrada: "Cerrada de noche o con SFI bajo."
    },
    "10m": {
      excellent: "¡Apertura global! Especialmente en máximos solares.",
      good: "Muy buena con actividad solar alta.",
      regular: "Abierta pero inestable.",
      pobre: "Apenas abierta.",
      cerrada: "Cerrada (necesita SFI alto)."
    },
    "6m": {
      excellent: "¡Esporádica-E! Aprovecha para DX.",
      good: "Abierta por condiciones especiales.",
      regular: "Posible propagación local.",
      pobre: "Solo troposférica.",
      cerrada: "Sin propagación ionosférica."
    }
  };

  function escaparTexto(t) {
    return String(t == null ? "" : t)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function estadoEl(id) {
    return document.getElementById(id);
  }

  function horaChile() {
    try {
      const partes = new Date().toLocaleString("es-CL", {
        timeZone: ZONA_CHILE,
        hour12: false,
        hour: "2-digit",
        minute: "2-digit"
      }).split(":");
      let h = parseInt(partes[0], 10) || 0;
      if (h >= 24) h = 0;
      return { hora: h, texto: partes.join(":") };
    } catch (e) {
      const d = new Date();
      return { hora: d.getHours(), texto: d.getHours() + ":" + d.getMinutes() };
    }
  }

  function formatearFecha(fecha) {
    try {
      return fecha.toLocaleString("es-CL", {
        timeZone: ZONA_CHILE,
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit"
      });
    } catch (e) {
      return fecha.toString();
    }
  }

  function parsearXML(texto) {
    const doc = new DOMParser().parseFromString(texto, "text/xml");
    if (doc.getElementsByTagName("parsererror").length > 0) throw new Error("XML inválido");
    return doc;
  }

  function leer(doc, etiqueta) {
    const el = doc.getElementsByTagName(etiqueta)[0];
    return el ? el.textContent.trim() : "";
  }

  function num(doc, etiqueta, fallback) {
    const n = parseFloat(leer(doc, etiqueta));
    return isNaN(n) ? fallback : n;
  }

  /* ---- Modelo de propagación ---- */

  function esDia(hora) {
    return hora >= 6 && hora < 20;
  }

  function intensidadSol(hora) {
    if (hora < 6 || hora >= 20) return 0;
    if (hora >= 11 && hora <= 15) return 1;
    if (hora < 11) return (hora - 6) / 5;
    return (20 - hora) / 5;
  }

  function calcularCondicion(band, sfi, k, hora) {
    const isDay = esDia(hora);
    const sun = intensidadSol(hora);

    if (k >= 7) return band.lon >= 40 ? "poor" : "closed";
    if (k >= 5) {
      if (band.lon >= 80) return "fair";
      if (band.lon >= 40) return "poor";
      return "closed";
    }

    switch (band.id) {
      case "160m":
      case "80m":
        if (isDay) return "poor";
        return k <= 2 ? "excellent" : k <= 3 ? "good" : "fair";

      case "40m":
        if (isDay && sun > 0.7) return "fair";
        return k <= 3 ? "excellent" : "good";

      case "30m":
        if (!isDay) return k <= 2 ? "excellent" : "good";
        return sfi > 100 ? "good" : "fair";

      case "20m":
        if (sfi > 120) return "excellent";
        if (sfi > 90) return k <= 3 ? "excellent" : "good";
        return k <= 3 ? "good" : "fair";

      case "17m":
        if (sfi > 130 && isDay) return "excellent";
        if (sfi > 100) return "good";
        return sfi > 80 ? "fair" : "poor";

      case "15m":
        if (!isDay) return sfi > 150 ? "fair" : "poor";
        if (sfi > 120 && sun > 0.6) return "excellent";
        if (sfi > 90) return "good";
        return "fair";

      case "12m":
        if (!isDay) return "closed";
        if (sfi > 140 && sun > 0.7) return "excellent";
        if (sfi > 110) return "good";
        return sfi > 90 ? "fair" : "poor";

      case "10m":
        if (!isDay) return sfi > 180 ? "poor" : "closed";
        if (sfi > 150 && sun > 0.8 && k <= 3) return "excellent";
        if (sfi > 120 && sun > 0.6) return "good";
        if (sfi > 100) return "fair";
        return sfi > 80 ? "poor" : "closed";

      case "6m":
        if (sfi > 200 && isDay && sun > 0.7) return "excellent";
        if (sfi > 150 && isDay) return "good";
        return "closed";
    }

    return "fair";
  }

  function descripcionBanda(band, cond) {
    const m = DESC[band.id] || {};
    return m[cond] || "Condiciones variables.";
  }

  /* ---- Render ---- */

  function mostrarEstado(tipo, mensaje) {
    const el = estadoEl("propEstado");
    if (!el) return;
    el.className = "prop-estado " + tipo;
    el.textContent = mensaje;
  }

  function marcarBotonCargando(activo) {
    const btn = estadoEl("propRecargar");
    if (!btn) return;
    btn.classList.toggle("cargando-btn", activo);
    btn.disabled = activo;
  }

  function renderTarjetas(doc) {
    const v = {
      sfi: num(doc, "solarflux", NaN),
      k: num(doc, "kindex", NaN),
      a: num(doc, "aindex", NaN),
      xray: leer(doc, "xray"),
      sn: num(doc, "sunspots", NaN),
      wind: num(doc, "solarwind", NaN),
      bz: num(doc, "magneticfield", NaN),
      geomag: leer(doc, "geomagfield")
    };

    const items = [
      { clave: "sfi", color: "azul", etiqueta: "Flujo solar (SFI)", valor: isNaN(v.sfi) ? "—" : v.sfi, sub: "Mín. buen DX: 100 · ideal: 150+" },
      { clave: "k", color: "naranja", etiqueta: "Índice K", valor: isNaN(v.k) ? "—" : v.k, sub: "K bajo = campo tranquilo" },
      { clave: "a", color: "rojo", etiqueta: "Índice A", valor: isNaN(v.a) ? "—" : v.a, sub: "A ≥ 30 = condiciones revueltas" },
      { clave: "xray", color: "verde", etiqueta: "Rayos X", valor: v.xray || "—", sub: "Clase de fulguraciones" },
      { clave: "sn", color: "amarillo", etiqueta: "Manchas solares", valor: isNaN(v.sn) ? "—" : v.sn, sub: "Manchas solares (SIDC)" },
      { clave: "wind", color: "azul", etiqueta: "Viento solar", valor: isNaN(v.wind) ? "—" : v.wind + " km/s", sub: "Bz " + (isNaN(v.bz) ? "—" : v.bz) + " nT" }
    ];

    const grid = estadoEl("propTarjetas");
    if (!grid) return;
    grid.innerHTML = "";

    items.forEach(it => {
      const card = document.createElement("div");
      card.className = "prop-card " + it.color;
      card.innerHTML =
        '<div class="prop-label">' + escaparTexto(it.etiqueta) + "</div>" +
        '<div class="prop-valor">' + escaparTexto(String(it.valor)) + "</div>" +
        '<div class="prop-sub">' + escaparTexto(it.sub) + "</div>" +
        (it.clave === "wind" && v.geomag ? '<div class="prop-extra">Geomag: ' + escaparTexto(v.geomag) + "</div>" : "");
      grid.appendChild(card);
    });
  }

  function renderBandas(sfi, k, hora) {
    const cont = estadoEl("propBandas");
    if (!cont) return;
    cont.innerHTML = "";

    BANDAS.forEach(band => {
      const cond = calcularCondicion(band, sfi, k, hora);
      const c = CONDICIONES[cond];
      const card = document.createElement("div");
      card.className = "prop-banda";
      card.innerHTML =
        '<div class="prop-banda-header">' +
        '<div class="prop-banda-nombre">' + escaparTexto(band.nombre) + "</div>" +
        '<div class="prop-banda-freq">' + escaparTexto(band.freq) + "</div>" +
        "</div>" +
        '<span class="prop-badge ' + c.clase + '">' + escaparTexto(c.etiqueta) + "</span>" +
        '<p class="prop-banda-desc">' + escaparTexto(descripcionBanda(band, cond)) + "</p>";
      cont.appendChild(card);
    });

    const h = estadoEl("propHora");
    if (h) h.textContent = "(hora de Chile: " + hora.texto + ")";
  }

  function actualizarFecha(updatedRaw, ahora) {
    const el = estadoEl("propFecha");
    if (!el) return;
    const fuente = updatedRaw ? " · reporte: " + escaparTexto(updatedRaw) : "";
    el.innerHTML = "Datos de hoy " + formatearFecha(ahora) + fuente;
  }

  async function cargarDatos(manual) {
    if (manual) mostrarEstado("cargando", "Actualizando condiciones…");
    marcarBotonCargando(true);

    let texto = null;
    try {
      const res = await fetch(URL_PROXY, { signal: AbortSignal.timeout(25000) });
      if (!res.ok) throw new Error("HTTP " + res.status);
      texto = await res.text();
    } catch (e1) {
      try {
        const res2 = await fetch(URL_DIRECTA, { signal: AbortSignal.timeout(25000) });
        if (!res2.ok) throw new Error("HTTP " + res2.status);
        texto = await res2.text();
      } catch (e2) {
        mostrarEstado("error", "No se pudieron obtener los datos del clima espacial. Revisa tu conexión e inténtalo de nuevo.");
        marcarBotonCargando(false);
        return;
      }
    }

    try {
      const doc = parsearXML(texto);
      const sfi = num(doc, "solarflux", 100);
      const k = num(doc, "kindex", 2);
      const hora = horaChile();

      renderTarjetas(doc);
      renderBandas(sfi, k, hora);
      actualizarFecha(leer(doc, "updated"), new Date());
      mostrarEstado("ok", "Datos en tiempo real del reporte N0NBH (NOAA). Se actualizan automáticamente cada " + INTERVALO_MINUTOS + " min.");
    } catch (e) {
      mostrarEstado("error", "El reporte llegó mal formado. Intenta actualizar de nuevo.");
    }
    marcarBotonCargando(false);
  }

  function iniciar() {
    const btn = estadoEl("propRecargar");
    if (btn) btn.addEventListener("click", () => cargarDatos(true));
    cargarDatos(false);
    setInterval(() => cargarDatos(false), INTERVALO_MINUTOS * 60 * 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
