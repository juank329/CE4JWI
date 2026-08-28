const APRS_ALLOWED = "https://api.aprs.world";

module.exports = async function handler(req, res) {
  try {
    const url = (req.query.url || "").toString();
    if (!url.toLowerCase().startsWith(APRS_ALLOWED + "/") && url.toLowerCase() !== APRS_ALLOWED) {
      res.setHeader("Content-Type", "application/json");
      res.writeHead(400);
      res.end(JSON.stringify({ error: "URL no permitida" }));
      return;
    }
    const resp = await fetch(url, {
      headers: { "User-Agent": "CE4JWI-Bot/1.0", "Accept": "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    const texto = await resp.text();
    let datos = texto;
    try { datos = JSON.parse(texto); } catch (e) { /* no json */ }
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=60");
    res.writeHead(200);
    res.end(JSON.stringify(datos));
  } catch (e) {
    res.setHeader("Content-Type", "application/json");
    res.writeHead(502);
    res.end(JSON.stringify({ error: e.message }));
  }
};
