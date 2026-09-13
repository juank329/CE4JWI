// Ranking DEFINITIVO de la actividad "Día del Choripán en Chile 2026" (XR4MAU-10).
// Resultado CONGELADO al cierre de la actividad.
// Fuente inamovible: ranking-data/choripan/final.json de este mismo repo
// (git = copia permanente). No depende del ADIF externo de qsl.net ni se borra.

const fs = require("fs");
const path = require("path");

const FINAL_PATH = path.join(__dirname, "..", "ranking-data", "choripan", "final.json");

function leerFinal() {
  try {
    const raw = fs.readFileSync(FINAL_PATH, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

function handler(req, res) {
  const datos = leerFinal();
  if (!datos || !datos.ok) {
    res.status(500).json({ ok: false, error: "final.json no disponible", detalle: datos && datos.error });
    return;
  }
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
  res.status(200).json({
    ok: true,
    actividad: datos.actividad || "dia-del-choripan-2026",
    actualizado: datos.actualizado,
    totalContactos: datos.totalContactos,
    participantes: datos.participantes,
    filas: datos.filas || [],
    congelado: true,
    fuentes: datos.fuentes || [],
  });
}

module.exports = handler;