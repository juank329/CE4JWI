/* ==========================================================================
   Mapa de Radioaficionados de Chile
   - Leaflet + clustering de todos los radioaficionados del listado SUBTEL.
   - Ubicación aproximada por comuna (recursos/mapa-comunas.js).
   - Buscador por indicativo/nombre/comuna y filtros por categoría y región.
   - Carga de datos IDÉNTICA al buscador de indicativos (se actualiza solo
     cuando se regeneran los listados de SUBTEL cada mes):
       1) Datos embebidos (recursos/indicativas-data.js): frescos, file://
       2) localStorage (caché 24 h, comparte clave con el buscador)
       3) JSON local (recursos/indicativos.json)
       4) Respaldo remoto en qsl.net vía proxies CORS
   ========================================================================== */
(function () {
  'use strict';

  const contenedorMapa = document.getElementById('mrMapa');
  const contenedorEstado = document.getElementById('mrEstado');
  const contenedorTotal = document.getElementById('mrTotal');
  const inputBusqueda = document.getElementById('mrBusqueda');
  const selectRegion = document.getElementById('mrRegion');
  const botonesCategoria = document.querySelectorAll('.mr-filtro-cat[data-cat]');
  if (!contenedorMapa || !contenedorEstado || !contenedorTotal) return;

  const COLORES = {
    General: '#1a4d8f',
    Superior: '#1e8e3e',
    Novicio: '#e08a00',
    Aspirante: '#7d3bd2'
  };
  const COLOR_PROPIO = '#d9a404';
  const INDICATIVO_PROPIO = 'CE4JWI';
  const LIMITE_BUSQUEDA = 300;
  const LIMITES_CHILE = [[-56.8, -76.8], [-16.9, -64.8]];
  const VISTA_PADDING = [16, 16];
  const VISTA_INICIAL = { center: [-35.5, -70.6], zoom: 5 };
  const ORDEN_REGIONES = [
    'Región de Arica y Parinacota',
    'Región de Tarapacá',
    'Región de Antofagasta',
    'Región de Atacama',
    'Región de Coquimbo',
    'Región de Valparaíso',
    'Región Metropolitana de Santiago',
    "Región del Libertador General Bernardo O'Higgins",
    'Región del Maule',
    'Región de Ñuble',
    'Región del Biobío',
    'Región de la Araucanía',
    'Región de Los Ríos',
    'Región de Los Lagos',
    'Región de Aysén del General Carlos Ibáñez del Campo',
    'Región de Magallanes y de la Antártica Chilena'
  ];

  // ====================== CARGA DE DATOS ===============================
  // Misma estrategia que recursos/indicativos.js: la clave de caché se
  // comparte para no duplicar ~4 MB en localStorage.
  const INDICATIVOS_JSON_URL = 'https://qsl.net/ce4jwi/indicativos.json';
  const INDICATIVOS_JSON_LOCAL = 'recursos/indicativos.json';
  const CACHE_KEY = 'ce4jwi_indicativos_v4';
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 h
  const PROXIES_CORS = [
    { url: (u) => `https://cors.sh/${u}`, nombre: 'cors.sh' },
    { url: (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`, nombre: 'allorigins' }
  ];

  let datosActuales = null;
  let mapa = null;
  let grupo = null;
  let marcadores = [];
  let sinUbicacion = 0;
  const estado = {
    categoria: { General: true, Superior: true, Novicio: true, Aspirante: true },
    region: ''
  };

  function normalizar(valor) {
    return String(valor == null ? '' : valor)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/gi, '')
      .toUpperCase();
  }

  function escapar(texto) {
    return String(texto == null ? '' : texto)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function cargarCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const cached = JSON.parse(raw);
      if (Date.now() - cached.ts > CACHE_TTL_MS) return null;
      return cached.data;
    } catch (e) { return null; }
  }

  function guardarCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    } catch (e) { /* localStorage lleno, ignorar */ }
  }

  async function fetchConTimeout(url, ms) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
      return await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
    } finally { clearTimeout(t); }
  }

  async function fetchJSON(url, timeoutMs) {
    for (const p of PROXIES_CORS) {
      try {
        const r = await fetchConTimeout(p.url(url), timeoutMs);
        if (r.ok) return await r.json();
      } catch (e) {
        console.warn(`[mapa-radio] proxy ${p.nombre} falló:`, e.message || e);
      }
    }
    try {
      const r = await fetchConTimeout(url, timeoutMs);
      if (r.ok) return await r.json();
    } catch (e) {
      console.warn('[mapa-radio] fetch directo falló:', e.message || e);
    }
    throw new Error(`No se pudo cargar ${url}`);
  }

  function recargarEnBackground() {
    fetchConTimeout(INDICATIVOS_JSON_LOCAL, 5000)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => guardarCache(data))
      .catch(() => { /* silencio: ya tenemos caché válido */ });
  }

  async function cargarDatos({ silencioso = false } = {}) {
    if (!silencioso) contenedorEstado.textContent = 'Cargando base de datos de SUBTEL...';

    if (window.INDICATIVOS_DATA) {
      datosActuales = window.INDICATIVOS_DATA;
      guardarCache(datosActuales);
      recargarEnBackground();
      return;
    }
    const cache = cargarCache();
    if (cache) {
      datosActuales = cache;
      recargarEnBackground();
      return;
    }
    try {
      const r = await fetchConTimeout(INDICATIVOS_JSON_LOCAL, 5000);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      datosActuales = await r.json();
      guardarCache(datosActuales);
      recargarEnBackground();
      return;
    } catch (eLocal) {
      console.warn('[mapa-radio] JSON local falló:', eLocal.message);
    }
    try {
      datosActuales = await fetchJSON(INDICATIVOS_JSON_URL, 15000);
      guardarCache(datosActuales);
    } catch (eRemoto) {
      throw new Error(`No se pudo cargar la base ni local ni de qsl.net: ${eRemoto.message}`);
    }
  }

  // ====================== MAPA =========================================
  const indiceCoords = {};
  if (window.COMUNAS_COORDS) {
    for (const clave in window.COMUNAS_COORDS) {
      if (Object.prototype.hasOwnProperty.call(window.COMUNAS_COORDS, clave)) {
        indiceCoords[normalizar(clave)] = window.COMUNAS_COORDS[clave];
      }
    }
  }

  function categoriaDe(dato) {
    const c = String(dato.categoria || '').trim();
    return COLORES[c] ? c : 'Aspirante';
  }

  function esPropio(dato) {
    return String(dato.indicativo || '').toUpperCase() === INDICATIVO_PROPIO;
  }

  function construirPopup(dato, cat, propio) {
    let html = '<strong>' + escapar(dato.indicativo) + '</strong>' +
      (propio ? ' <span class="mr-badge">Tu indicativo</span>' : '') +
      '<br><span class="mr-pop-cat">' + escapar(cat) + '</span>';
    if (dato.nombre) html += '<br><span class="mr-pop-nombre">' + escapar(dato.nombre) + '</span>';
    html += '<br><span class="mr-pop-ubi">' + escapar(dato.comuna) + ' · ' + escapar(dato.region) + '</span>';
    if (dato.vence) html += '<br><span class="mr-pop-vence">Licencia vence: ' + escapar(dato.vence) + '</span>';
    return html;
  }

  function iniciarMapa() {
    if (!window.L || !window.L.map) return null;
    mapa = L.map(contenedorMapa, {
      center: VISTA_INICIAL.center,
      zoom: VISTA_INICIAL.zoom,
      scrollWheelZoom: false,
      minZoom: 3
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
    }).addTo(mapa);
    try {
      mapa.fitBounds(LIMITES_CHILE, { padding: VISTA_PADDING });
    } catch (e) { /* sin ajuste */ }
    return mapa;
  }

  function restablecerVista() {
    if (!mapa) return;
    mapa.closePopup();
    try {
      mapa.flyToBounds(LIMITES_CHILE, { padding: VISTA_PADDING });
    } catch (e) {
      mapa.setView(VISTA_INICIAL.center, VISTA_INICIAL.zoom);
    }
  }

  function construirMarcadores(datos) {
    marcadores = [];
    sinUbicacion = 0;
    let i = 0;
    const paso = 2000;
    const total = datos.length;
    const conteo = { General: 0, Superior: 0, Novicio: 0, Aspirante: 0 };
    const regiones = new Set();

    const lote = () => {
      const fin = Math.min(i + paso, total);
      for (; i < fin; i++) {
        const d = datos[i];
        if (d && d.indicativo) {
          const coords = indiceCoords[normalizar(d.comuna)];
          if (!coords) { sinUbicacion++; continue; }
          const cat = categoriaDe(d);
          const propio = esPropio(d);
          const m = L.circleMarker([coords.lat, coords.lng], {
            radius: 6,
            color: '#ffffff',
            weight: 1.5,
            fillColor: propio ? COLOR_PROPIO : (COLORES[cat] || '#6b7280'),
            fillOpacity: 0.9
          });
          m.bindPopup(construirPopup(d, cat, propio));
          m.bindTooltip(construirPopup(d, cat, propio), {
            direction: 'top',
            offset: [0, -6],
            opacity: 1
          });
          m.dato = d;
          m.cat = cat;
          marcadores.push(m);
          conteo[cat]++;
          if (d.region) regiones.add(d.region);
        }
      }
      if (i < total) {
        contenedorEstado.textContent = 'Procesando base de datos... ' + Math.round(i / total * 100) + '%';
        setTimeout(lote, 0);
      } else {
        llenarControles(conteo, regiones);
        aplicarFiltros();
        contenedorEstado.textContent = marcadores.length + ' radioaficionados ubicados en el mapa.';
      }
    };
    lote();
  }

  function llenarControles(conteo, regiones) {
    botonesCategoria.forEach((b) => {
      const cat = b.getAttribute('data-cat');
      b.textContent = cat + ' (' + (conteo[cat] || 0) + ')';
    });
    const orden = ORDEN_REGIONES.slice();
    const nombres = Array.from(regiones).sort((a, b) => {
      const ia = orden.indexOf(a);
      const ib = orden.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
    nombres.forEach((r) => {
      const op = document.createElement('option');
      op.value = r;
      op.textContent = r;
      selectRegion.appendChild(op);
    });
  }

  function aplicarFiltros() {
    if (!grupo) return;
    grupo.clearLayers();
    let visibles = 0;
    for (const m of marcadores) {
      if (!estado.categoria[m.cat]) continue;
      if (estado.region && m.dato.region !== estado.region) continue;
      grupo.addLayer(m);
      visibles++;
    }
    contenedorTotal.textContent = visibles;
  }

  function buscar() {
    const q = normalizar(inputBusqueda.value.trim());
    if (!q) {
      aplicarFiltros();
      restablecerVista();
      contenedorEstado.textContent = marcadores.length + ' radioaficionados ubicados en el mapa.';
      return;
    }
    const coincidencias = marcadores.filter((m) =>
      normalizar(m.dato.indicativo).indexOf(q) !== -1 ||
      normalizar(m.dato.nombre).indexOf(q) !== -1 ||
      normalizar(m.dato.comuna).indexOf(q) !== -1
    ).slice(0, LIMITE_BUSQUEDA);

    if (!coincidencias.length) {
      contenedorEstado.textContent = 'No se encontró "' + inputBusqueda.value.trim() + '" en la base de datos.';
      return;
    }
    grupo.clearLayers();
    coincidencias.forEach((m) => grupo.addLayer(m));
    contenedorTotal.textContent = coincidencias.length;

    if (coincidencias.length === 1) {
      const m = coincidencias[0];
      mapa.flyTo(m.getLatLng(), 13);
      setTimeout(() => m.openPopup(), 650);
      contenedorEstado.textContent = 'Resultado único para "' + inputBusqueda.value.trim() + '".';
    } else {
      contenedorEstado.textContent = coincidencias.length + ' coincidencias para "' + inputBusqueda.value.trim() + '".';
      try {
        mapa.fitBounds(L.featureGroup(coincidencias).getBounds(), { padding: [40, 40], maxZoom: 9 });
      } catch (e) { /* sin ajuste */ }
    }
  }

  async function arrancar() {
    if (!iniciarMapa()) {
      contenedorEstado.textContent = 'No se pudo iniciar el mapa.';
      return;
    }
    grupo = L.markerClusterGroup({
      maxClusterRadius: 50,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true
    });
    mapa.addLayer(grupo);

    botonesCategoria.forEach((b) => {
      b.addEventListener('click', () => {
        const cat = b.getAttribute('data-cat');
        estado.categoria[cat] = !estado.categoria[cat];
        b.classList.toggle('active', estado.categoria[cat]);
        b.setAttribute('aria-pressed', String(estado.categoria[cat]));
        aplicarFiltros();
      });
    });

    selectRegion.addEventListener('change', () => {
      estado.region = selectRegion.value;
      aplicarFiltros();
    });

    let temporizador = null;
    inputBusqueda.addEventListener('input', () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(buscar, 300);
    });
    inputBusqueda.addEventListener('search', buscar);

    try {
      await cargarDatos({ silencioso: !!cargarCache() });
      construirMarcadores(datosActuales || []);
    } catch (e) {
      contenedorEstado.textContent = 'Error cargando la base: ' + (e.message || e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }
})();
