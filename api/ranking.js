// Ranking en vivo de las actividades CE4JWI / XR4MAU.
// Lee los ADIF que cada bot sube por FTP a su propio qsl.net tras cada QSO.

const FUENTES = {
  talca: {
    estaciones: [
      { clave: "CE4JWI", indicativo: "CE4JWI", url: "https://qsl.net/ce4jwi/log_ce4jwi.adi" },
      { clave: "XR4MAU", indicativo: "XR4MAU", url: "https://qsl.net/xr4mau/log_talca.adi" },
    ],
  },
};

function extraer(texto, campo) {
  const re = new RegExp("<" + campo + ":(\\d+)>([\\s\\S]*?)(?=<[A-Za-z_]+:|$)");
  const m = texto.match(re);
  return m ? m[2].trim() : null;
}

function parseADIF(txt) {
  const qsos = [];
  const bloques = String(txt || "").split(/<EOR>/g);
  for (const b of bloques) {
    const call = extraer(b, "CALL");
    if (!call) continue;
    qsos.push({
      call: call.toUpperCase(),
      modo: (extraer(b, "MODE") || "PKT").toUpperCase(),
      estacion: (extraer(b, "STATION_CALLSIGN") || "").toUpperCase(),
    });
  }
  return qsos;
}

async function handler(req, res) {
  const actividad = String(req.query.actividad || "talca").toLowerCase();
  const cfg = FUENTES[actividad];
  if (!cfg) {
    res.status(404).json({ ok: false, error: "actividad no encontrada" });
    return;
  }

  const control = AbortSignal.timeout(8000);
  const resultados = await Promise.all(
    cfg.estaciones.map(async (estacion) => {
      try {
        const r = await fetch(estacion.url, { signal: control });
        if (!r.ok) throw new Error("HTTP " + r.status);
        return { estacion, qsos: parseADIF(await r.text()) };
      } catch (e) {
        return { estacion, qsos: [], error: String(e) };
      }
    })
  );

  const porCall = new Map();
  for (const { estacion, qsos } of resultados) {
    for (const q of qsos) {
      if (cfg.estaciones.some((s) => s.indicativo === q.call)) continue;
      if (!porCall.has(q.call)) {
        porCall.set(q.call, { call: q.call, contactos: 0, modos: [], estaciones: [] });
      }
      const f = porCall.get(q.call);
      f.contactos += 1;
      if (!f.modos.includes(q.modo)) f.modos.push(q.modo);
      if (!f.estaciones.includes(estacion.clave)) f.estaciones.push(estacion.clave);
    }
  }

  const filas = [...porCall.values()].sort(
    (a, b) => b.contactos - a.contactos || a.call.localeCompare(b.call)
  );

  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120");
  res.status(200).json({
    ok: true,
    actividad,
    actualizado: new Date().toISOString(),
    totalContactos: filas.reduce((s, f) => s + f.contactos, 0),
    participantes: filas.length,
    filas,
    fuentes: resultados.map((r) => ({
      estacion: r.estacion.clave,
      url: r.estacion.url,
      qsos: r.qsos.length,
      error: r.error || null,
    })),
  });
}

module.exports = handler;