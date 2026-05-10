import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const basePath = (process.argv[2] || "").replace(/\/+$/, "");

const excluded = new Set([".git", ".github", ".gitignore", "dist", "scripts"]);
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".map",
  ".txt",
  ".webmanifest",
  ".xml",
]);

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (!shouldCopy(entry.name)) continue;
  fs.cpSync(path.join(root, entry.name), path.join(dist, entry.name), {
    recursive: true,
    force: true,
  });
}

if (basePath) {
  for (const file of walk(dist)) {
    if (!textExtensions.has(path.extname(file))) continue;
    const original = fs.readFileSync(file, "utf8");
    const updated = prefixRootPaths(original, basePath);
    if (updated !== original) fs.writeFileSync(file, updated);
  }
}

function* walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else {
      yield fullPath;
    }
  }
}

function prefixRootPaths(content, prefix) {
  return content
    .replaceAll('"/_next/', `"${prefix}/_next/`)
    .replaceAll("'/_next/", `'${prefix}/_next/`)
    .replaceAll('\\"/_next/', `\\"${prefix}/_next/`)
    .replaceAll("url(/_next/", `url(${prefix}/_next/`)
    .replaceAll("url(/arow.svg", `url(${prefix}/arow.svg`)
    .replaceAll('"/logo-nalich.png', `"${prefix}/logo-nalich.png`)
    .replaceAll('"/hero-bg.png', `"${prefix}/hero-bg.png`)
    .replaceAll('"/arow.svg', `"${prefix}/arow.svg`)
    .replaceAll('\\"/logo-nalich.png', `\\"${prefix}/logo-nalich.png`)
    .replaceAll('\\"/hero-bg.png', `\\"${prefix}/hero-bg.png`)
    .replaceAll('\\"/arow.svg', `\\"${prefix}/arow.svg`)
    .replaceAll(";/spokojstvie", `;${prefix}/spokojstvie`)
    .replaceAll(";/audit-dolgov", `;${prefix}/audit-dolgov`)
    .replaceAll('href="/spokojstvie', `href="${prefix}/spokojstvie`)
    .replaceAll('href="/audit-dolgov', `href="${prefix}/audit-dolgov`)
    .replaceAll('src="/logo-nalich.png', `src="${prefix}/logo-nalich.png`)
    .replaceAll('src="/hero-bg.png', `src="${prefix}/hero-bg.png`)
    .replaceAll('src="/arow.svg', `src="${prefix}/arow.svg`);
}

function shouldCopy(name) {
  if (excluded.has(name)) return false;
  if (/^\.codex-.*\.log$/.test(name)) return false;
  return true;
}
