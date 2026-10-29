import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../public");
const portArgument = process.argv.indexOf("--port");
const port = Number(
  portArgument >= 0 ? process.argv[portArgument + 1] : process.env.PORT || 4178,
);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("Choose a valid port: npm run dev -- --port 4178");
}

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

const server = createServer(async (request, response) => {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { Allow: "GET, HEAD" }).end("Method not allowed");
    return;
  }
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    let path = resolve(root, `.${pathname}`);
    if (path !== root && !path.startsWith(root + sep)) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    if ((await stat(path)).isDirectory()) path = resolve(path, "index.html");
    const data = await readFile(path);
    response.writeHead(200, {
      "Content-Type": types[extname(path)] || "application/octet-stream",
      "Content-Length": data.byteLength,
      "Cache-Control": "no-store",
    });
    response.end(request.method === "HEAD" ? undefined : data);
  } catch (error) {
    const status = ["ENOENT", "ENOTDIR"].includes(error.code) ? 404 : 400;
    response
      .writeHead(status)
      .end(status === 404 ? "Not found" : "Bad request");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Sufi Palace preview: http://localhost:${port}`);
});
server.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
