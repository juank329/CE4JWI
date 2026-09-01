// Ranking EN VIVO de la actividad "Septiembre Mes de la Patria 2026" (CE4JWI).
// Lee el ADIF que el bot publica por FTP en qsl.net en tiempo real, de modo que
// cada contacto nuevo que se suma al ADIF va apareciendo automaticamente.
// Colores de la tabla: tricolor blanco/azul/rojo (bandera de Chile) en la pagina.

const ADIF_URL = "https://qsl.net/ce4jwi/log_patria.adi";

function formatearFecha(qsoDate) {
  if (!qsoDate || qsoDate.length !== 8) return "";
  return qsoDate.slice(6, 8) + "/" + qsoDate.slice(4, 6) + "/" + qsoDate.slice(0, 4);
}

function formatearHora(timeOn) {
  if (!timeOn || timeOn.length < 4) return "";
  return timeOn.slice(0, 2) + ":" + timeOn.slice(2, 4);
}

function parseAdif(texto) {
  const registros = [];
  const partes = String(texto).split(/<EOR>/i).filter(function (p) {
    return p.indexOf("<CALL:") !== -1;
  });
  partes.forEach(function (bloque) {
    const campo = function (nombre) {
      const re = new RegExp("<" + nombre + ":\\d+>([^<]*)", "i");
      const m = bloque.match(re);
      return m ? m[1].trim() : "";
    };
    const call = campo("CALL").toUpperCase();
    if (!call) return;
    registros.push({
      call: call,
      qso_date: campo("QSO_DATE"),
      time_on: campo("TIME_ON"),
    });
  });
  return registros;
}

function construirRanking(registros) {
  const mapa = {};
  registros.forEach(function (r) {
    if (!mapa[r.call]) {
      mapa[r.call] = { call: r.call, contactos: 0, qso_date: "", time_on: "" };
    }
    mapa[r.call].contactos += 1;
    const t = r.qso_date + r.time_on;
    const anterior = mapa[r.call].qso_date + mapa[r.call].time_on;
    if (t >= anterior) {
      mapa[r.call].qso_date = r.qso_date;
      mapa[r.call].time_on = r.time_on;
    }
  });
  const filas = Object.keys(mapa).map(function (k) {
    const f = mapa[k];
    return {
      call: f.call,
      contactos: f.contactos,
      ultima: {
        fecha: formatearFecha(f.qso_date),
        hora: formatearHora(f.time_on),
      },
    };
  });
  filas.sort(function (a, b) {
    return b.contactos - a.contactos || a.call.localeCompare(b.call);
  });
  return filas;
}

function handler(req, res) {
  return fetch(ADIF_URL)
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    })
    .then(function (texto) {
      const filas = construirRanking(parseAdif(texto));
      const total = filas.reduce(function (acc, f) {
        return acc + f.contactos;
      }, 0);
      res.setHeader("Cache-Control", "public, max-age=30, s-maxage=60");
      res.status(200).json({
        ok: true,
        actividad: "septiembre-patro",
        totalContactos: total,
        participantes: filas.length,
        filas: filas,
        congelado: false,
        actualizado: new Date().toISOString(),
      });
    })
    .catch(function (e) {
      res.status(502).json({
        ok: false,
        error: "no se pudo leer el ADIF del bot",
        detalle: String(e),
      });
    });
}

module.exports = handler;
