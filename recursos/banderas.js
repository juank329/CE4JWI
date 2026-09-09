/**
 * CE4JWI - Banderas para rankings (recursos/banderas.js)
 * Autodecora cualquier <a class="call-badge"> de las tablas de ranking del sitio
 * agregando la bandera de pais al lado del indicativo (igual que el widget
 * "Top Indicativos" de la barra lateral):
 *   - El pais se deriva del PREFIJO del indicativo (sin red, instantaneo).
 *   - Si el prefijo no resuelve, se consulta la API de RadioID.net (base DMR).
 *   - La bandera PNG se toma de flagcdn.com y se cachea en localStorage.
 * Se instala un MutationObserver: cualquier fila que se pinte con fetch al
 * ranking queda decorada automaticamente (sin tocar el JS de cada pagina).
 */
(function () {
  if (window.__CE4JWI_banderas) return;
  window.__CE4JWI_banderas = true;

  var PAISES_ISO = {
    "chile":"CL","argentina":"AR","argentina republic":"AR","uruguay":"UY","bolivia":"BO","brasil":"BR","brazil":"BR",
    "peru":"PE","paraguay":"PY","ecuador":"EC","colombia":"CO","venezuela":"VE","panama":"PA",
    "españa":"ES","espana":"ES","spain":"ES","portugal":"PT","italy":"IT","italia":"IT",
    "france":"FR","francia":"FR","germany":"DE","alemania":"DE","england":"GB","united kingdom":"GB",
    "netherlands":"NL","belgium":"BE","switzerland":"CH","austria":"AT","poland":"PL","ukraine":"UA",
    "russia":"RU","sweden":"SE","norway":"NO","denmark":"DK","finland":"FI","greece":"GR","hungary":"HU",
    "usa":"US","united states":"US","estados unidos":"US","canada":"CA","mexico":"MX",
    "méxico":"MX","cuba":"CU","puerto rico":"PR","dominican republic":"DO","costa rica":"CR",
    "guatemala":"GT","honduras":"HN","el salvador":"SV","nicaragua":"NI","jamaica":"JM",
    "australia":"AU","new zealand":"NZ","japan":"JP","china":"CN","south korea":"KR","korea":"KR",
    "india":"IN","indonesia":"ID","malaysia":"MY","philippines":"PH","filipinas":"PH",
    "thailand":"TH","vietnam":"VN","singapore":"SG","south africa":"ZA","sudafrica":"ZA",
    "egypt":"EG","morocco":"MA","algiers":"DZ","algeria":"DZ","turkey":"TR","israel":"IL",
    "ireland":"IE","iceland":"IS","czech republic":"CZ","czechia":"CZ","slovakia":"SK","croatia":"HR",
    "romania":"RO","bulgaria":"BG","serbia":"RS","slovenia":"SI","lithuania":"LT","latvia":"LV",
    "estonia":"EE","belarus":"BY","kazakhstan":"KZ","mongolia":"MN","pakistan":"PK",
    "sri lanka":"LK","nepal":"NP","bangladesh":"BD","fiji":"FJ","greenland":"GL"
  };

  var PREFS = {
    "CA":"CL","CB":"CL","CC":"CL","CD":"CL","CE":"CL","CF":"CA","CG":"CA","CH":"CA","CI":"CA","CJ":"CA","CK":"CA","CL":"CU","CM":"CU","CN":"MA","CO":"CU","CP":"BO","CQ":"PT","CR":"PT","CS":"PT","CT":"PT","CU":"PT","CV":"UY","CW":"UY","CX":"UY","CY":"CA","CZ":"CA",
    "LU":"AR","LQ":"AR","LT":"AR","LW":"AR","LY":"AR","LZ":"AR","7L":"AR","8B":"BR",
    "PY":"BR","PP":"BR","PQ":"BR","PR":"BR","PS":"BR","PT":"BR","PV":"BR","PW":"BR","PX":"BR","PZ":"BR",
    "4F":"PH","4I":"PH","DV":"PH","DU":"PH",
    "EA":"ES","EB":"ES","EC":"ES","ED":"ES","EE":"ES","EF":"ES","EG":"ES","EH":"ES","EI":"IE","EK":"AM","EL":"LR","EM":"UA","EO":"UA","EP":"IR","ER":"MD","ES":"EE","ET":"ET","EU":"BY",
    "W":"US","K":"US","N":"US","AA":"US","AC":"US","AK":"US","KA":"US","KB":"US","KC":"US","KD":"US","KE":"US","KF":"US","KG":"US","KH":"US","KI":"US","KJ":"US","KK":"US","KL":"US","KM":"US","KN":"US","KO":"US","KP":"US","KQ":"US","KR":"US","KS":"US","KT":"US","KU":"US","KV":"US","KW":"US","KX":"US","KY":"US","KZ":"US","WA":"US","WB":"US","WC":"US","WD":"US","WE":"US","WF":"US","WG":"US","WH":"US","WI":"US","WJ":"US","WK":"US","WL":"US","WM":"US","WN":"US","WO":"US","WP":"US","WQ":"US","WR":"US","WS":"US","WT":"US","WU":"US","WV":"US","WW":"US","WX":"US","WY":"US","WZ":"US","NP":"US","NQ":"US","NR":"US","NS":"US","NT":"US","NU":"US","NV":"US","NW":"US","NX":"US","NY":"US","NZ":"US",
    "VE":"CA","VA":"CA","VB":"CA","VC":"CA","VD":"CA","VY":"CA","VO":"CA","VX":"CA","C6":"BS","C9":"MZ","C7":"MV",
    "XE":"MX","XD":"MX","XF":"MX","XG":"MX","XH":"MX","XI":"MX","XJ":"MX","XL":"MX","XM":"MX","XN":"MX","XP":"MX","XQ":"CL","XR":"CL","XS":"MX","XT":"MX","XU":"MX","XV":"MX","XW":"MX","XX":"MX","XY":"MX","XZ":"MX","6D":"MX",
    "YV":"VE","YY":"VE","4M":"VE","HF":"PL","HP":"PA","HO":"PA","HR":"HN","HT":"NI","HU":"SV","TI":"CR","TE":"CR","TG":"GT","TN":"CG","TT":"TD","TU":"CI","TY":"BJ","TZ":"ML","T7":"SM","T9":"BA",
    "YB":"ID","YC":"ID","YD":"ID","YE":"ID","YF":"ID","YG":"ID","YH":"ID","YI":"IQ","YJ":"VU","YK":"SY","YM":"TR","YN":"NI","YO":"RO","YP":"AL","YQ":"DO","YR":"RO","YS":"SV","YT":"AL","YU":"RS","YZ":"RS","7A":"ID","8A":"ID","9A":"HR","9K":"KW","9M":"MY","9N":"NP","9V":"SG","9W":"MY","9X":"RW","9Y":"TT","9Z":"TT",
    "DL":"DE","DK":"DE","DA":"DE","DB":"DE","DC":"DE","DF":"DE","DH":"DE","DJ":"DE","DM":"DE","DN":"DE","DO":"DE","DP":"DE","DQ":"DE","DR":"DE","DS":"DE","DT":"DE","DV":"DE","DX":"PH","DZ":"PH",
    "F":"FR","G":"GB","M":"GB","GW":"GB","GD":"GB","GI":"GB","GM":"GB","GU":"GB","2E":"GB","2M":"GB","2W":"GB",
    "I":"IT","IK":"IT","IU":"IT","IZ":"IT","IN":"IT","IP":"IT","IS":"IT","JA":"JP","JH":"JP","JI":"JP","JJ":"JP","JK":"JP","JL":"JP","JM":"JP","JN":"JP","JO":"JP","JP":"JP","JQ":"JP","JR":"JP","JS":"JP","JT":"MN","JY":"JO",
    "PA":"NL","PB":"NL","PC":"NL","PD":"NL","PE":"NL","PF":"NL","PG":"NL","PH":"NL","PI":"NL","PJ":"NL","PK":"NL","PL":"NL",
    "OH":"FI","OJ":"FI","OG":"FI","OF":"FI","TA":"TR","TC":"TR","TB":"TR","TM":"TR",
    "UA":"RU","UB":"UA","UC":"BY","UD":"AZ","UE":"RU","UF":"RU","UG":"GE","UH":"RU","UI":"RU","UJ":"UZ","UK":"UZ","UL":"KZ","UM":"BY","UN":"KZ","UO":"RU","UP":"KZ","UQ":"BY","UR":"UA","US":"UA","UT":"UA","UU":"UA","UV":"UA","UW":"UA","UX":"UA","UY":"UA","UZ":"UA",
    "VK":"AU","VI":"AU","VH":"AU","VJ":"AU","VM":"AU","VZ":"AU","AX":"AU",
    "ZL":"NZ","ZM":"NZ","ZK":"NZ","ZP":"PY","ZS":"ZA","ZR":"ZA","ZU":"ZA","ZV":"ZA","ZW":"ZA","3G":"CL","Z3":"MK","Z6":"XK",
    "4X":"IL","4Z":"IL","5B":"CY","5H":"TZ","5N":"NG","5R":"MG","5T":"MR","5U":"NE","5V":"TG","5W":"WS","5X":"UG","5Z":"KE","6M":"HK","6Y":"JM","7P":"LS","7Q":"MW","7X":"DZ","8P":"BB","8R":"GY","8S":"SE","8Z":"SA","9J":"ZM","9O":"CD",
    "E5":"CK","E7":"BA","EX":"KG","EY":"TJ","EZ":"TM","FJ":"GF","FM":"MQ","FG":"GP","FH":"YT","FK":"NC","FO":"PF","FP":"PM","FR":"RE","FS":"PM","FT":"TF",
    "HC":"EC","HD":"EC","HJ":"CO","HK":"CO","KP":"PR","OA":"PE","OB":"PE","PU":"BR","VG":"CA","VU":"IN"
  };

  function isoPorPrefijo(call) {
    var c = PREFS[call.slice(0, 2)];
    if (c) return c;
    if (/^[A-Z][0-9]/.test(call)) return "US";
    if (/^7[0-9]/.test(call)) return "JP";
    if (/^8[0-9]/.test(call)) return "JP";
    return "";
  }

  function ccDePais(nombre) {
    var n = (nombre || "").toLowerCase().trim().replace(/\s+/g, " ");
    return PAISES_ISO[n] || "";
  }

  function ponerBandera(elA, call, cc) {
    if (!elA || !/^[A-Z]{2}$/.test(cc || "")) return;
    var img = document.createElement("img");
    img.src = "https://flagcdn.com/w40/" + cc.toLowerCase() + ".png";
    img.alt = cc;
    img.width = 22;
    img.height = 15;
    img.style.cssText = "vertical-align:-2px;margin-right:6px;border:1px solid rgba(0,0,0,.15);border-radius:2px;display:inline-block;";
    elA.insertBefore(img, elA.firstChild);
  }

  function cargarBandera(elA, call) {
    var cc = isoPorPrefijo(call);
    if (!cc) {
      // Prefijo no resuelto: preguntar a RadioID.net (con cache)
      var ck = "bco_iso_" + call;
      try {
        var cache = localStorage.getItem(ck);
        if (cache !== null) { ponerBandera(elA, call, cache); return; }
      } catch (e) {}
      fetch("https://radioid.net/api/users?callsign=" + encodeURIComponent(call) + "&callsign_sel==")
        .then(function (r) { if (!r.ok) throw new Error("HTTP"); return r.json(); })
        .then(function (j) {
          var iso = "";
          if (j && Array.isArray(j.results) && j.results.length && j.results[0] && j.results[0].country) {
            iso = ccDePais(j.results[0].country);
          }
          try { localStorage.setItem(ck, iso); } catch (e) {}
          ponerBandera(elA, call, iso);
        })
        .catch(function () { try { localStorage.setItem(ck, ""); } catch (e) {} });
      return;
    }
    ponerBandera(elA, call, cc);
  }

  function decorarUna(a) {
    if (!a || a.getAttribute("data-ce4jwi-bandera")) return;
    a.setAttribute("data-ce4jwi-bandera", "1");
    var call = (a.textContent || "").trim().toUpperCase();
    if (!call || !/^[A-Z0-9]{2,}/.test(call)) return;
    cargarBandera(a, call);
  }

  function decorarTodos() {
    [].forEach.call(document.querySelectorAll("a.call-badge"), decorarUna);
  }

  window.CE4JWI_banderas = { decorarTodos: decorarTodos };

  // Quita el "chip" que envuelve el indicativo: solo bandera + call, elegante
  var st = document.createElement("style");
  st.id = "ce4jwi-banderas-estilo";
  st.textContent = "a.call-badge{background:transparent!important;border:none!important;box-shadow:none!important;padding:0!important;border-radius:0!important;text-decoration:none!important;color:#1a4d8f!important;font-weight:700!important;}a.call-badge:hover{color:#0f3a7a!important;text-decoration:underline!important;}a.call-badge img{vertical-align:-2px;margin-right:6px;border:1px solid rgba(0,0,0,.15);border-radius:2px;display:inline-block;width:22px;height:15px;}";
  document.head.appendChild(st);

  // Tablas estaticas que ya existen al cargar
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", decorarTodos);
  } else {
    decorarTodos();
  }

  // Filas que se pintan luego (fetch del ranking, etc.)
  if (window.MutationObserver) {
    var mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var ns = muts[i].addedNodes;
        for (var j = 0; j < ns.length; j++) {
          var n = ns[j];
          if (n.nodeType !== 1) continue;
          if (n.classList && n.classList.contains("call-badge")) decorarUna(n);
          if (n.querySelectorAll) {
            [].forEach.call(n.querySelectorAll("a.call-badge"), decorarUna);
          }
        }
      }
    });
    if (document.body) mo.observe(document.body, { childList: true, subtree: true });
    else document.addEventListener("DOMContentLoaded", function () { mo.observe(document.body, { childList: true, subtree: true }); });
  }
})();