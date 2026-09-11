// Ranking de las actividades "Hitos de Maule" (CE4JWI) - endpoint consolidado.
//
// Este archivo reemplaza a los 4 endpoints individuales
// (ranking-hitos-mina/rio/casona/parroquia) para mantenerse bajo el límite de
// 12 funciones serverless del plan Hobby de Vercel. Las URLs antiguas se
// conservan mediante rewrites en vercel.json:
//   /api/ranking-hitos-mina      -> /api/ranking-hitos?actividad=mina
//   /api/ranking-hitos-rio       -> /api/ranking-hitos?actividad=rio
//   /api/ranking-hitos-casona    -> /api/ranking-hitos?actividad=casona
//   /api/ranking-hitos-parroquia -> /api/ranking-hitos?actividad=parroquia
//
// - mina y rio: actividades terminadas -> ranking CONGELADO desde el final.json
//   de este repo (independiente del ADIF de qsl.net).
// - casona y parroquia: EN VIVO -> el ADIF que el bot sube a qsl.net.

const fs = require("fs");
const path = require("path");

const BASE = "https://qsl.net/ce4jwi";

const ACTIVIDADES = {
  mina: {
    adif: "log_mina.adi",
    final: path.join(__dirname, "..", "ranking-data", "hitos-mina", "final.json"),
    congelado: true,
    fin: null,
  },
  rio: {
    adif: "log_rio.adi",
    final: path.join(__dirname, "..", "ranking-data", "hitos-rio", "final.json"),
    congelado: true,
    fin: null,
  },
  casona: {
    adif: "log_casona.adi",
    final: null,
    congelado: false,
    fin: "2026-09-10",
  },
  parroquia: {
    adif: "log_parroquia.adi",
    final: null,
    congelado: false,
    fin: "2026-09-11",
  },
};

function fechaVencida(cfg) {
  if (!cfg.fin) return false;
  const hoy = new Date().toISOString().slice(0, 10);
  return cfg.fin < hoy;
}

function servirCongelado(res, cfg) {
  const datos = JSON.parse(fs.readFileSync(cfg.final, "utf8"));
  if (!datos || !datos.ok) throw new Error("final.json invalido");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
  res.status(200).json({
    ok: true,
    actividad: datos.actividad || "hitos-de-maule",
    nombre: datos.nombre || "Hitos de Maule",
    actualizado: datos.actualizado,
    totalContactos: datos.totalContactos,
    participantes: datos.participantes,
    filas: datos.filas || [],
    congelado: true,
  });
}

async function servirEnVivo(res, cfg, congelado) {
  try {
    const resp = await fetch(`${BASE}/${cfg.adif}`);
    const texto = resp.ok ? await resp.text() : "";
    const qsos = [];
    for (const linea of texto.split(/\r?\n/)) {
      const m = linea.match(/<CALL:\d+>(\S+).*?<QSO_DATE:8>(\d{8}).*?<TIME_ON:6>(\d{6}).*?<EOR>/);
      if (!m) continue;
      const call = m[1].replace(/[-/].*$/, "").toUpperCase();
      const d = m[2];
      const h = m[3];
      qsos.push({
        call,
        fecha: `${d.slice(6, 8)}/${d.slice(4, 6)}/${d.slice(0, 4)}`,
        hora: `${h.slice(0, 2)}:${h.slice(2, 4)}:${h.slice(4, 6)}`,
      });
    }

    const porCall = new Map();
    for (const q of qsos) {
      if (!porCall.has(q.call)) {
        porCall.set(q.call, {
          call: q.call,
          total: 0,
          modos: ["PKT"],
          ultima: { fecha: "", hora: "" },
        });
      }
      const e = porCall.get(q.call);
      e.total += 1;
      const claveHora = [q.fecha, q.hora].join(" ");
      const ultimaClave = [e.ultima.fecha, e.ultima.hora].join(" ");
      if (!ultimaClave || claveHora > ultimaClave) {
        e.ultima = { fecha: q.fecha, hora: q.hora };
      }
    }

    const filas = [...porCall.values()].sort(
      (a, b) => b.total - a.total || (b.ultima.fecha + b.ultima.hora).localeCompare(a.ultima.fecha + a.ultima.hora)
    );

    const ahora = new Date();
    const actualizado = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(ahora.getDate()).padStart(2, "0")}T${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}:00-04:00`;

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
      ok: true,
      actividad: `hitos-de-maule-${cfg.adif.slice(4, -4)}`,
      nombre: `Hitos de Maule - ${cfg.adif.slice(4, -4)} 2026`,
      actualizado,
      totalContactos: filas.reduce((s, f) => s + f.total, 0),
      participantes: filas.length,
      filas,
      congelado: !!congelado,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
}

async function handler(req, res) {
  const actividad = req.query && req.query.actividad;
  const cfg = ACTIVIDADES[actividad];
  if (!cfg) {
    res.status(404).json({ ok: false, error: "actividad desconocida: " + actividad });
    return;
  }
  if (cfg.congelado || fechaVencida(cfg)) {
    if (cfg.final) {
      try {
        servirCongelado(res, cfg);
      } catch (e) {
        res.status(500).json({ ok: false, error: "final.json no disponible", detalle: String(e) });
      }
      return;
    }
    await servirEnVivo(res, cfg, true);
    return;
  }
  await servirEnVivo(res, cfg, false);
}

module.exports = handler;