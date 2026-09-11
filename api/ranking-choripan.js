// Ranking EN VIVO de la actividad "Dia del Choripán en Chile 2026" (XR4MAU-10).
// Fuente: el ADIF que el bot XR4MAU-10 sube a qsl.net/xr4mau/log_choripan.adi.
// Cada contacto con la frase CHORIPAN suma 1 punto.

const BASE = "https://qsl.net/xr4mau";

async function handler(req, res) {
  try {
    const resp = await fetch(`${BASE}/log_choripan.adi`);
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
      actividad: "dia-del-choripan-2026",
      nombre: "Día del Choripán en Chile 2026",
      actualizado,
      totalContactos: filas.reduce((s, f) => s + f.total, 0),
      participantes: filas.length,
      filas,
      congelado: false,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
}

module.exports = handler;