// Ranking DEFINITIVO de las actividades congeladas del sitio.
// Fuente inamovible: el ranking-data/<actividad>/final.json de este mismo repo
// (git = copia permanente). Se sirve como estatico del propio sitio, por lo que
// la tabla NO cambia ni se pierde y NO depende de los ADIF del bot ni de qsl.net.
// Esto permite borrar los ADIF (log_*.adi) sin afectar el ranking.

const fs = require("fs");
const path = require("path");

const RANKING_DIR = {
  talca: { final: "final.json" },
  agosto: { final: "final.json" },
};

function leerFinal(actividad) {
  try {
    const cfg = RANKING_DIR[actividad];
    if (!cfg) return null;
    const ruta = path.join(__dirname, "..", "ranking-data", actividad, cfg.final);
    return JSON.parse(fs.readFileSync(ruta, "utf8"));
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

function handler(req, res) {
  const actividad = String(req.query.actividad || "talca").toLowerCase();
  const datos = leerFinal(actividad);
  if (!datos || !datos.ok) {
    res.status(404).json({ ok: false, error: "ranking no disponible", detalle: datos && datos.error });
    return;
  }
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
  res.status(200).json({
    ok: true,
    actividad: datos.actividad || actividad,
    actualizado: datos.actualizado,
    totalContactos: datos.totalContactos,
    participantes: datos.participantes,
    filas: datos.filas || [],
    fuentes: datos.fuentes || [],
    manuales: datos.manuales || null,
    congelado: true,
  });
}

module.exports = handler;
