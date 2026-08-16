/**
 * Mapa APRS Chile - CE4JWI
 * - Mapa Leaflet con estaciones APRS de indicativos chilenos en la red APRS-IS
 * - Datos de api.aprs.world (via proxy CORS) con respaldo en iframe de aprs.fi
 */
(function () {
  'use strict';

  const contenedorMapa = document.getElementById('aprsMap');
  const contenedorLista = document.getElementById('aprsLista');
  const contenedorEstado = document.getElementById('aprsEstado');
  const contenedorResumen = document.getElementById('aprsResumen');
  const contenedorFallback = document.getElementById('aprsFallback');
  const contenedorMensajesChat = document.getElementById('aprsMensajesChat');
  const contenedorMensajesEstado = document.getElementById('aprsMensajesEstado');
  const botonesFiltroMsj = document.querySelectorAll('#aprsMensajes button[data-filtro]');
  if (!contenedorMapa || !contenedorLista || !contenedorEstado || !contenedorResumen || !contenedorFallback) return;

  const CENTROS = [
    { lat: -23.6, lng: -70.4, r: 600 },
    { lat: -33.45, lng: -70.66, r: 550 },
    { lat: -41.5, lng: -73.0, r: 550 },
    { lat: -53.1, lng: -70.9, r: 600 }
  ];

  const PREFIJOS = /^(CA|CD|CE|XQ|XR|CB|3G)/i;

  const PROXIES = [
    (u) => 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u),
    (u) => 'https://api.allorigins.win/get?url=' + encodeURIComponent(u),
    (u) => 'https://test.cors.workers.dev/?' + u,
    (u) => 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(u)
  ];

  const COLORES = {
    fixed: '#1a4d8f',
    igate: '#1e8e3e',
    digipeater: '#e08a00',
    mobile: '#d64541',
    weather: '#7d3bd2'
  };

  const ETIQUETAS = {
    fixed: 'Fija',
    igate: 'iGate',
    digipeater: 'Digipeater',
    mobile: 'Móvil',
    weather: 'Meteo'
  };

  const COLOR_DEFECTO = '#6b7280';
  const ETIQUETA_DEFECTO = 'Otro';
  const LIMITE_LISTA = 250;
  const LIMITE_MSJ = 100;
  const INTERVALO_MSJ = 20000;

  const since = 720;
  let mapa = null;
  let marcadores = [];
  let cargando = false;

  const mensajes = {
    items: [],
    vistos: {},
    filtro: 'chile',
    cargando: false,
    ultimoRender: 0
  };

  function escapar(texto) {
    return String(texto == null ? '' : texto)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function aFecha(valor) {
    if (valor == null || valor === '') return null;
    if (typeof valor === 'number') return new Date(valor * 1000);
    if (typeof valor === 'string' && /^\d+$/.test(valor)) return new Date(parseInt(valor, 10) * 1000);
    const d = new Date(valor);
    return isNaN(d.getTime()) ? null : d;
  }

  function hace(fecha) {
    if (!fecha) return 'fecha desconocida';
    const seg = Math.round((Date.now() - fecha.getTime()) / 1000);
    if (seg < 60) return 'hace menos de 1 min';
    const min = Math.round(seg / 60);
    if (min < 60) return 'hace ' + min + ' min';
    const h = Math.round(min / 60);
    if (h < 24) return 'hace ' + h + ' h';
    return 'hace ' + Math.round(h / 24) + ' días';
  }

  function fetchConTimeout(url, ms) {
    const controlador = 'AbortController' in window ? new AbortController() : null;
    const promesa = fetch(url, controlador ? { signal: controlador.signal } : {});
    const temporizador = setTimeout(() => { if (controlador) controlador.abort(); }, ms);
    return promesa.finally(() => clearTimeout(temporizador));
  }

  const anyPromesa = typeof Promise.any === 'function'
    ? Promise.any.bind(Promise)
    : (arr) => new Promise((res, rej) => {
        let pendientes = arr.length;
        if (!pendientes) { rej(new Error('Sin peticiones')); return; }
        arr.forEach((p) => Promise.resolve(p).then(res, () => { if (--pendientes === 0) rej(new Error('Todas las peticiones fallaron')); }));
      });

  async function obtenerJson(url, clave, ms) {
    let ultimoError = null;
    for (let intento = 0; intento < 2; intento++) {
      const promesas = PROXIES.map((proxy) =>
        fetchConTimeout(proxy(url), ms).then(async (res) => {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const texto = await res.text();
          let datos = null;
          try { datos = JSON.parse(texto); } catch (e) { throw e; }
          if (datos && typeof datos.contents === 'string') {
            try { datos = JSON.parse(datos.contents); } catch (e) { throw e; }
          }
          if (datos && Array.isArray(datos[clave]) && datos[clave].length) return datos[clave];
          throw new Error('Respuesta sin ' + clave);
        }).catch((e) => { ultimoError = e; throw e; })
      );
      try { return await anyPromesa(promesas); } catch (e) { /* todas fallaron */ }
      if (intento === 0) await new Promise((r) => setTimeout(r, 500));
    }
    throw ultimoError;
  }

  async function pedirCentro(centro) {
    const api = 'https://api.aprs.world/api/stations/around?lat=' + centro.lat + '&lng=' + centro.lng + '&radius_km=' + centro.r + '&since=' + since;
    return obtenerJson(api, 'stations', 12000);
  }

  function procesar(lista) {
    const vistos = {};
    for (const s of lista) {
      if (!s) continue;
      if (typeof s.lat !== 'number' || typeof s.lon !== 'number') continue;
      if (!PREFIJOS.test(s.callsign || '')) continue;
      const prev = vistos[s.callsign];
      if (!prev) { vistos[s.callsign] = s; continue; }
      const fechaActual = aFecha(s.last_seen);
      const fechaPrev = aFecha(prev.last_seen);
      if (fechaActual && (!fechaPrev || fechaActual.getTime() > fechaPrev.getTime())) vistos[s.callsign] = s;
    }
    const resultado = Object.keys(vistos).map((k) => vistos[k]);
    resultado.sort((a, b) => {
      const fa = aFecha(a.last_seen);
      const fb = aFecha(b.last_seen);
      return (fb ? fb.getTime() : 0) - (fa ? fa.getTime() : 0);
    });
    return resultado;
  }

  function iniciarMapa() {
    if (mapa) return mapa;
    if (!window.L || !window.L.map) return null;
    mapa = L.map(contenedorMapa, {
      center: [-35.5, -70.6],
      zoom: 5,
      scrollWheelZoom: false
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
    }).addTo(mapa);
    try {
      mapa.fitBounds([[-56.8, -76.8], [-16.9, -64.8]], { padding: [16, 16] });
    } catch (e) { /* sin ajuste */ }
    return mapa;
  }

  const colorDe = (tipo) => COLORES[tipo] || COLOR_DEFECTO;
  const etiquetaDe = (tipo) => ETIQUETAS[tipo] || ETIQUETA_DEFECTO;

  function construirPopup(s) {
    const fecha = aFecha(s.last_seen);
    let html = '<strong>' + escapar(s.callsign) + '</strong>';
    html += '<br><span>' + escapar(etiquetaDe(s.station_type)) + ' · ' + escapar(hace(fecha)) + '</span>';
    if (s.comment) html += '<br><span class="aprs-pop-com">' + escapar(s.comment) + '</span>';
    if (typeof s.speed_kmh === 'number') html += '<br>Velocidad: ' + Math.round(s.speed_kmh) + ' km/h';
    if (typeof s.course_deg === 'number') html += ' · Rumbo: ' + Math.round(s.course_deg) + '°';
    if (typeof s.altitude_m === 'number') html += '<br>Altitud: ' + Math.round(s.altitude_m) + ' m';
    if (s.last_path) html += '<br><span class="aprs-pop-path">' + escapar(s.last_path) + '</span>';
    return html;
  }

  function renderizar(estaciones) {
    if (!mapa) return;
    for (const m of marcadores) mapa.removeLayer(m);
    marcadores = [];

    estaciones.forEach((s) => {
      const m = L.circleMarker([s.lat, s.lon], {
        radius: 7,
        color: '#ffffff',
        weight: 1.5,
        fillColor: colorDe(s.station_type),
        fillOpacity: 0.9
      });
      m.bindPopup(construirPopup(s));
      m.on('click', () => m.openPopup());
      m.addTo(mapa);
      marcadores.push(m);
    });

    contenedorLista.innerHTML = '';
    const limite = Math.min(LIMITE_LISTA, estaciones.length);
    for (let i = 0; i < limite; i++) {
      const s = estaciones[i];
      const fecha = aFecha(s.last_seen);
      const item = document.createElement('div');
      item.className = 'aprs-item';
      item.tabIndex = 0;
      item.setAttribute('role', 'button');
      item.innerHTML =
        '<div class="aprs-item-cabecera">' +
        '<span class="aprs-item-call">' + escapar(s.callsign) + '</span>' +
        '<span class="aprs-item-cuando">' + escapar(hace(fecha)) + '</span>' +
        '</div>' +
        '<div class="aprs-item-tipo">' + escapar(etiquetaDe(s.station_type)) + '</div>' +
        (s.comment ? '<div class="aprs-item-comentario">' + escapar(s.comment) + '</div>' : '');
      const abrir = () => {
        if (marcadores[i]) {
          mapa.flyTo([s.lat, s.lon], Math.max(mapa.getZoom(), 10));
          marcadores[i].openPopup();
        }
      };
      item.addEventListener('click', abrir);
      item.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); abrir(); }
      });
      contenedorLista.appendChild(item);
    }

    const horas = Math.round(since / 60);
    let texto = estaciones.length + ' colega' + (estaciones.length === 1 ? '' : 's') + ' chileno' + (estaciones.length === 1 ? '' : 's') + ' en APRS durante las últimas ' + horas + ' h';
    if (estaciones.length > limite) texto += ' (mostrando las ' + limite + ' más recientes)';
    contenedorResumen.textContent = texto;
    contenedorResumen.hidden = false;
  }

  function activarFallback() {
    contenedorFallback.hidden = false;
    contenedorMapa.style.display = 'none';
    contenedorLista.style.display = 'none';
    const seg = Math.max(since * 60, 1800);
    contenedorFallback.innerHTML =
      '<div class="aviso"><span class="etiqueta">MAPA DE RESPALDO</span>' +
      '<p>El proveedor de datos APRS está intermitente en este momento. Se muestra el mapa mundial de <a href="https://aprs.fi" target="_blank" rel="noopener">aprs.fi</a> centrado en Chile mientras tanto. Recarga la página en unos minutos para reintentar el mapa propio.</p></div>' +
      '<div class="aprs-mapa-aprsfi"><iframe src="https://aprs.fi/#!lat=-33.45&amp;lng=-70.66&amp;z=6&amp;timerange=' + seg + '" loading="lazy" title="Mapa APRS de respaldo (aprs.fi)"></iframe></div>';
  }

  function desactivarFallback() {
    contenedorFallback.hidden = true;
    contenedorFallback.innerHTML = '';
    contenedorMapa.style.display = '';
    contenedorLista.style.display = '';
  }

  async function cargar() {
    if (cargando) return;
    desactivarFallback();
    cargando = true;
    contenedorEstado.textContent = 'Cargando estaciones APRS de Chile...';

    let total = [];
    const cola = CENTROS.slice();
    const n = Math.min(2, cola.length);
    const trabajador = async () => {
      while (cola.length) {
        const centro = cola.shift();
        try {
          const estaciones = await pedirCentro(centro);
          if (estaciones.length) {
            total = total.concat(estaciones);
            renderizar(procesar(total));
          }
        } catch (e) { /* continúa con la siguiente zona */ }
      }
    };
    await Promise.all(Array.from({ length: n }, () => trabajador()));

    if (total.length) {
      contenedorEstado.textContent = 'Mapa actualizado con datos de la red APRS-IS.';
      renderizar(procesar(total));
    } else {
      contenedorEstado.textContent = 'No se pudieron obtener los datos ahora.';
      activarFallback();
    }
    cargando = false;
  }

  async function pedirMensajes() {
    return obtenerJson('https://api.aprs.world/api/messages/recent?limit=20', 'messages', 12000);
  }

  function esChilenoMsj(m) {
    return PREFIJOS.test(m.from_call || '') || PREFIJOS.test(m.to_call || '');
  }

  function esMsjPropio(m) {
    const de = String(m.from_call || '').toUpperCase();
    const para = String(m.to_call || '').toUpperCase();
    return de === 'CE4JWI' || para === 'CE4JWI';
  }

  function enlazarUrls(texto) {
    const escapado = escapar(texto);
    return escapado.replace(/(https?:\/\/[^\s<>"']+)/g, (url) => {
      const limpio = url.replace(/[.,;:!?]+$/, '');
      return '<a href="' + limpio + '" target="_blank" rel="noopener">' + limpio + '</a>';
    });
  }

  function formatearHora(fechaISO) {
    const d = aFecha(fechaISO);
    if (!d) return '--:--:--';
    return d.toLocaleTimeString('es-CL', { hour12: false });
  }

  function renderizarMensajes() {
    if (!contenedorMensajesChat) return;
    const lista = mensajes.items.filter((m) => mensajes.filtro === 'todos' || esChilenoMsj(m));
    const visibles = lista.slice(0, LIMITE_MSJ);
    const cercaDeArriba = contenedorMensajesChat.scrollTop < 80;

    contenedorMensajesChat.innerHTML = '';
    if (!visibles.length) {
      const vacio = document.createElement('div');
      vacio.className = 'aprs-msg-vacio';
      vacio.textContent = mensajes.filtro === 'chile' ? 'No hay mensajes de indicativos chilenos en este momento.' : 'No hay mensajes en este momento.';
      contenedorMensajesChat.appendChild(vacio);
      return;
    }
    for (const m of visibles) {
      const fila = document.createElement('div');
      const propio = esMsjPropio(m);
      fila.className = 'aprs-msg' + (propio ? ' propio' : (esChilenoMsj(m) ? ' chilena' : ''));
      fila.innerHTML =
        '<div class="aprs-msg-cab">' +
        '<span class="aprs-msg-hora">' + formatearHora(m.time) + '</span>' +
        '<span class="aprs-msg-de">' + escapar(m.from_call) + '</span>' +
        '<span class="aprs-msg-flecha">→</span>' +
        '<span class="aprs-msg-para">' + escapar(m.to_call) + '</span>' +
        (propio ? '<span class="aprs-msg-etiqueta">Tu indicativo</span>' : '') +
        '</div>' +
        '<div class="aprs-msg-cuerpo">' + enlazarUrls(m.body) + '</div>';
      contenedorMensajesChat.appendChild(fila);
    }
    if (cercaDeArriba || mensajes.items.length <= mensajes.ultimoRender) {
      contenedorMensajesChat.scrollTop = 0;
    }
    mensajes.ultimoRender = mensajes.items.length;
  }

  async function actualizarMensajes() {
    if (mensajes.cargando) return;
    mensajes.cargando = true;
    if (contenedorMensajesEstado) contenedorMensajesEstado.textContent = 'Actualizando mensajes...';
    try {
      const lista = await pedirMensajes();
      let nuevos = 0;
      for (const m of lista) {
        const clave = m.id != null ? m.id : (m.time + '_' + m.from_call + '_' + m.body);
        if (!mensajes.vistos[clave]) {
          mensajes.vistos[clave] = true;
          mensajes.items.push(m);
          nuevos++;
        }
      }
      mensajes.items.sort((a, b) => {
        const fa = aFecha(a.time);
        const fb = aFecha(b.time);
        return (fb ? fb.getTime() : 0) - (fa ? fa.getTime() : 0);
      });
      if (mensajes.items.length > 300) mensajes.items = mensajes.items.slice(-300);
      if (contenedorMensajesEstado) {
        const hora = new Date().toLocaleTimeString('es-CL', { hour12: false });
        contenedorMensajesEstado.textContent = 'Actualizado ' + hora + ' · ' + (nuevos ? '+' + nuevos + ' nuevos' : 'sin mensajes nuevos');
      }
      renderizarMensajes();
    } catch (e) {
      if (contenedorMensajesEstado) contenedorMensajesEstado.textContent = 'Sin conexión al proveedor, reintentando...';
    } finally {
      mensajes.cargando = false;
      setTimeout(actualizarMensajes, INTERVALO_MSJ);
    }
  }

  function mapearFiltrosMensajes() {
    botonesFiltroMsj.forEach((boton) => {
      boton.addEventListener('click', () => {
        mensajes.filtro = boton.getAttribute('data-filtro');
        botonesFiltroMsj.forEach((b) => b.classList.remove('active'));
        boton.classList.add('active');
        renderizarMensajes();
      });
    });
  }

  function arrancar() {
    mapearFiltrosMensajes();
    if (contenedorMensajesChat) actualizarMensajes();
    if (!iniciarMapa()) {
      contenedorEstado.textContent = 'No se pudo iniciar el mapa.';
      activarFallback();
      return;
    }
    cargar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }
})();
