// Ranking DEFINITIVO de la actividad "Juegos Tradicionales de Fiestas Patrias en Chile" (CE4JWI).
// Resultado CONGELADO al cierre de la actividad.
// Fuente inamovible: ranking-data/juegos/final.json de este mismo repo
// (git = copia permanente). No depende del ADIF externo de qsl.net ni se borra.
// Incluye el detalle de los 6 juegos (El Trompo, El Emboque, Palo Ensebado,
// Carreras en Saco, Tirar la Cuerda y Elevar Volantines).

const fs = require("fs");
const path = require("path");

const FINAL_PATH = path.join(__dirname, "..", "ranking-data", "juegos", "final.json");

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
    actividad: datos.actividad || "juegos-tradicionales-fiestas-patrias",
    actualizado: datos.actualizado,
    totalContactos: datos.totalContactos,
    participantes: datos.participantes,
    juegos: datos.juegos || [],
    filas: datos.filas || [],
    congelado: true,
    fuentes: datos.fuentes || [],
  });
}

module.exports = handler;