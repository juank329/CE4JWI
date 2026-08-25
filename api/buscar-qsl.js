const https = require("https");

const QSL_JSON_URL = "https://juank329.github.io/ce4jwi-qsls/log_qsl.json";
const QSL_IMAGES_BASE = "https://juank329.github.io/ce4jwi-qsls/qsl_images/";

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "User-Agent": "CE4JWI-Bot/1.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJSON(res.headers.location).then(resolve).catch(reject);
      }
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error("timeout")); });
  });
}

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parsearNombreArchivo(nombre) {
  const mFecha = nombre.match(/(\d{2})-(\d{2})-(\d{4})/);
  const mHora = nombre.match(/_(\d{4})_(?=[^_]*\.[a-z]+$)/i);
  const mModo = nombre.match(/_([A-Z0-9]+)\.[a-z]+$/i);
  return {
    fecha: mFecha ? mFecha[1] + "/" + mFecha[2] + "/" + mFecha[3] : "",
    hora: mHora ? mHora[1].slice(0, 2) + ":" + mHora[1].slice(2, 4) : "",
    modo: mModo ? mModo[1] : "",
  };
}

function renderPage(callsign, results, total) {
  const cardsHTML = results.length > 0
    ? results.map((item) => {
        const meta = parsearNombreArchivo(item.archivo || "");
        const carpeta = (item.carpeta || "General").replace(/_/g, " ");
        const img = esc(item.url || "");
        const archivo = esc(item.archivo || "");
        return `
          <article class="qsl-card">
            <div class="qsl-card-img-wrap">
              <img src="${img}" alt="QSL ${esc(callsign)}" loading="lazy" class="qsl-card-img">
            </div>
            <div class="qsl-card-body">
              <div class="qsl-card-activity">${esc(carpeta)}</div>
              <div class="qsl-card-meta">${esc(meta.fecha)} ${esc(meta.hora)} &middot; ${esc(meta.modo)}</div>
              <div class="qsl-card-actions">
                <a href="${img}" download="${archivo}" class="btn btn-sm btn-download">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  Descargar
                </a>
              </div>
            </div>
          </article>`;
      }).join("\n")
    : `<div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <h3>No se encontraron QSLs</h3>
        <p>No hay tarjetas QSL registradas para <strong>${esc(callsign)}</strong>.</p>
      </div>`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QSL ${esc(callsign)} - CE4JWI</title>
  <meta name="description" content="Descarga las QSL cards de ${esc(callsign)} - CE4JWI">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="icon" href="/public/favicon-32x32.png">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    :root{--primary:#1e3a5f;--accent:#0d9488;--bg:#f0f4f8;--card:#fff;--text:#1a2634;--muted:#64748b;--border:#d1dbe6}
    body{font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh}

    .header{background:linear-gradient(135deg,var(--primary) 0%,#2d5a8a 100%);padding:2.5rem 1rem;text-align:center}
    .header h1{color:#fff;font-size:clamp(1.25rem,3vw,1.75rem);font-weight:700}
    .header p{color:rgba(255,255,255,.8);margin-top:.5rem}

    .search-wrap{max-width:520px;margin:-1.5rem auto 2rem;padding:0 1rem;position:relative;z-index:10}
    .search-box{background:var(--card);border-radius:14px;padding:1.5rem;box-shadow:0 8px 32px rgba(0,0,0,.1)}
    .search-box label{display:block;font-weight:600;margin-bottom:.5rem;font-size:.9rem}
    .search-row{display:flex;gap:.5rem}
    .search-row input{flex:1;padding:.75rem 1rem;font-size:1rem;border:2px solid var(--border);border-radius:8px;outline:none;text-transform:uppercase;font-family:'Courier New',monospace;font-weight:600;letter-spacing:1px}
    .search-row input:focus{border-color:var(--primary)}
    .search-row button{padding:.75rem 1.5rem;background:var(--primary);color:#fff;border:none;border-radius:8px;font-size:.95rem;font-weight:600;cursor:pointer}
    .search-row button:hover{background:#2d5a8a}

    .container{max-width:1100px;margin:0 auto;padding:0 1rem 3rem}

    .results-header{display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:2px solid var(--border)}
    .results-header h2{font-size:1.25rem;font-weight:700}
    .badge{background:var(--bg);padding:.3rem .8rem;border-radius:20px;font-size:.85rem;font-weight:600;color:var(--muted)}

    .gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.25rem}

    .qsl-card{background:var(--card);border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:transform .2s,box-shadow .2s}
    .qsl-card:hover{transform:translateY(-3px);box-shadow:0 6px 20px rgba(0,0,0,.1)}
    .qsl-card-img-wrap{width:100%;height:200px;overflow:hidden;background:var(--bg)}
    .qsl-card-img{width:100%;height:100%;object-fit:cover}
    .qsl-card-body{padding:1rem}
    .qsl-card-activity{font-size:.8rem;color:var(--accent);font-weight:600;text-transform:uppercase;letter-spacing:.3px;margin-bottom:.25rem}
    .qsl-card-meta{font-size:.85rem;color:var(--muted)}
    .qsl-card-actions{margin-top:.75rem}
    .btn-download{display:inline-flex;align-items:center;gap:.4rem;padding:.5rem 1rem;background:var(--primary);color:#fff;border-radius:6px;text-decoration:none;font-size:.85rem;font-weight:600;transition:background .2s}
    .btn-download:hover{background:#2d5a8a}

    .empty-state{text-align:center;padding:4rem 2rem;color:var(--muted)}
    .empty-state h3{margin:1rem 0 .5rem;color:var(--text)}
    .empty-state p{max-width:360px;margin:0 auto;line-height:1.6}

    @media(max-width:640px){.gallery{grid-template-columns:1fr}.search-row{flex-direction:column}}
  </style>
</head>
<body>
  <header class="header">
    <h1>Descarga tus QSL Cards</h1>
    <p>CE4JWI - Activaciones de radioaficionados</p>
  </header>

  <section class="search-wrap">
    <div class="search-box">
      <form method="GET" action="/api/buscar-qsl">
        <label for="callsign">Ingresa tu indicativo</label>
        <div class="search-row">
          <input type="text" id="callsign" name="callsign" placeholder="Ej: CE4JWI" value="${esc(callsign)}" maxlength="12" autocomplete="off">
          <button type="submit">Buscar</button>
        </div>
      </form>
    </div>
  </section>

  <main class="container">
    <div class="results-header">
      <h2>QSL Cards de ${esc(callsign)}</h2>
      <span class="badge">${results.length} resultado${results.length !== 1 ? "s" : ""}</span>
    </div>
    <div class="gallery">
      ${cardsHTML}
    </div>
  </main>
</body>
</html>`;
}

module.exports = async function handler(req, res) {
  try {
    const callsign = ((req.query.callsign || "") + "").trim().toUpperCase();

    if (!callsign) {
      res.writeHead(302, { Location: "/descargar_qsls.html" });
      res.end();
      return;
    }

    const allQSLs = await fetchJSON(QSL_JSON_URL);
    const results = allQSLs
      .filter((item) => (item.call || "").toUpperCase().trim() === callsign)
      .sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.writeHead(200);
    res.end(renderPage(callsign, results, allQSLs.length));
  } catch (e) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.writeHead(500);
    res.end(`<!DOCTYPE html><html><head><title>Error</title></head><body style="font-family:sans-serif;text-align:center;padding:4rem">
      <h1>Error cargando QSLs</h1><p>${esc(e.message)}</p>
      <p><a href="/descargar_qsls.html">Volver al buscador</a></p>
    </body></html>`);
  }
};
