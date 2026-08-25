const QSL_JSON_URL = "https://juank329.github.io/ce4jwi-qsls/log_qsl.json";

module.exports = async function handler(req, res) {
  try {
    const resp = await fetch(QSL_JSON_URL, {
      headers: { "User-Agent": "CE4JWI-Bot/1.0" },
    });
    const raw = await resp.json();

    const info = {
      ok: resp.ok,
      status: resp.status,
      type: typeof raw,
      isArray: Array.isArray(raw),
      length: Array.isArray(raw) ? raw.length : "N/A",
      first3: Array.isArray(raw) ? raw.slice(0, 3) : raw,
    };

    res.setHeader("Content-Type", "application/json");
    res.writeHead(200);
    res.end(JSON.stringify(info, null, 2));
  } catch (e) {
    res.setHeader("Content-Type", "application/json");
    res.writeHead(500);
    res.end(JSON.stringify({ error: e.message, stack: e.stack }));
  }
};
