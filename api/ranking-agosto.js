// Ranking en tiempo real de la actividad "¡Pasamos Agosto!" (31-08-2026).
// Fuente VIVA: el ADIF que el bot CE4JWI sube automaticamente (tras cada QSO)
// al repo PUBLICO juank329/ce4jwi-qsls en /ranking-data/agosto/log_agosto.adi.
// Solo columna CE4JWI (los QSOs son APRS, estacion base CE4JWI).

const GITHUB_RAW = "https://raw.githubusercontent.com/juank329/ce4jwi-qsls/main";
const ADIF_URL = GITHUB_RAW + "/ranking-data/agosto/log_agosto.adi";
const FILTRO_ESTACION = "CE4JWI";

function normalizarModo(m) {
  const mm = String(m || "").toUpperCase();
  if (mm === "DIGITALVOICE") return "DV";
  if (mm === "PKT") return "APRS";
  return mm;
}

function extraer(texto, campo) {
  const re = new RegExp("<" + campo + ":(\\d+)>([\\s\\S]*?)(?=<[A-Za-z_]+:|$)");
  const m = texto.match(re);
  return m ? m[2].trim() : null;
}

function parseADIF(txt) {
  const qsos = [];
  const bloques = String(txt || "").split(/<EOR>/g);
  for (const b of bloques) {
    const call = extraer(b, "CALL");
    if (!call) continue;
    qsos.push({
      call: call.toUpperCase(),
      modo: (extraer(b, "MODE") || "PKT").toUpperCase(),
      estacion: (extraer(b, "STATION_CALLSIGN") || "").toUpperCase(),
      hora: extraer(b, "TIME_ON") || "",
      fecha: extraer(b, "QSO_DATE") || "",
    });
  }
  return qsos;
}

function formatearFechaHora(q) {
  const d = q.fecha || "";
  const h = q.hora || "";
  let fecha = "";
  if (d.length === 8) fecha = d.slice(6, 8) + "/" + d.slice(4, 6) + "/" + d.slice(0, 4);
  let hora = "";
  if (h.length === 6) hora = h.slice(0, 2) + ":" + h.slice(2, 4) + ":" + h.slice(4, 6);
  return { fecha, hora };
}

async function handler(req, res) {
  let qsos = [];
  let error = null;
  try {
    const r = await fetch(ADIF_URL, { signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw new Error("HTTP " + r.status);
    qsos = parseADIF(await r.text());
  } catch (e) {
    error = String(e);
    qsos = [];
  }

  const porCall = new Map();
  const totalCE4JWI = { total: 0 };
  for (const q of qsos) {
    if (!FILTRO_ESTACION || q.estacion === FILTRO_ESTACION) {
      if (!porCall.has(q.call)) {
        porCall.set(q.call, { call: q.call, contactos: 0, modos: [], ultima: { fecha: "", hora: "" } });
      }
      const f = porCall.get(q.call);
      f.contactos += 1;
      if (!f.modos.includes(q.modo)) f.modos.push(q.modo);
      const { fecha, hora } = formatearFechaHora(q);
      if (hora >= (f.ultima.hora || "")) f.ultima = { fecha, hora };
      totalCE4JWI.total += 1;
    }
  }

  const filas = [...porCall.values()].sort(
    (a, b) => b.contactos - a.contactos || (b.ultima.hora || "").localeCompare(a.ultima.hora || "")
      || a.call.localeCompare(b.call)
  );

  res.setHeader("Cache-Control", "public, max-age=30, s-maxage=60");
  res.status(200).json({
    ok: true,
    actividad: "agosto",
    fuente: ADIF_URL,
    actualizado: new Date().toISOString(),
    totalContactos: totalCE4JWI.total,
    participantes: filas.length,
    filas,
    error,
  });
}

module.exports = handler;
