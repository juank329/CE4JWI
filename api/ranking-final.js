// Ranking DEFINITIVO/consolidado de actividades cerradas.
//
// Sirve el final.json (copia permanente en git) de cualquier actividad
// congelada mediante ?actividad=<clave>. Reemplaza a los endpoints
// individuales ranking-chilenidad, ranking-choripan y ranking-juegos
// para mantenerse bajo el limite de 12 funciones serverless del plan
// Hobby de Vercel. Las URLs antiguas se conservan con rewrites en
// vercel.json (misma estrategia que ranking-hitos.js).

const fs = require("fs");
const path = require("path");

function handler(req, res) {
  const actividad = req.query && req.query.actividad;
  if (!actividad) {
    res.status(400).json({ ok: false, error: "falta ?actividad=" });
    return;
  }
  const ruta = path.join(__dirname, "..", "ranking-data", String(actividad), "final.json");
  let datos;
  try {
    datos = JSON.parse(fs.readFileSync(ruta, "utf8"));
  } catch (e) {
    res.status(500).json({ ok: false, error: "final.json no disponible", detalle: String(e) });
    return;
  }
  if (!datos || !datos.ok) {
    res.status(500).json({ ok: false, error: "final.json invalido" });
    return;
  }
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
  res.status(200).json({
    ok: true,
    actividad: datos.actividad || "actividad-cerrada",
    nombre: datos.nombre || "Actividad cerrada",
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