// Funcion serverless de Vercel: crea/borra QSL en Supabase.
// La clave de Supabase y la contrasena viven como variables de entorno en Vercel,
// NUNCA en el codigo de la pagina. Actions soportadas: verify, upload, delete.
//
// Variables de entorno requeridas en Vercel:
//   SUPABASE_URL      (ej: https://xxxx.supabase.co)
//   SUPABASE_KEY      (clave service_role -- necesaria para subir desde el servidor)
//   QSL_USER          (usuario permitido)
//   QSL_PASSWORD      (contrasena permitida)

function json(res, status, data) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.writeHead(status);
  res.end(JSON.stringify(data));
}

function okCredenciales(usu, pass) {
  const u = typeof usu === "string" ? usu.trim().toUpperCase() : "";
  const U = String(process.env.QSL_USER || "").trim().toUpperCase();
  return u.length > 0 && u === U &&
         typeof pass === "string" && pass.length > 0 && pass === process.env.QSL_PASSWORD;
}

async function subirImagen(SURL, SKEY, nombre, base64) {
  const bin = Buffer.from(base64, "base64");
  const r = await fetch(SURL + "/storage/v1/object/qsl-images/" + encodeURIComponent(nombre), {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + SKEY,
      apikey: SKEY,
      "Content-Type": "image/jpeg",
    },
    body: bin,
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error("Storage " + r.status + ": " + t.slice(0, 300));
  }
  return r.status;
}

async function insertarRegistro(SURL, SKEY, dato) {
  const r = await fetch(SURL + "/rest/v1/qsls", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + SKEY,
      apikey: SKEY,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(dato),
  });
  const txt = await r.text();
  if (!r.ok) throw new Error("DB " + r.status + ": " + txt.slice(0, 300));
  try { return JSON.parse(txt); } catch (_) { return null; }
}

module.exports = async function handler(req, res) {
  try {
    const SURL = process.env.SUPABASE_URL;
    const SKEY = process.env.SUPABASE_KEY;

    if (!SURL || !SKEY || !process.env.QSL_USER || !process.env.QSL_PASSWORD) {
      return json(res, 500, { ok: false, error: "Faltan variables de entorno en el servidor (SUPABASE_URL, SUPABASE_KEY, QSL_USER, QSL_PASSWORD)." });
    }

    if (req.method !== "POST") return json(res, 405, { ok: false, error: "Usa POST" });

    let cuerpo = {};
    try { cuerpo = req.body || {}; } catch (_) {}

    const action = cuerpo.action;
    const usu = cuerpo.usuario;
    const pass = cuerpo.pass;
    const d = cuerpo.data || {};

    if (action === "verify") {
      return json(res, okCredenciales(usu, pass) ? 200 : 401, { ok: okCredenciales(usu, pass) });
    }

    if (!okCredenciales(usu, pass)) {
      return json(res, 401, { ok: false, error: "Usuario o contrasena incorrectos" });
    }

    if (action === "upload") {
      const call = (d.callsign || "").toString().toUpperCase();
      const operador = (d.callsign_operador || "CE4JWI").toString().toUpperCase();
      const fecha = d.fecha || "";
      const hora = d.hora || "";
      const banda = d.banda || "";
      const modo = d.modo || "";
      const freq = d.frecuencia || "";
      const rst = d.rst || "";
      const actividad = d.actividad || "";
      const msg = d.agradecimiento || "";
      const base64 = d.imagen_base64 || "";
      const fname = d.archivo || (operador + "_" + call + "_" + (fecha || "").replace(/\//g, "-") + "_" + (hora || "") + "_" + modo + ".jpg");

      if (!call || !base64) return json(res, 400, { ok: false, error: "Faltan datos (callsign o imagen)" });

      const statusSubida = await subirImagen(SURL, SKEY, fname, base64.replace(/^data:image\/\w+;base64,/, ""));

      const pubUrl = SURL + "/storage/v1/object/public/qsl-images/" + encodeURIComponent(fname);
      const fila = await insertarRegistro(SURL, SKEY, {
        callsign: call,
        callsign_operador: operador,
        fecha: fecha,
        hora: hora,
        banda: banda,
        modo: modo,
        frecuencia: freq,
        rst: rst,
        carpeta: actividad || banda || "General",
        archivo: fname,
        url_imagen: pubUrl,
        fuente: "manual",
        agradecimiento: msg,
      });

      const id = Array.isArray(fila) && fila[0] ? fila[0].id : null;
      return json(res, 200, { ok: true, id: id, archivo: fname, storageStatus: statusSubida, url: pubUrl });
    }

    if (action === "delete") {
      const fname = d.archivo || "";
      const id = d.id || "";
      if (fname) await fetch(SURL + "/storage/v1/object/qsl-images/" + encodeURIComponent(fname), {
        method: "DELETE",
        headers: { Authorization: "Bearer " + SKEY, apikey: SKEY },
      }).catch(() => null);
      if (id) await fetch(SURL + "/rest/v1/qsls?id=eq." + encodeURIComponent(id), {
        method: "DELETE",
        headers: { Authorization: "Bearer " + SKEY, apikey: SKEY },
      }).catch(() => null);
      return json(res, 200, { ok: true });
    }

    return json(res, 400, { ok: false, error: "Accion desconocida: " + action });
  } catch (e) {
    return json(res, 500, { ok: false, error: "Error en el servidor: " + (e.message || String(e)) });
  }
};
