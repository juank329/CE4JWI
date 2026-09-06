// Ranking GENERAL de indicativos mas contactados, sumando todas las actividades.
// Fuente: los ADIF que los bots suben a qsl.net (CE4JWI y XR4MAU).
// Cada linea <CALL:..> de un ADIF = 1 QSO en esa actividad. Se suma por indicativo
// cuantas veces ha contactado a lo largo de TODAS las actividades.

const FUENTES = [
  { base: "https://qsl.net/ce4jwi", adif: "log_palo_ensebado.adi", actividad: "El Palo Ensebado" },
  { base: "https://qsl.net/ce4jwi", adif: "log_carrera_saco.adi", actividad: "Carrera en Saco" },
  { base: "https://qsl.net/ce4jwi", adif: "log_trompo.adi", actividad: "El Trompo" },
  { base: "https://qsl.net/ce4jwi", adif: "log_emboque.adi", actividad: "El Emboque" },
  { base: "https://qsl.net/ce4jwi", adif: "log_tirar_cuerda.adi", actividad: "Tirar la Cuerda" },
  { base: "https://qsl.net/ce4jwi", adif: "log_ce4jwi.adi", actividad: "General CE4JWI" },
  { base: "https://qsl.net/xr4mau", adif: "log_circo.adi", actividad: "Dia del Circo" },
  { base: "https://qsl.net/xr4mau", adif: "log_vino.adi", actividad: "Vino Chileno" },
];

const PROPIAS = new Set(["CE4JWI", "XR4MAU"]);

async function leerAdif(base, nombre) {
  try {
    const res = await fetch(`${base}/${nombre}`);
    if (!res.ok) return [];
    const texto = await res.text();
    const lines = texto.split(/\r?\n/);
    const qsos = [];
    for (const linea of lines) {
      const m = linea.match(/<CALL:\d+>(\S+).*?<QSO_DATE:8>(\d{8}).*?<TIME_ON:6>(\d{6}).*?<EOR>/);
      if (!m) continue;
      const call = m[1].replace(/[-/].*$/, "").toUpperCase();
      if (PROPIAS.has(call)) continue;
      qsos.push({
        call,
        fecha: `${m[2].slice(6, 8)}/${m[2].slice(4, 6)}/${m[2].slice(0, 4)}`,
        hora: `${m[3].slice(0, 2)}:${m[3].slice(2, 4)}:${m[3].slice(4, 6)}`,
      });
    }
    return qsos;
  } catch (e) {
    return [];
  }
}

function handler(req, res) {
  return (async () => {
    const porCall = new Map();

    const resultados = await Promise.all(
      FUENTES.map(async (f) => ({ fuente: f, qsos: await leerAdif(f.base, f.adif) }))
    );

    for (const { fuente, qsos } of resultados) {
      for (const q of qsos) {
        if (!porCall.has(q.call)) {
          porCall.set(q.call, { call: q.call, puntos: 0, ultima: null });
        }
        const e = porCall.get(q.call);
        e.puntos += 1;
        const clave = q.fecha + " " + q.hora;
        if (!e.ultima || clave > e.ultima) e.ultima = clave;
      }
    }

    const filas = [...porCall.values()]
      .map((e) => ({ call: e.call, puntos: e.puntos, ultima: e.ultima }))
      .sort((a, b) => b.puntos - a.puntos || (b.ultima || "").localeCompare(a.ultima || ""));

    const ahora = new Date();
    const actualizado = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(ahora.getDate()).padStart(2, "0")}T${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}:00-04:00`;

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
      ok: true,
      nombre: "Indicativos mas contactados (todas las actividades)",
      actualizado,
      totalContactos: filas.reduce((s, f) => s + f.puntos, 0),
      participantes: filas.length,
      actividades: FUENTES.map((f) => ({ adif: f.adif, actividad: f.actividad })),
      top: filas.slice(0, 15).map((f) => ({ call: f.call, puntos: f.puntos })),
    });
  })().catch((e) => {
    res.status(500).json({ ok: false, error: String(e) });
  });
}

module.exports = handler;