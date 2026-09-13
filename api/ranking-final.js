// Ranking DEFINITIVO/consolidado de todas las actividades CERRADAS.
//
// Sirve el final.json (copia permanente en git) de cualquier actividad
// congelada mediante ?actividad=<clave>. Consolida en UNA funcion todas
// las actividades terminadas (talca, agosto, septiembre, circo, vino,
// hitos-*, chilenidad, choripan, juegos) para mantenerse bajo el limite
// de 12 funciones serverless del plan Hobby de Vercel.
//
// REGLA PARA PROXIMAS ACTIVIDADES:
// 1. Mientras la actividad esta EN VIVO usa un endpoint dedicado (ej:
//    ranking-<nueva>.js) que lea su ADIF en qsl.net.
// 2. Al terminar la actividad: generar ranking-data/<clave>/final.json,
//    agregar un rewrite en vercel.json hacia /api/ranking-final?actividad=
//    y borrar el endpoint en vivo. Asi el total de funciones nunca crece.

const fs = require("fs");
const path = require("path");

function handler(req, res) {
  const actividad = (req.query && req.query.actividad) || "talca";
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