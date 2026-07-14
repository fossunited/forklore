import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const root = process.cwd();
const requireFromSite = createRequire(path.join(root, "site", "package.json"));
const yaml = requireFromSite("js-yaml");
const maintainersDir = path.join(root, "content", "maintainers");
const outputDir = path.join(root, "public", "og");
const maintainerOutputDir = path.join(outputDir, "maintainers");

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(value, maxLength) {
  const text = String(value || "").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function frontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  return match ? yaml.load(match[1]) : {};
}

function renderOg({ title, eyebrow = "Forklore", description = "Maintainer stories from FOSS United" }) {
  const safeTitle = escapeXml(truncate(title, 72));
  const safeEyebrow = escapeXml(truncate(eyebrow, 60));
  const safeDescription = escapeXml(truncate(description, 110));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#18222a"/>
  <path d="M72 74h1056v482H72z" fill="none" stroke="#cff2da" stroke-width="4" stroke-dasharray="16 14"/>
  <rect x="112" y="108" width="976" height="414" fill="#3c4b4e"/>
  <text x="152" y="178" fill="#cff2da" font-family="monospace" font-size="34" letter-spacing="3">${safeEyebrow}</text>
  <text x="152" y="312" fill="#cff2da" font-family="monospace" font-size="78" font-weight="700">${safeTitle}</text>
  <text x="152" y="386" fill="#fafafa" font-family="sans-serif" font-size="34">${safeDescription}</text>
  <text x="152" y="482" fill="#cff2da" font-family="monospace" font-size="30">forklore.in · FOSS United</text>
</svg>
`;
}

await rm(outputDir, { force: true, recursive: true });
await mkdir(maintainerOutputDir, { recursive: true });

await writeFile(
  path.join(outputDir, "index.svg"),
  renderOg({
    title: "Forklore",
    description: "Confessions, quirks, and occasional rants from India's open source keepers.",
  }),
);

const files = (await readdir(maintainersDir))
  .filter((file) => file.endsWith(".md"))
  .sort((a, b) => a.localeCompare(b));

for (const file of files) {
  const data = frontmatter(await readFile(path.join(maintainersDir, file), "utf8"));
  if (!data.username) continue;
  await writeFile(
    path.join(maintainerOutputDir, `${data.username}.svg`),
    renderOg({
      title: data.full_name || data.username,
      eyebrow: `@${data.username}`,
      description: data.designation || "Forklore maintainer profile",
    }),
  );
}

console.log(`Generated ${files.length + 1} OG images in public/og`);
