import { getTtsStatus, synthesizeTts } from "./ttsCore.mjs";

export function createTtsApiMiddleware() {
  return async function ttsApiMiddleware(req, res, next) {
    const pathname = getPathname(req);
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
      } catch (error) {
        sendJson(res, 500, {
          error: error instanceof Error ? error.message : "Не вдалося озвучити текст."
        });
      }
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
  res.setHeader("Access-Control-Allow-Origin", "*");
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

