// Funcion serverless de Vercel: devuelve el catalogo completo de QSLs
// fusionando las dos fuentes:
//   1) GitHub Pages (bots / FTP):  https://juank329.github.io/ce4jwi-qsls/log_qsl.json
//   2) Supabase (QSL manuales del candado): tabla `qsls` + bucket publico `qsl-images`
// La clave de Supabase vive en Vercel (SUPABASE_KEY = service_role), NUNCA en el cliente.
//
// Variables de entorno requeridas: SUPABASE_URL, SUPABASE_KEY

const QSL_JSON_URL = "https://juank329.github.io/ce4jwi-qsls/log_qsl.json";

function json(res, status, data) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.writeHead(status);
  res.end(JSON.stringify(data));
}

async function obtenerGithub() {
  try {
    const r = await fetch(QSL_JSON_URL, {
      headers: { "User-Agent": "CE4JWI-Bot/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const raw = await r.json();
    return Array.isArray(raw) ? raw : (raw.default || raw.qsls || []);
  } catch (e) {
    console.warn("[qsl-catalogo] GitHub Pages fallo:", e.message || e);
    return [];
  }
}

async function obtenerSupabase(SURL, SKEY) {
  try {
    const r = await fetch(SURL + "/rest/v1/qsls?select=*&order=fecha.desc", {
      headers: {
        Authorization: "Bearer " + SKEY,
        apikey: SKEY,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const raw = await r.json();
    if (!Array.isArray(raw)) return [];
    // Mapear filas de Supabase al formato del indice JSON de la galeria
    return raw
      .filter((f) => f && f.callsign && f.archivo)
      .map((f) => ({
        call: (f.callsign || "").toUpperCase().trim(),
        carpeta: f.carpeta || f.actividad || f.banda || "General",
        archivo: f.archivo,
        url: f.url_imagen ||
          SURL + "/storage/v1/object/public/qsl-images/" + encodeURIComponent(f.archivo),
        fecha: f.fecha || "",
        hora: f.hora || "",
        modo: f.modo || "",
        banda: f.banda || "",
        frecuencia: f.frecuencia || "",
        rst: f.rst || "",
        fuente: f.fuente || "manual",
      }));
  } catch (e) {
    console.warn("[qsl-catalogo] Supabase fallo:", e.message || e);
    return [];
  }
}

module.exports = async function handler(req, res) {
  try {
    const SURL = process.env.SUPABASE_URL;
    const SKEY = process.env.SUPABASE_KEY;

    const [github, supabase] = await Promise.all([
      obtenerGithub(),
      SURL && SKEY ? obtenerSupabase(SURL, SKEY) : Promise.resolve([]),
    ]);

    // Fusionar por `archivo` para no duplicar las que estan en ambas fuentes
    const porArchivo = {};
    for (const item of github) {
      if (item && item.archivo) porArchivo[item.archivo] = item;
    }
    let manualesNuevas = 0;
    for (const item of supabase) {
      if (!item || !item.archivo) continue;
      if (!porArchivo[item.archivo]) {
        porArchivo[item.archivo] = item;
        manualesNuevas++;
      }
    }

    const combinado = Object.values(porArchivo);
    const trozos = req.url.split("?")[1] || "";
    const params = new URLSearchParams(trozos);
    const callBusqueda = (params.get("callsign") || "").toUpperCase().trim();

    const resultado = callBusqueda
      ? combinado.filter((i) => (i.call || "").toUpperCase().trim() === callBusqueda)
      : combinado;

    return json(res, 200, {
      ok: true,
      total: combinado.length,
      manuales: manualesNuevas,
      github: github.length,
      supabase: supabase.length,
      results: resultado,
    });
  } catch (e) {
    return json(res, 500, { ok: false, error: "Error en el servidor: " + (e.message || String(e)) });
  }
};
