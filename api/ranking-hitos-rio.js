// Ranking DEFINITIVO de la actividad "Hitos de Maule - Río Maule" (CE4JWI-10).
// La actividad TERMINO: el ranking queda CONGELADO desde el final.json de este
// mismo repo (ranking-data/hitos-rio/final.json), copia permanente en git que ya
// no depende del ADIF de qsl.net (log_rio.adi), por lo que los contactos no se
// borran ni cambian.

const fs = require("fs");
const path = require("path");

const FINAL_PATH = path.join(__dirname, "..", "ranking-data", "hitos-rio", "final.json");

function handler(req, res) {
  try {
    const datos = JSON.parse(fs.readFileSync(FINAL_PATH, "utf8"));
    if (!datos || !datos.ok) throw new Error("final.json invalido");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
    res.status(200).json({
      ok: true,
      actividad: datos.actividad || "hitos-de-maule-rio-maule",
      nombre: datos.nombre || "Hitos de Maule - Río Maule 2026",
      actualizado: datos.actualizado,
      totalContactos: datos.totalContactos,
      participantes: datos.participantes,
      filas: datos.filas || [],
      congelado: true,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: "final.json no disponible", detalle: String(e) });
  }
}

module.exports = handler;