// Ranking EN VIVO de la actividad "Juegos Tradicionales de Fiestas Patrias en Chile" (CE4JWI).
// Solo APRS (PKT) a CE4JWI-7. 6 juegos, cada contacto suma 1 punto por juego.
//
// Fuente de datos: los ADIF que el bot sube automaticamente a qsl.net, uno por juego:
//   log_trompo.adi            (El Trompo)
//   log_emboque.adi           (El Emboque)
//   log_palo_encebado.adi     (El Palo Ensebado)
//   log_carreras_en_saco.adi  (Carreras en Saco)
//   log_tirar_cuerda.adi     (Tirar la Cuerda)
//   log_volantin.adi          (Elevar Volantines)
//
// Cada linea <CALL:..> de un ADIF = un QSO de ESE juego. El ranking suma por
// indicativo cuantos de los 6 juegos completo (0-6). Se lee en tiempo real, por lo
// que cada contacto nuevo aparece solo apenas el bot sube el ADIF.

const BASE = "https://qsl.net/ce4jwi";

const FIN = "2026-09-07"; // fin de la actividad Juegos Tradicionales (02-07 Septiembre 2026)

function fechaVencida() {
  const t = new Date().getTime() - 4 * 3600000;
  const hoy = new Date(t).toISOString().slice(0, 10);
  return FIN < hoy;
}

const JUEGOS = [
  {
    id: "trompo",
    nombre: "El Trompo",
    frase: "TROMPO",
    adif: "log_trompo.adi",
    emoji: "🪀",
    desc: "Haz bailar el trompo con la pita.",
  },
  {
    id: "emboque",
    nombre: "El Emboque",
    frase: "EMBOQUE",
    adif: "log_emboque.adi",
    emoji: "⚱️",
    desc: "Emboque: introduce el palo en el cilindro girando.",
  },
  {
    id: "palo_encebado",
    nombre: "El Palo Ensebado",
    frase: "PALO ENSEBADO",
    adif: "log_palo_ensebado.adi",
    emoji: "🪵",
    desc: "Sube el palo enjabonado hasta el premio de la punta.",
  },
  {
    id: "carreras_en_saco",
    nombre: "Carreras en Saco",
    frase: "CARRERAS EN SACO",
    adif: "log_carrera_saco.adi",
    emoji: "🛶",
    desc: "Salta en el saco hasta la meta.",
  },
  {
    id: "tirar_la_cuerda",
    nombre: "Tirar la Cuerda",
    frase: "TIRAR LA CUERDA",
    adif: "log_tirar_cuerda.adi",
    emoji: "🪢",
    desc: "Jalaste la cuerda en el tradicional pulso.",
  },
  {
    id: "elevar_volantines",
    nombre: "Elevar Volantines",
    frase: "ELEVAR VOLANTINES",
    adif: "log_volantin.adi",
    emoji: "🪁",
    desc: "Llevaste tu volantín a lo alto del cielo.",
  },
];

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
    const juegosVivos = new Map();
    const porCall = new Map(); // call -> { call, total, modos, ultima, juegos }

    const resultados = await Promise.all(
      JUEGOS.map(async (j) => {
        const qsos = await leerAdif(j.adif);
        return { juego: j, qsos };
      })
    );

    for (const { juego, qsos } of resultados) {
      juegosVivos.set(juego.id, qsos.length > 0);
      for (const q of qsos) {
        if (!porCall.has(q.call)) {
          porCall.set(q.call, {
            call: q.call,
            total: 0,
            modos: ["PKT"],
            ultima: null,
            juegos: [],
          });
        }
        const e = porCall.get(q.call);
        e.total += 1;
        e.juegos.push(juego.id);
        const claveHora = [q.fecha, q.hora];
        if (!e.ultima || claveHora.join(" ") > e.ultima.fecha + " " + e.ultima.hora) {
          e.ultima = { fecha: q.fecha, hora: q.hora };
        }
      }
    }

    const filas = [...porCall.values()]
      .map((e) => ({ ...e, ultima: e.ultima || { fecha: "", hora: "" } }))
      .sort((a, b) => b.total - a.total || (b.ultima.fecha + b.ultima.hora).localeCompare(a.ultima.fecha + a.ultima.hora))
      .sort((a, b) => b.total - a.total);

    const ahora = new Date();
    const actualizado = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(ahora.getDate()).padStart(2, "0")}T${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}:00-04:00`;

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
      ok: true,
      actividad: "juegos-tradicionales-fiestas-patrias",
      nombre: "Juegos Tradicionales de Fiestas Patrias en Chile",
      actualizado,
      totalContactos: filas.reduce((s, f) => s + f.total, 0),
      participantes: filas.length,
      juegos: JUEGOS.map((j) => ({
        id: j.id,
        nombre: j.nombre,
        frase: j.frase,
        emoji: j.emoji,
        desc: j.desc,
        activo: juegosVivos.get(j.id) || false,
      })),
      filas,
      congelado: fechaVencida(),
    });
  })().catch((e) => {
    res.status(500).json({ ok: false, error: String(e) });
  });
}

module.exports = handler;
