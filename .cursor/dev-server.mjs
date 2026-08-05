/**
 * AltivoxAi local development server (zero external dependencies).
 *
 * Serves the static site (index.html, admin panel, assets) and mounts the
 * Vercel-style serverless functions in `api/` so the whole app can be
 * exercised locally without the Vercel CLI or a cloud deploy.
 *
 * Each `api/*.js` handler receives a Vercel-compatible (req, res) pair:
 *   - req.method, req.headers, req.query, req.body (JSON body auto-parsed)
 *   - res.status(code), res.json(obj), res.send(data) plus native
 *     setHeader/writeHead/end.
 *
 * Handlers are loaded transparently whether they use ESM (`export default`)
 * or CommonJS (`module.exports`), and are hot-reloaded when their source
 * changes. Handlers that need external secrets (OpenRouter/Gemini/Supabase/
 * n8n) still run locally and return their normal "not configured" responses
 * when those env vars are absent.
 */
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { existsSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const API_DIR = path.join(ROOT, "api");
const TMP_DIR = path.join(os.tmpdir(), "altivox-dev-api");
const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 3000);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};

const handlerCache = new Map();

async function loadApiHandler(name) {
  const src = path.join(API_DIR, name + ".js");
  if (!existsSync(src)) return null;

  const info = await stat(src);
  const cached = handlerCache.get(name);
  if (cached && cached.mtimeMs === info.mtimeMs) return cached.handler;

  const code = await readFile(src, "utf8");
  const isEsm = /\bexport\s+(default|const|let|var|function|async|class|\{)/.test(code);
  const ext = isEsm ? "mjs" : "cjs";

  await mkdir(TMP_DIR, { recursive: true });
  const tmpFile = path.join(TMP_DIR, `${name}.${info.mtimeMs}.${ext}`);
  if (!existsSync(tmpFile)) await writeFile(tmpFile, code);

  const mod = await import(pathToFileURL(tmpFile).href);
  const handler = mod.default || mod;
  if (typeof handler !== "function") {
    throw new Error(`api/${name}.js does not export a handler function`);
  }
  handlerCache.set(name, { mtimeMs: info.mtimeMs, handler });
  return handler;
}

function enhanceResponse(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (obj) => {
    if (!res.headersSent) res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(obj));
    return res;
  };
  res.send = (data) => {
    if (data === undefined || data === null) {
      res.end();
    } else if (typeof data === "string" || Buffer.isBuffer(data)) {
      res.end(data);
    } else {
      if (!res.headersSent) res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify(data));
    }
    return res;
  };
  return res;
}

async function readRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  const contentType = String(req.headers["content-type"] || "");
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw;
}

function safeStaticPath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const rel = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const resolved = path.resolve(ROOT, rel);
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) return null;
  return resolved;
}

async function serveStatic(req, res, pathname) {
  const filePath = safeStaticPath(pathname);
  if (!filePath) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("403 Forbidden");
    return;
  }

  let target = filePath;
  if (existsSync(target)) {
    const info = await stat(target);
    if (info.isDirectory()) target = path.join(target, "index.html");
  }

  if (!existsSync(target)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found: " + pathname);
    return;
  }

  const body = await readFile(target);
  const type = MIME[path.extname(target).toLowerCase()] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": type });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const started = Date.now();
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  try {
    if (pathname === "/api" || pathname.startsWith("/api/")) {
      const name = pathname.replace(/^\/api\/?/, "").replace(/\/+$/, "");
      const handler = name ? await loadApiHandler(name) : null;

      if (!handler) {
        res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: `No API handler for /api/${name}` }));
        return;
      }

      const query = {};
      for (const [key, value] of url.searchParams) query[key] = value;
      req.query = query;
      if (req.method !== "GET" && req.method !== "HEAD") {
        req.body = await readRequestBody(req);
      } else {
        req.body = {};
      }
      enhanceResponse(res);
      await handler(req, res);
      if (!res.writableEnded) res.end();
    } else {
      await serveStatic(req, res, pathname);
    }
  } catch (err) {
    console.error(`[dev-server] error handling ${req.method} ${pathname}:`, err);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    }
    if (!res.writableEnded) {
      res.end(JSON.stringify({ error: "dev-server internal error", detail: String(err && err.message || err) }));
    }
  } finally {
    console.log(`${req.method} ${pathname} -> ${res.statusCode} (${Date.now() - started}ms)`);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`AltivoxAi dev server running at http://${HOST}:${PORT}`);
  console.log(`  Root:      ${ROOT}`);
  console.log(`  Site:      http://localhost:${PORT}/`);
  console.log(`  Admin:     http://localhost:${PORT}/login.html`);
  console.log(`  API base:  http://localhost:${PORT}/api/`);
});
