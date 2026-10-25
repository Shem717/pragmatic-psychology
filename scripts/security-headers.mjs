import { readdir, readFile, writeFile, mkdir, cp, rm } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
const root = path.resolve("out");
await mkdir("output", { recursive: true });
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name),
      ),
    )
  ).flat();
}
const hashes = new Set();
let pages = 0;
for (const file of await walk(root)) {
  if (!file.endsWith(".html")) continue;
  pages++;
  const html = await readFile(file, "utf8");
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc=/.test(m[1]) || !m[2]) continue;
    hashes.add(
      `'sha256-${createHash("sha256").update(m[2]).digest("base64")}'`,
    );
  }
}
// Static HTML and RSC payloads are generated together. No dynamic personal content reaches them.
const csp = `default-src 'self'; script-src 'self' ${[...hashes].join(" ")}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src https://www.youtube-nocookie.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests`;
const headers = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), browsing-topics=()",
  },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];
const config = {
  version: 2,
  cleanUrls: true,
  trailingSlash: true,
  redirects: [{ source: "/corrections", destination: "/evidence", permanent: true }],
  headers: [{ source: "/(.*)", headers }],
};
await writeFile(
  path.join(root, "vercel.json"),
  JSON.stringify(config, null, 2) + "\n",
);
await writeFile(
  "output/security-headers.json",
  JSON.stringify(
    {
      pages,
      inlineScriptHashes: hashes.size,
      cspBytes: Buffer.byteLength(csp),
      scriptPolicy: "self + hashes; no unsafe-inline or unsafe-eval",
      headers,
    },
    null,
    2,
  ),
);
console.log(
  `Security headers generated for ${pages} static pages; ${hashes.size} script hashes (${Buffer.byteLength(csp)} bytes).`,
);

const buildRoot = path.resolve(".vercel/output");
await mkdir(buildRoot, { recursive: true });
await rm(path.join(buildRoot, "static"), { recursive: true, force: true });
await cp(root, path.join(buildRoot, "static"), {
  recursive: true,
  filter: (p) => path.basename(p) !== "vercel.json",
});
const routes = [
  { src: "^/corrections/?$", status: 308, headers: { Location: "/evidence/" } },
  {
    src: "^/(.*)$",
    headers: Object.fromEntries(headers.map((h) => [h.key, h.value])),
    continue: true,
  },
  {
    src: "^/_next/static/(.*)$",
    headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    continue: true,
  },
];
for (const file of await walk(root)) {
  if (!file.endsWith("index.html")) continue;
  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  const route = relative.slice(0, -10).replace(/\/$/, "");
  const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  routes.push({
    src: route ? "^/" + escaped + "/?$" : "^/?$",
    dest: "/" + relative,
  });
}
routes.push(
  { handle: "filesystem" },
  { src: "^/.*$", dest: "/404.html", status: 404 },
);
await writeFile(
  path.join(buildRoot, "config.json"),
  JSON.stringify({ version: 3, routes }, null, 2) + "\n",
);
console.log(
  "Vercel Build Output API artifact prepared: static files and matching response policy.",
);
