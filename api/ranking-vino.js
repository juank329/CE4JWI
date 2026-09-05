// Ranking de la actividad "Dia Nacional del Vino Chileno" (XR4MAU).
// Solo APRS (PKT) a XR4MAU-7 con la frase VINO CHILENO.
//
// La actividad TERMINO: el ranking queda CONGELADO desde el final.json de este
// mismo repo (ranking-data/vino/final.json), copia permanente en git que ya no
// depende del ADIF de qsl.net (log_vino.adi), por lo que los contactos no se
// borran ni cambian.

const fs = require("fs");
const path = require("path");

const FINAL_PATH = path.join(__dirname, "..", "ranking-data", "vino", "final.json");

const BASE = "https://qsl.net/xr4mau";

const ADIF = "log_vino.adi";

async function leerAdif(nombre) {
  try {
    const res = await fetch(`${BASE}/${nombre}`);
    if (!res.ok) return [];
    const texto = await res.text();
    const lines = texto.split(/\r?\n/);
    const qsos = [];
    for (const linea of lines) {
      const m = linea.match(/<CALL:\d+>(\S+).*?<QSO_DATE:8>(\d{8}).*?<TIME_ON:6>(\d{6}).*?<EOR>/);
      if (!m) continue;
      const call = m[1].replace(/[-/]/g, "").toUpperCase();
      const d = m[2];
      const h = m[3];
      qsos.push({
        call,
        fecha: `${d.slice(6, 8)}/${d.slice(4, 6)}/${d.slice(0, 4)}`,
        hora: `${h.slice(0, 2)}:${h.slice(2, 4)}:${h.slice(4, 6)}`,
      });
    }
    return qsos;
  } catch (e) {
    return [];
  }
}

function handler(req, res) {
  return (async () => {
    let congelado = false;
    try {
      if (fs.existsSync(FINAL_PATH)) {
        const datos = JSON.parse(fs.readFileSync(FINAL_PATH, "utf8"));
        datos.congelado = true;
        congelado = true;
        res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
        res.status(200).json(datos);
        return;
      }
    } catch (e) {
      console.error("AVISO leyendo final.json del vino, usando ADIF en vivo:", e);
    }

    const qsos = await leerAdif(ADIF);
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
      actividad: "dia-nacional-del-vino-chileno",
      nombre: "Dia Nacional del Vino Chileno 2026",
      actualizado,
      totalContactos: filas.reduce((s, f) => s + f.total, 0),
      participantes: filas.length,
      filas,
      congelado: congelado,
    });
  })().catch((e) => {
    res.status(500).json({ ok: false, error: String(e) });
  });
}

module.exports = handler;