import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const requireFromSite = createRequire(path.join(root, "site", "package.json"));
const yaml = requireFromSite("js-yaml");
const maintainersDir = path.join(root, "content", "maintainers");
const outputDir = path.join(root, "public", "og");
const maintainerOutputDir = path.join(outputDir, "maintainers");

const fontMonoB64 = (await readFile(
  path.join(root, "site", "assets", "fonts", "geist-mono-latin.woff2"),
)).toString("base64");
const fontSansB64 = (await readFile(
  path.join(root, "site", "assets", "fonts", "inter-latin.woff2"),
)).toString("base64");

const fontDefs = `
  <defs><style>
    @font-face {
      font-family: 'Geist Mono';
      src: url('data:font/woff2;base64,${fontMonoB64}') format('woff2');
      font-weight: 400 700;
    }
    @font-face {
      font-family: 'Inter';
      src: url('data:font/woff2;base64,${fontSansB64}') format('woff2');
      font-weight: 400 700;
    }
  </style></defs>`;

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

function stripMarkdown(text) {
  return String(text || "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

async function loadImageBase64(filePath) {
  try {
    const abs = path.join(root, "public", filePath.replace(/^\//, ""));
    if (!existsSync(abs)) return null;
    const buf = await readFile(abs);
    const ext = path.extname(abs).toLowerCase();
    if (ext === ".svg") {
      return `data:image/svg+xml;base64,${buf.toString("base64")}`;
    }
    const mime = ext === ".png" ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

function renderOg({ title, eyebrow = "Forklore", description = "Maintainer stories from FOSS United", photoDataUri = null, logoDataUri = null }) {
  const maxTitleLen = photoDataUri ? 25 : 40;
  const safeTitle = escapeXml(truncate(title, maxTitleLen));
  const safeEyebrow = escapeXml(truncate(eyebrow, 60));
  const safeDescription = escapeXml(truncate(description, 70));
  const titleFontSize = safeTitle.length > 18 ? 44 : 58;

  const photoSvg = photoDataUri ? `
    <clipPath id="photoClip"><rect x="900" y="100" width="160" height="160"/></clipPath>
    <image href="${photoDataUri}" x="900" y="100" width="160" height="160" clip-path="url(#photoClip)" preserveAspectRatio="xMidYMid slice"/>
    <rect x="900" y="100" width="160" height="160" fill="none" stroke="#CFF2DA" stroke-width="3"/>` : "";

  const logoSvg = logoDataUri ? `
    <clipPath id="logoClip"><rect x="900" y="400" width="80" height="80"/></clipPath>
    <image href="${logoDataUri}" x="900" y="400" width="80" height="80" clip-path="url(#logoClip)" preserveAspectRatio="xMidYMid slice"/>
    <rect x="900" y="400" width="80" height="80" fill="none" stroke="#CFF2DA" stroke-width="2" stroke-opacity="0.5"/>` : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  ${fontDefs}
  <clipPath id="clip"><rect width="1200" height="630"/></clipPath>
  <g clip-path="url(#clip)">
    <rect width="1200" height="630" fill="#18222A"/>

    <!-- Dashed border frame -->
    <path d="M100 1941L100 0" stroke="white" stroke-opacity="0.2" stroke-width="3" stroke-dasharray="8 8"/>
    <path d="M1100 1941V0" stroke="white" stroke-opacity="0.2" stroke-width="3" stroke-dasharray="8 8"/>
    <path d="M-370 80L1571 80" stroke="white" stroke-opacity="0.2" stroke-width="3" stroke-dasharray="8 8"/>
    <path d="M-370 550H1571" stroke="white" stroke-opacity="0.2" stroke-width="3" stroke-dasharray="8 8"/>

    <!-- Corner crosshairs -->
    <path d="M92 80H108" stroke="#CFF2DA" stroke-width="3"/>
    <path d="M100 88V72" stroke="#CFF2DA" stroke-width="3"/>
    <path d="M92 550H108" stroke="#CFF2DA" stroke-width="3"/>
    <path d="M100 558V542" stroke="#CFF2DA" stroke-width="3"/>
    <path d="M1092 550H1108" stroke="#CFF2DA" stroke-width="3"/>
    <path d="M1100 558V542" stroke="#CFF2DA" stroke-width="3"/>
    <path d="M1092 80H1108" stroke="#CFF2DA" stroke-width="3"/>
    <path d="M1100 88V72" stroke="#CFF2DA" stroke-width="3"/>

    <!-- Header band -->
    <rect x="100" y="80" width="1000" height="260" fill="#CFF2DA" fill-opacity="0.2"/>

    <!-- Name -->
    <text x="150" y="230" fill="#CFF2DA" font-family="Geist Mono, monospace" font-size="${titleFontSize}" font-weight="700">${safeTitle}</text>

    <!-- Designation / description -->
    <text x="150" y="295" fill="#CFF2DA" font-family="Inter, sans-serif" font-size="24">${safeDescription}</text>

    <!-- Eyebrow (username) -->
    <text x="150" y="130" fill="#CFF2DA" font-family="Geist Mono, monospace" font-size="24" opacity="0.7">${safeEyebrow}</text>

    <!-- Bottom branding -->
    <text x="150" y="460" fill="#CFF2DA" font-family="Geist Mono, monospace" font-size="48" font-weight="700">Forklore</text>
    <rect x="430" y="443" width="30" height="9" fill="#CFF2DA"/>

    <!-- Subtitle -->
    <text x="150" y="500" fill="#CFF2DA" font-family="Geist Mono, monospace" font-size="16">By FOSS United</text>

    ${photoSvg}
    ${logoSvg}
  </g>
</svg>`;
}

function svgToPng(svgString) {
  return execFileSync("rsvg-convert", [
    "--width", "1200",
    "--format", "png",
  ], { input: svgString, maxBuffer: 10 * 1024 * 1024 });
}

await rm(outputDir, { force: true, recursive: true });
await mkdir(maintainerOutputDir, { recursive: true });

const indexSvg = renderOg({
  title: "Forklore",
  eyebrow: "forklore.in",
  description: "Confessions, quirks, and occasional rants from India's open source keepers.",
});
await writeFile(path.join(outputDir, "index.png"), svgToPng(indexSvg));

const files = (await readdir(maintainersDir))
  .filter((file) => file.endsWith(".md"))
  .sort((a, b) => a.localeCompare(b));

for (const file of files) {
  const data = frontmatter(await readFile(path.join(maintainersDir, file), "utf8"));
  if (!data.username) continue;

  const photoDataUri = data.photo ? await loadImageBase64(data.photo) : null;
  const firstLogo = data.projects?.[0]?.logo;
  const logoDataUri = firstLogo ? await loadImageBase64(firstLogo) : null;

  const svg = renderOg({
    title: data.full_name || data.username,
    eyebrow: `@${data.username}`,
    description: stripMarkdown(data.designation) || "Forklore maintainer profile",
    photoDataUri,
    logoDataUri,
  });
  await writeFile(path.join(maintainerOutputDir, `${data.username}.png`), svgToPng(svg));
}

console.log(`Generated ${files.length + 1} OG images (PNG) in public/og`);
