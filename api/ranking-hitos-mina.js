// Ranking EN VIVO de la actividad "Hitos de Maule - Mina El Chivato" (CE4JWI).
// Solo APRS (PKT) a CE4JWI-10 con la frase MINA.
//
// Fuente de datos: el ADIF que el bot sube automaticamente a qsl.net:
//   https://qsl.net/ce4jwi/log_mina.adi
//
// Cada linea con <CALL:..> de ese ADIF = un QSO del Hito Mina El Chivato. El
// ranking se lee en tiempo real, por lo que cada contacto nuevo aparece apenas
// el bot sube el ADIF.

const BASE = "https://qsl.net/ce4jwi";

const ADIF = "log_mina.adi";

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
      const call = m[1].replace(/[-/].*$/, "").toUpperCase();
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
      actividad: "hitos-de-maule-mina-el-chivato",
      nombre: "Hitos de Maule - Mina El Chivato 2026",
      actualizado,
      totalContactos: filas.reduce((s, f) => s + f.total, 0),
      participantes: filas.length,
      filas,
      congelado: false,
    });
  })().catch((e) => {
    res.status(500).json({ ok: false, error: String(e) });
  });
}

module.exports = handler;