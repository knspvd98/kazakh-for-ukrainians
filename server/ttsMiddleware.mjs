import { getTtsStatus, synthesizeTts } from "./ttsCore.mjs";

export function createTtsApiMiddleware() {
  let inFlight=0, started=Date.now(), calls=0;
  return async function ttsApiMiddleware(req, res, next) {
    const pathname = getPathname(req);
    if (isTtsPath(pathname)) {
      if (process.env.COURSE_ENABLE_TTS !== "true") return sendJson(res,404,{error:"Live synthesis is disabled."});
      const origin=req.headers.origin;
      const loopback=["127.0.0.1","::1","::ffff:127.0.0.1"].includes(req.socket.remoteAddress);
      if (!loopback || !/^(localhost|127\.0\.0\.1|\[::1\])(:[0-9]+)?$/.test(req.headers.host||"") ||
          (origin && origin!=="http://"+req.headers.host && origin!=="https://"+req.headers.host))
        return sendJson(res,403,{error:"Local operator access required."});
    }
    if (req.method === "OPTIONS" && isTtsPath(pathname)) {
      setCors(res);
      res.writeHead(204);
      res.end();
      return;
    }
    if (req.method === "GET" && isStatusPath(pathname)) {
      setCors(res);
      sendJson(res, 200, getTtsStatus());
      return;
    }
    if (req.method === "POST" && isSynthesisPath(pathname)) {
      setCors(res);
      if(Date.now()-started>=60000){started=Date.now();calls=0;}
      if(inFlight>=2 || calls>=12)return sendJson(res,429,{error:"Try again later."});
      calls++;inFlight++;
      try {
        const body = await readJson(req);
        const result = await synthesizeTts(body);
        res.writeHead(200, {
          "Content-Type": "audio/mpeg",
          "Content-Length": result.audio.length,
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-TTS-Provider": result.provider,
          "X-TTS-Cache": result.cache,
          "X-TTS-Voice": result.voice,
          "X-TTS-Rate": String(result.rate)
        });
        res.end(result.audio);
      } catch {
        sendJson(res, 500, {
          error: "Не вдалося озвучити текст."
        });
      } finally { inFlight--; }
      return;
    }
    if (typeof next === "function") {
      next();
      return;
    }
    sendJson(res, 404, { error: "Not found" });
  };
}

function getPathname(req) {
  const rawUrl = req.url || "/";
  return new URL(rawUrl, "http://localhost").pathname;
}

function isTtsPath(pathname) {
  return isStatusPath(pathname) || isSynthesisPath(pathname);
}

function isStatusPath(pathname) {
  return pathname === "/api/tts/status" || pathname === "/status";
}

function isSynthesisPath(pathname) {
  return pathname === "/api/tts" || pathname === "/" || pathname === "";
}

function setCors(res) {
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 20000) {
        reject(new Error("Запит занадто великий."));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Очікував JSON-запит."));
      }
    });
    req.on("error", reject);
  });
}

