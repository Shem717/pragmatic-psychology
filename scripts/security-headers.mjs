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
const pagePolicies = [];
const makeCsp = (pageHashes = []) => `default-src 'self'; script-src 'self' ${pageHashes.join(" ")}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src https://www.youtube-nocookie.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests`;
let pages = 0;
for (const file of await walk(root)) {
  if (!file.endsWith(".html")) continue;
  pages++;
  const pageHashes = new Set();
  const html = await readFile(file, "utf8");
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc=/.test(m[1]) || !m[2]) continue;
    const hash = `'sha256-${createHash("sha256").update(m[2]).digest("base64")}'`;
    hashes.add(hash); pageHashes.add(hash);
  }
  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  const csp = makeCsp([...pageHashes].sort());
  if (Buffer.byteLength(csp) > 32768) throw new Error(`CSP exceeds route header limit: ${relative}`);
  pagePolicies.push({ file: relative, hashes: [...pageHashes].sort(), csp });
}
pagePolicies.sort((a,b)=>a.file.localeCompare(b.file));
// Static HTML and RSC payloads are generated together. No dynamic personal content reaches them.
const csp = makeCsp();
const headers = [
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
// Build Output API is the sole deployment artifact. Remove the obsolete global-header
// export config rather than emit a second, incomplete security policy surface.
await rm(path.join(root, "vercel.json"), { force: true });
await writeFile(
  "output/security-headers.json",
  JSON.stringify(
    {
      pages,
      inlineScriptHashes: hashes.size,
      cspBytes: Buffer.byteLength(csp),
      scriptPolicy: "self + hashes; no unsafe-inline or unsafe-eval",
      headers,
      pagePolicies,
      defaultCsp: csp,
      maxPageCspBytes: Math.max(...pagePolicies.map(p=>Buffer.byteLength(p.csp))),
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
  { src: "^/corrections/?$", status: 308, headers: { Location: "/evidence/", "Content-Security-Policy": csp } },
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
for (const policy of pagePolicies) {
  const relative = policy.file;
  const canonical = relative.endsWith("index.html") ? relative.slice(0,-10).replace(/\/$/, "") : relative.replace(/\.html$/, "");
  const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const variants = [...new Set([canonical, relative])].map(escape);
  routes.push({ src: "^/(?:" + variants.join("|") + ")/?$", dest: "/" + relative, headers: { "Content-Security-Policy": policy.csp } });
}

routes.push(
  { src: "^/.*$", headers: { "Content-Security-Policy": csp }, continue: true },
  { handle: "filesystem" },
  { src: "^/.*$", dest: "/404.html", status: 404, headers: { "Content-Security-Policy": pagePolicies.find(p=>p.file==="404.html").csp } },
);
await writeFile(
  path.join(buildRoot, "config.json"),
  JSON.stringify({ version: 3, routes }, null, 2) + "\n",
);
console.log(
  "Vercel Build Output API artifact prepared: static files and matching response policy.",
);
