import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
const root = path.resolve("out");
async function walk(p) {
  return (
    await Promise.all(
      (await readdir(p, { withFileTypes: true })).map((e) =>
        e.isDirectory() ? walk(path.join(p, e.name)) : path.join(p, e.name),
      ),
    )
  ).flat();
}
const files = await walk(root),
  htmlFiles = files.filter((f) => f.endsWith(".html"));
const errors = [],
  routes = [];
const forbidden =
  /docs\.google\.com\/document|private-reference\/|READABLE-THREAD|AHj4eM|Dragon Ball|conditional future|romantic longing|PPO_SYNTHETIC_PRIVATE/;
for (const f of files) {
  if (!/\.(html|js|txt|json|xml|md)$/.test(f)) continue;
  const data = await readFile(f, "utf8");
  if (forbidden.test(data))
    errors.push("Private/synthetic marker in " + path.relative(root, f));
}
for (const f of htmlFiles) {
  const html = await readFile(f, "utf8"),
    route = path.relative(root, f).replace(/index\.html$/, "");
  const headings = [...html.matchAll(/<h1\b/g)];
  if (headings.length !== 1) errors.push(route + ": expected one h1");
  if (!html.includes("<title>")) errors.push(route + ": missing title");
  for (const m of html.matchAll(/href="([^"#?]+)(?:[?#][^"]*)?"/g)) {
    let href = m[1];
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    try {
      href = decodeURIComponent(href);
    } catch {
      continue;
    }
    const exists =
      files.includes(path.join(root, href)) ||
      files.includes(path.join(root, href, "index.html"));
    if (!exists) errors.push(route + ": broken local link " + href);
  }
  routes.push({
    route: route || "/",
    htmlBytes: Buffer.byteLength(html),
    gzipBytes: gzipSync(html).length,
  });
}
const home = await readFile(path.join(root, "index.html"), "utf8");
const scripts = [
  ...new Set(
    [...home.matchAll(/<script\b([^>]*)>/g)]
      .filter((m) => !m[1].includes("noModule"))
      .map((m) => m[1].match(/src="([^"]+)"/)?.[1])
      .filter(Boolean),
  ),
];
let jsGzip = 0;
for (const src of scripts) {
  const file = path.join(root, src);
  jsGzip += gzipSync(await readFile(file)).length;
}
const report = {
  pages: htmlFiles.length,
  files: files.length,
  homeJsGzipBytes: jsGzip,
  homeHtmlGzipBytes: gzipSync(home).length,
  routes,
  errors,
};
await writeFile("output/export-audit.json", JSON.stringify(report, null, 2));
console.log(
  JSON.stringify({
    pages: report.pages,
    files: report.files,
    homeJsGzipBytes: jsGzip,
    homeHtmlGzipBytes: report.homeHtmlGzipBytes,
    errors,
  }),
);
if (errors.length) process.exit(1);
