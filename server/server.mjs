import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTtsApiMiddleware } from "./ttsMiddleware.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "0.0.0.0";
const publicBase = normalizePublicBase(process.env.BASE_PATH || "/courseforalina/");
const ttsMiddleware = createTtsApiMiddleware();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg"
};

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url || "/", `http://${host}:${port}`).pathname;
  if (pathname === "/api/tts" || pathname === "/api/tts/status") {
    ttsMiddleware(req, res);
    return;
  }
  await serveStatic(req, res);
});

server.listen(port, host, () => {
  console.log(`Kazakh course server: http://${host}:${port}`);
});

async function serveStatic(req, res) {
  const pathname = new URL(req.url || "/", `http://${host}:${port}`).pathname;
  const appPath = pathname.startsWith(publicBase)
    ? pathname.slice(publicBase.length - 1)
    : pathname;
  const requested = appPath === "/" ? "/index.html" : appPath;
  const safePath = path.normalize(decodeURIComponent(requested)).replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(distDir, safePath);
  if (!filePath.startsWith(distDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) filePath = path.join(filePath, "index.html");
    const content = await fs.readFile(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": filePath.endsWith("index.html") ? "no-cache" : "public, max-age=31536000, immutable"
    });
    res.end(content);
  } catch {
    const content = await fs.readFile(path.join(distDir, "index.html"));
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
    res.end(content);
  }
}

function normalizePublicBase(value) {
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}
