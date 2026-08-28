const HAMQSL_URL = "https://www.hamqsl.com/solarxml.php";
const HAMQSL_MATCH = "hamqsl.com";

module.exports = async function handler(req, res) {
  try {
    let destino = req.query.url ? req.query.url.toString() : HAMQSL_URL;
    if (!destino.toLowerCase().includes(HAMQSL_MATCH)) {
      res.setHeader("Content-Type", "application/json");
      res.writeHead(400);
      res.end(JSON.stringify({ error: "URL no permitida" }));
      return;
    }
    const resp = await fetch(destino, {
      headers: { "User-Agent": "CE4JWI-Bot/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    const xml = await resp.text();
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=300");
    res.writeHead(200);
    res.end(xml);
  } catch (e) {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.writeHead(502);
    res.end(JSON.stringify({ error: e.message }));
  }
};
