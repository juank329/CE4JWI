// Calendario CE4JWI - endpoint en tiempo real.
//
// Descarga el feed público iCal del Calendario de Google en CADA petición y
// devuelve los eventos con el mismo esquema que los espera el calendario web
// ({date, time, allDay, title, description, category}).
//
// Al correr en el servidor (Vercel serverless) no hay problemas de CORS y el
// resultado siempre está fresco, por lo que agregar o eliminar un evento en
// Google Calendar se refleja de inmediato en la web (sin esperar los 3h del
// workflow de GitHub Actions). El JSON estático sigue existiendo como respaldo.

const ICAL_SECRETO = "f96d6d8a7b251e7bf0283bbc1059276e07026b7d0aef13b59e00df2dcb71d1a2"
const ICAL_URL = `https://calendar.google.com/calendar/ical/${ICAL_SECRETO}@group.calendar.google.com/public/basic.ics`

function unescape(s) {
  return s.replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\n/g, " ")
}

function parsearICal(texto) {
  const eventos = []
  const lineas = texto.split(/\r?\n/)
  let cur = null
  let i = 0
  while (i < lineas.length) {
    let linea = lineas[i]
    while (i + 1 < lineas.length && lineas[i + 1].startsWith(" ")) {
      linea += lineas[i + 1].slice(1)
      i += 1
    }
    if (linea.startsWith("BEGIN:VEVENT")) {
      cur = {}
    } else if (linea.startsWith("END:VEVENT")) {
      if (cur && cur.summary && cur.dtstart) eventos.push(cur)
      cur = null
    } else if (cur) {
      const idx = linea.indexOf(":")
      if (idx < 0) { i += 1; continue }
      const clave = linea.slice(0, idx).split(";")[0]
      const valor = unescape(linea.slice(idx + 1))
      if (clave === "SUMMARY") cur.summary = valor
      else if (clave === "DESCRIPTION") cur.description = valor
      else if (clave === "LOCATION") cur.location = valor
      else if (clave === "DTSTART") cur.dtstart = valor
      else if (clave === "DTEND") cur.dtend = valor
    }
    i += 1
  }
  return eventos
}

function normalizarEventos(evs) {
  return evs
    .filter((e) => e.dtstart)
    .map((e) => {
      const s = e.dtstart
      let fecha, hora, allDay
      if (s.includes("T")) {
        fecha = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
        hora = `${s.slice(9, 11)}:${s.slice(11, 13)}`
        allDay = false
      } else {
        fecha = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
        hora = null
        allDay = true
      }
      return {
        date: fecha,
        time: hora,
        allDay,
        title: e.summary,
        description: e.description || "",
        category: "actividad",
      }
    })
    .sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")))
}

module.exports = async function handler(req, res) {
  try {
    const resp = await fetch(ICAL_URL, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(15000),
    })
    if (!resp.ok) throw new Error("HTTP " + resp.status)
    const texto = await resp.text()
    if (!texto.includes("BEGIN:VEVENT")) throw new Error("feed sin eventos")

    const eventos = normalizarEventos(parsearICal(texto))

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Cache-Control", "no-store")
    res.setHeader("Content-Type", "application/json")
    res.status(200).json({
      ok: true,
      fuente: "google-calendar",
      actualizado: new Date().toISOString(),
      total: eventos.length,
      eventos,
    })
  } catch (e) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Content-Type", "application/json")
    res.status(502).json({ ok: false, error: String(e.message || e) })
  }
}