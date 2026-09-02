// Ranking DEFINITIVO de la actividad "Septiembre Mes de la Patria 2026" (CE4JWI).
// Resultado CONGELADO al cierre de la actividad.
// Fuente inamovible: ranking-data/septiembre/final.json de este mismo repo
// (git = copia permanente), igual que los rankings de Talca y Agosto.
// Solo contactos APRS (PKT) de la estacion CE4JWI. No depende del ADIF externo
// ni se borra. Colores tricolor blanco/azul/rojo en la pagina.

const fs = require("fs");
const path = require("path");

const FINAL_PATH = path.join(__dirname, "..", "ranking-data", "septiembre", "final.json");

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
    actividad: datos.actividad || "septiembre-patria",
    actualizado: datos.actualizado,
    totalContactos: datos.totalContactos,
    participantes: datos.participantes,
    filas: datos.filas || [],
    congelado: true,
    fuentes: datos.fuentes || [],
  });
}

module.exports = handler;
