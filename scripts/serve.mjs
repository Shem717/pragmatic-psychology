import http from "node:http";
import { gzipSync } from "node:zlib";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
const root = path.resolve("out");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json",
  ".xml": "application/xml",
  ".ico": "image/x-icon",
  ".md": "text/markdown",
};
http
  .createServer(async (req, res) => {
    const security = JSON.parse(await readFile("output/security-headers.json", "utf8"));
    let pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    if (/^\/corrections\/?$/.test(pathname)) { res.writeHead(308, { Location: "/evidence/" }); res.end(); return; }
    let file = path.resolve(root, "." + pathname);
    if (!file.startsWith(root + path.sep) && file !== root) {
      res.writeHead(403);
      res.end();
      return;
    }
    for (const h of security.headers)
      if (h.key !== "Content-Security-Policy" || process.env.PPO_CSP !== "off")
        res.setHeader(
          h.key,
          h.value.replace("; upgrade-insecure-requests", ""),
        );
    const setPagePolicy = (file) => {
      if (process.env.PPO_CSP === "off") return;
      const relative = path.relative(root,file).replaceAll(path.sep,"/");
      const policy = security.pagePolicies.find(p=>p.file===relative);
      res.setHeader("Content-Security-Policy",(policy?.csp ?? security.defaultCsp).replace("; upgrade-insecure-requests", ""));
    };
    try {
      const s = await stat(file);
      if (s.isDirectory()) file = path.join(file, "index.html");
      setPagePolicy(file);
      res.setHeader(
        "Content-Type",
        types[path.extname(file)] || "application/octet-stream",
      );
      const body = await readFile(file);
      if (
        (req.headers["accept-encoding"] || "").includes("gzip") &&
        /\.(html|js|css|txt|xml|json|md)$/.test(file)
      ) {
        res.setHeader("Content-Encoding", "gzip");
        res.setHeader("Vary", "Accept-Encoding");
        res.end(gzipSync(body));
      } else res.end(body);
    } catch {
      try {
        file = path.join(root, "404.html");
        setPagePolicy(file);
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(await readFile(file));
      } catch {
        res.writeHead(404);
        res.end("Not found");
      }
    }
  })
  .listen(Number(process.env.PORT || 8791), "127.0.0.1", () =>
    console.log(
      "Observatory preview http://127.0.0.1:" + (process.env.PORT || 8791),
    ),
  );
