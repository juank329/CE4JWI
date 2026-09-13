// Ranking GENERAL de indicativos mas contactados, sumando todas las actividades.
// Dos fuentes:
//   1. Congeladas: los ranking-data/<actividad>/final.json de este mismo repo
//      (git = copia permanente, no dependen del bot ni de qsl.net).
//   2. En vivo: los ADIF que los bots suben a qsl.net para las actividades
//      vigentes (juegos, hitos-rio, log general CE4JWI).
// Cada linea <CALL:..> de un ADIF = 1 QSO en esa actividad. Se suma por
// indicativo cuantas veces ha contactado a lo largo de TODAS las actividades.

const fs = require("fs");
const path = require("path");

const BASE = "https://qsl.net/ce4jwi";

// Actividades con ranking congelado (final.json permanente en el repo)
const CONGELADAS = ["talca", "agosto", "septiembre", "circo", "vino", "hitos-rio", "hitos-mina", "chilenidad", "choripan", "juegos", "hitos-casona", "hitos-parroquia"];

// Actividades en vivo: sus ADIF se leen en tiempo real
const VIVAS = [
  { base: BASE, adif: "log_ce4jwi.adi", actividad: "General CE4JWI" },
];

const PROPIAS = new Set(["CE4JWI", "XR4MAU"]);

function leerCongelada(actividad) {
  try {
    const ruta = path.join(__dirname, "..", "ranking-data", actividad, "final.json");
    const datos = JSON.parse(fs.readFileSync(ruta, "utf8"));
    if (!datos || !datos.ok || !Array.isArray(datos.filas)) return [];
    return datos.filas
      .map((f) => ({ call: f.call, puntos: Number(f.contactos || f.total || 0) }))
      .filter((f) => f.call && f.puntos > 0);
  } catch (e) {
    return [];
  }
}

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
      qsos.push({ call });
    }
    return qsos;
  } catch (e) {
    return [];
  }
}

function handler(req, res) {
  return (async () => {
    const porCall = new Map();

    // 1) Ranking congelados (copia permanente)
    for (const actividad of CONGELADAS) {
      for (const f of leerCongelada(actividad)) {
        if (!porCall.has(f.call)) porCall.set(f.call, { call: f.call, puntos: 0 });
        porCall.get(f.call).puntos += f.puntos;
      }
    }

    // 2) Actividades en vivo (ADIF en qsl.net)
    const resultados = await Promise.all(
      VIVAS.map(async (f) => ({ fuente: f, qsos: await leerAdif(f.base, f.adif) }))
    );

    for (const { qsos } of resultados) {
      for (const q of qsos) {
        if (!porCall.has(q.call)) porCall.set(q.call, { call: q.call, puntos: 0 });
        porCall.get(q.call).puntos += 1;
      }
    }

    const filas = [...porCall.values()].sort((a, b) => b.puntos - a.puntos || a.call.localeCompare(b.call));

    const ahora = new Date();
    const actualizado = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(ahora.getDate()).padStart(2, "0")}T${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}:00-04:00`;

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
      ok: true,
      nombre: "Indicativos mas contactados (todas las actividades)",
      actualizado,
      totalContactos: filas.reduce((s, f) => s + f.puntos, 0),
      participantes: filas.length,
      congeladas: CONGELADAS,
      vivas: VIVAS.map((f) => ({ adif: f.adif, actividad: f.actividad })),
      top: filas.slice(0, 20).map((f) => ({ call: f.call, puntos: f.puntos })),
    });
  })().catch((e) => {
    res.status(500).json({ ok: false, error: String(e) });
  });
}

module.exports = handler;