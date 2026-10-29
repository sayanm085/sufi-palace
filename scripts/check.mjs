import { readFile, readdir, stat } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { dirname, resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(project, "public");
const html = await readFile(resolve(root, "index.html"), "utf8");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const errors = [];
const references = new Set();
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicates.length)
  errors.push(`Duplicate HTML ids: ${duplicates.join(", ")}`);

async function checkReference(value, base, source) {
  if (!value || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) return;
  if (value.startsWith("#")) {
    if (!ids.includes(value.slice(1)))
      errors.push(`${source}: missing section ${value}`);
    return;
  }
  const pathname = decodeURIComponent(value.split(/[?#]/)[0]);
  const target = pathname.startsWith("/")
    ? resolve(root, `.${pathname}`)
    : resolve(base, pathname);
  if (target !== root && !target.startsWith(root + sep)) {
    errors.push(`${source}: reference leaves public/: ${value}`);
    return;
  }
  try {
    if (!(await stat(target)).isFile()) throw new Error("not a file");
    references.add(target);
  } catch {
    errors.push(`${source}: missing file ${value}`);
  }
}

for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
  await checkReference(match[1], root, "index.html");
}
for (const name of await readdir(resolve(root, "css"))) {
  const path = resolve(root, "css", name);
  const css = await readFile(path, "utf8");
  for (const match of css.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)) {
    await checkReference(match[1], dirname(path), `css/${name}`);
  }
}
for (const name of await readdir(resolve(root, "js"))) {
  const path = resolve(root, "js", name);
  execFileSync(process.execPath, ["--check", path], { stdio: "inherit" });
  const js = await readFile(path, "utf8");
  for (const match of js.matchAll(/['"](assets\/[^'"]+)['"]/g)) {
    await checkReference(match[1], root, `js/${name}`);
  }
  for (const match of js.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)) {
    await checkReference(match[1], dirname(path), `js/${name}`);
  }
}
const threeModule = resolve(root, "vendor/three.module.js");
const threeSource = await readFile(threeModule, "utf8");
for (const match of threeSource.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)) {
  await checkReference(
    match[1],
    dirname(threeModule),
    "vendor/three.module.js",
  );
}
const vercel = JSON.parse(
  await readFile(resolve(project, "vercel.json"), "utf8"),
);
if (vercel.outputDirectory !== "public")
  errors.push("Vercel must serve public/.");
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Ready: JavaScript syntax, section anchors and ${references.size} local file references checked.`,
  );
  console.log(`Vercel output: ${relative(project, root)}/`);
}
