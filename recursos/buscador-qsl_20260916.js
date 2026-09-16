/**
 * ============================================================
 * CE4JWI - Buscador de tarjetas QSL
 * ============================================================
 * Lee el índice log_qsl.json (raíz del hosting) y muestra las
 * tarjetas QSL de un indicativo. El índice lo produce el bot en
 * vivo, por lo que cada búsqueda consulta una copia fresca.
 *
 * Las QSL provienen de las dos estaciones gemelas (CE4JWI y
 * XR4MAU) y conviven en un solo lugar: al buscar un indicativo
 * aparecen todas las tarjetas de ambas estaciones, con su badge
 * de emisora y un filtro para separarlas si se desea.
 *
 * Robustez:
 *  - Si log_qsl.json llega truncado (el bot puede estar
 *    reescribiéndolo), reintenta automáticamente con backoff.
 *  - Soporta ?call=XR4MAU para enlazar desde cualquier página.
 * ============================================================
 */

( () => {
  const _i = () => (typeof I18N !== "undefined" && I18N) ? I18N : null;
  const _t = (clave, vars) => {
    const i = _i();
    if (i && i.formatear) return i.formatear(clave, vars);
    // Fallback en español si el motor no está presente
    const ES = {
      "qsl.vacio": "Sin tarjetas de {emisora} para este indicativo.",
      "qsl.grupo": "Estación {em} — {n} tarjeta{s}",
      "qsl.noEncontradas": "❌ No se encontraron tarjetas para el indicativo {call} en el libro de guardia.",
      "qsl.stats": "📇 {n} tarjeta{s} encontrada{s} para {call}",
      "qsl.indice": "Índice en línea: {total} tarjetas — {ce4} de CE4JWI y {xr} de XR4MAU en un solo lugar.",
      "qsl.sinActivas": "⚠️ Aún no se han registrado activaciones en el servidor. Intenta nuevamente en un momento.",
      "qsl.descargar": "DESCARGAR QSL"
    };
    let texto = ES[clave] || clave;
    if (vars) Object.keys(vars).forEach((k) => { texto = texto.split("{" + k + "}").join(String(vars[k])); });
    return texto;
  };

  const callInput = document.getElementById("callInput");
  const btnBuscar = document.getElementById("btnBuscar");
  const grid = document.getElementById("resultGrid");
  const aviso = document.getElementById("aviso");
  const cargando = document.getElementById("cargando");
  const stats = document.getElementById("stats");
  const estado = document.getElementById("estado");

  const MAX_REINTENTOS = 4;
  const ESPERA_BASE_MS = 1200;

  // Último conjunto de resultados (ya filtrados por indicativo).
  let resultadosActuales = [];

  // Filtro de estación emisora activo: "TODAS" | "CE4JWI" | "XR4MAU"
  let emisoraActiva = "TODAS";

  /**
   * Detecta la estación emisora de una tarjeta.
   * XR4MAU se marca solo cuando su distintivo aparece en el nombre
   * del archivo sin el de CE4JWI; CE4JWI actúa como emisora
   * predeterminada (incluye diplomas y tarjetas genéricas).
   */
  function emisoraDe(qsl) {
    const nombre = String(qsl.archivo || qsl.url || "").toUpperCase();
    const tieneXR = nombre.includes("XR4MAU");
    const tieneCE = nombre.includes("CE4JWI");
    if (tieneXR && !tieneCE) return "XR4MAU";
    return "CE4JWI";
  }

  function iconoCorazon(pinta) {
    const svg = `<svg viewBox="0 0 24 24" fill="${pinta ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21C7 17 3 13.5 3 9.5 3 6.5 5.5 4 8.5 4c1.5 0 3 .8 3.5 2 .5-1.2 2-2 3.5-2 3 0 5.5 2.5 5.5 5.5 0 4-4 7.5-9 11.5z"/></svg>`;
    return svg;
  }
  const AREA = {
    CE4JWI: { clase: "ce4jwi", codigo: "CE" },
    XR4MAU: { clase: "xr4mau", codigo: "XR" },
  };

  function mostrarAviso(texto) {
    if (aviso) {
      aviso.textContent = texto;
      aviso.classList.add("visible");
    }
  }

  function ocultarAviso() {
    if (aviso) aviso.classList.remove("visible");
  }

  function mostrarCargando(si) {
    if (cargando) cargando.classList.toggle("visible", si);
  }

  /**
   * Descarga log_qsl.json desde la raíz del sitio.
   * Sigue una cadena de orígenes (raíz local, luego qsl.net absoluto)
   * y reintenta cuando el JSON viene incompleto (corte del bot).
   */
  async function cargarIndice() {
    const fuentes = [
      "log_qsl.json",
      "https://qsl.net/ce4jwi/log_qsl.json",
    ];

    let ultimoError = null;
    for (let fuente = 0; fuente < fuentes.length; fuente++) {
      for (let intento = 0; intento < MAX_REINTENTOS; intento++) {
        try {
          const resp = await fetch(fuentes[fuente], { cache: "no-store" });
          if (!resp.ok) throw new Error("HTTP " + resp.status);
          const texto = await resp.text();
          try {
            const datos = JSON.parse(texto);
            if (Array.isArray(datos)) return datos;
            throw new Error("Formato inesperado");
          } catch (errParse) {
            // JSON truncado: el bot puede estar reescribiendo el archivo.
            ultimoError = errParse;
            await esperar(ESPERA_BASE_MS * (intento + 1));
          }
        } catch (errRed) {
          ultimoError = errRed;
          if (fuente === 0) break; // se prueba la siguiente fuente
          await esperar(ESPERA_BASE_MS * (intento + 1));
        }
      }
    }

    throw ultimoError || new Error("No se pudo leer el índice de QSL");
  }

  async function buscarQSLs() {
    let callBuscado = (callInput ? callInput.value : "").trim().toUpperCase();
    if (!callBuscado) return;

    // Se descarta el SSID (ej: XR4MAU-9 -> XR4MAU)
    if (callBuscado.includes("-")) callBuscado = callBuscado.split("-")[0];

    grid.innerHTML = "";
    ocultarAviso();
    if (stats) stats.textContent = "";
    if (estado) estado.textContent = "";
    mostrarCargando(true);

    try {
      const datos = await cargarIndice();
      mostrarCargando(false);

      resultadosActuales = datos
        .filter((qsl) => (qsl.call || "").toUpperCase().trim() === callBuscado)
        .sort((a, b) => {
          const df = String(b.fecha || "").localeCompare(String(a.fecha || ""));
          if (df !== 0) return df;
          const dh = String(b.hora || "").localeCompare(String(a.hora || ""));
          if (dh !== 0) return dh;
          return String(b.archivo || b.url || "").localeCompare(String(a.archivo || a.url || ""));
        });

      // Cuenta de tarjetas totales del índice (para el pie)
      const totalIndice = datos.length;
      const porEstacion = { CE4JWI: 0, XR4MAU: 0 };
      datos.forEach((qsl) => {
        porEstacion[emisoraDe(qsl)] += 1;
      });

      if (resultadosActuales.length === 0) {
        mostrarAviso(_t("qsl.noEncontradas", { call: callBuscado }));
      } else {
        const n = resultadosActuales.length;
        if (stats) {
          stats.textContent = _t("qsl.stats", { n, s: n === 1 ? "" : "s", call: callBuscado });
        }
      }

      if (estado) {
        estado.textContent = _t("qsl.indice", {
          total: totalIndice,
          ce4: porEstacion.CE4JWI,
          xr: porEstacion.XR4MAU,
        });
      }

      pintarFiltros();
      mostrarFiltros(resultadosActuales.length > 0);
      aplicarFiltro();
    } catch (err) {
      mostrarCargando(false);
      mostrarAviso(_t("qsl.sinActivas"));
    }
  }

  function mostrarFiltros(si) {
    const filas = document.querySelectorAll(".qsl-filtros");
    filas.forEach((f) => f.classList.toggle("visible", si));
  }

  function actualizarContadoresFiltros() {
    const contador = (emisora) =>
      resultadosActuales.filter((q) => emisoraDe(q) === emisora).length;

    document.querySelectorAll(".qsl-filtro").forEach((boton) => {
      const e = boton.dataset.emisora;
      const total = e === "TODAS" ? resultadosActuales.length : contador(e);
      const span = boton.querySelector("span");
      if (span) span.textContent = e === "TODAS" ? `(${total})` : `(${total})`;
    });
  }

  function pintarFiltros() {
    const contenedor = document.querySelector(".qsl-filtros");
    if (contenedor) actualizarContadoresFiltros();
  }

  function aplicarFiltro() {
    grid.innerHTML = "";
    const visibles = resultadosActuales.filter(
      (q) => emisoraActiva === "TODAS" || emisoraDe(q) === emisoraActiva
    );

    document.querySelectorAll(".qsl-filtro").forEach((boton) => {
      boton.classList.toggle("activo", boton.dataset.emisora === emisoraActiva);
    });

    if (visibles.length === 0) {
      grid.innerHTML = `<p class="qsl-vacio">${_t("qsl.vacio", { emisora: emisoraActiva })}</p>`;
      return;
    }

    // Agrupa: primero CE4JWI, luego XR4MAU (se muestra el contador por estación).
    const ordenEmisoras = ["CE4JWI", "XR4MAU"];
    const grupos = ordenEmisoras
      .map((em) => ({ em, items: visibles.filter((q) => emisoraDe(q) === em) }))
      .filter((g) => g.items.length > 0);

    grupos.forEach((grupo) => {
      if (grupos.length > 1) {
        const cabecera = document.createElement("div");
        cabecera.className = "qsl-grupo";
        cabecera.textContent = _t("qsl.grupo", { em: grupo.em, n: grupo.items.length, s: grupo.items.length === 1 ? "" : "s" });
        grid.appendChild(cabecera);
      }
      grupo.items.forEach((qsl) => grid.appendChild(crearTarjeta(qsl)));
    });
  }

  function crearTarjeta(qsl) {
    const url = qsl.url || "";
    const nombreArchivo = String(qsl.archivo || url.substring(url.lastIndexOf("/") + 1));
    const evento = String(qsl.carpeta || "General").replace(/_/g, " ");
    const emisora = emisoraDe(qsl);
    const info = AREA[emisora] || AREA.CE4JWI;

    const chips = [];
    if (qsl.fecha) chips.push(`<span class="qsl-chip">📅 ${qsl.fecha}</span>`);
    if (qsl.hora) chips.push(`<span class="qsl-chip">🕐 ${qsl.hora}</span>`);
    if (qsl.modo) chips.push(`<span class="qsl-chip">📻 ${qsl.modo}</span>`);

    const card = document.createElement("article");
    card.className = "qsl-card";

    card.innerHTML = `
      <a class="qsl-thumb" href="${url}" target="_blank" rel="noopener">
        <img loading="lazy" src="${url}" alt="QSL de ${qsl.call || ""}">
      </a>
      <div class="qsl-card-body">
        <div class="qsl-card-top">
          <span class="qsl-emisora ${info.clase}">${iconoCorazon(true)} ${emisora}</span>
          <div class="qsl-evento">${evento}</div>
        </div>
        ${chips.length ? `<div class="qsl-meta">${chips.join("")}</div>` : ""}
        <a class="qsl-descargar" href="${url}" download="${nombreArchivo}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 21h16"/></svg>
          ${_t("qsl.descargar")}
        </a>
      </div>
    `;

    return card;
  }

  function esperar(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  // Manejo de filtros por estación (delegación sobre el contenedor).
  document.addEventListener("click", (e) => {
    const boton = e.target.closest(".qsl-filtro");
    if (!boton) return;
    emisoraActiva = boton.dataset.emisora;
    aplicarFiltro();
  });

  if (callInput) {
    callInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") buscarQSLs();
    });
  }
  if (btnBuscar) btnBuscar.addEventListener("click", buscarQSLs);
  const btnLimpiar = document.getElementById("btnLimpiar");
  if (btnLimpiar) {
    btnLimpiar.addEventListener("click", () => {
      if (callInput) callInput.value = "";
      grid.innerHTML = "";
      resultadosActuales = [];
      ocultarAviso();
      if (stats) stats.textContent = "";
      if (estado) estado.textContent = "";
      mostrarFiltros(false);
      emisoraActiva = "TODAS";
      if (callInput) callInput.focus();
    });
  }

  // Soporte ?call=XR4MAU para enlazar directo desde la web / QSLs
  const params = new URLSearchParams(window.location.search);
  const callParam = params.get("call");
  if (callParam && callInput) {
    callInput.value = callParam;
    buscarQSLs();
  }
})();