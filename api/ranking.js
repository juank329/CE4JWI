// Ranking definitivo de la actividad Talca 2026 (resultado fijado al cierre).
// Fuente inamovible: los ADIF congelados en /ranking-data/talca/ de este mismo
// repo (git = copia permanente). No depende de qsl.net ni de Supabase en vivo,
// por lo que la tabla ya NO cambia ni se pierde aunque los bots sigan corriendo.

const RAW_BASE = "https://raw.githubusercontent.com/juank329/CE4JWI/main/ranking-data/talca";

const FUENTES = {
  talca: {
    estaciones: [
      { clave: "CE4JWI", indicativo: "CE4JWI", url: RAW_BASE + "/log_ce4jwi.adi" },
      { clave: "XR4MAU", indicativo: "XR4MAU", url: RAW_BASE + "/log_talca.adi" },
    ],
  },
};

// QSL manuales de la actividad (DMR/DV), congeladas al cierre en /
// ranking-data/talca/manuales.json (respaldo permanente de Supabase).
const MANUALES = {
  url: RAW_BASE + "/manuales.json",
  estaciones: ["CE4JWI", "XR4MAU"],
};

function normalizarModo(m) {
  const mm = String(m || "").toUpperCase();
  if (mm === "DIGITALVOICE") return "DV";
  if (mm === "PKT") return "APRS";
  return mm;
}

async function leerManuales() {
  try {
    const r = await fetch(MANUALES.url, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const filas = await r.json();
    const qsos = (Array.isArray(filas) ? filas : [])
      .filter((f) => f && f.callsign)
      .map((f) => ({ call: String(f.callsign).toUpperCase(), modo: normalizarModo(f.modo) }));
    return { qsos, error: null };
  } catch (e) {
    return { qsos: [], error: String(e) };
  }
}

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

  // QSL manuales (DMR/DV) congeladas: cada QSO cuenta como contacto de ambas estaciones.
  const sup = await leerManuales();
  for (const q of sup.qsos) {
    if (cfg.estaciones.some((s) => s.indicativo === q.call)) continue;
    if (!porCall.has(q.call)) {
      porCall.set(q.call, { call: q.call, contactos: 0, modos: [], estaciones: [] });
    }
    const f = porCall.get(q.call);
    for (const clave of MANUALES.estaciones) {
      f.contactos += 1;
      if (!f.modos.includes(q.modo)) f.modos.push(q.modo);
      if (!f.estaciones.includes(clave)) f.estaciones.push(clave);
    }
  }

  const filas = [...porCall.values()].sort(
    (a, b) => b.contactos - a.contactos || a.call.localeCompare(b.call)
  );

  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120");
  res.status(200).json({
    ok: true,
    actividad,
    actualizado: "2026-08-30T23:59:59-04:00",
    totalContactos: filas.reduce((s, f) => s + f.contactos, 0),
    participantes: filas.length,
    filas,
    fuentes: resultados.map((r) => ({
      estacion: r.estacion.clave,
      url: r.estacion.url,
      qsos: r.qsos.length,
      error: r.error || null,
    })),
    supabase: { qsos: sup.qsos.length, error: sup.error },
  });
}

module.exports = handler;