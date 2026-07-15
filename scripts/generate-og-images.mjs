import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const root = process.cwd();
const requireFromSite = createRequire(path.join(root, "site", "package.json"));
const yaml = requireFromSite("js-yaml");
const { Resvg } = requireFromSite("@resvg/resvg-js");
const maintainersDir = path.join(root, "content", "maintainers");
const outputDir = path.join(root, "public", "og");
const maintainerOutputDir = path.join(outputDir, "maintainers");

const fontMono = await readFile(
  path.join(root, "site", "assets", "fonts", "geist-mono-latin.woff2"),
);
const fontSans = await readFile(
  path.join(root, "site", "assets", "fonts", "inter-latin.woff2"),
);

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

function renderOg({ title, eyebrow = "Forklore", description = "Maintainer stories from FOSS United" }) {
  const safeTitle = escapeXml(truncate(title, 30));
  const safeEyebrow = escapeXml(truncate(eyebrow, 60));
  const safeDescription = escapeXml(truncate(description, 60));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
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
    <text x="150" y="230" fill="#CFF2DA" font-family="Geist Mono, monospace" font-size="58" font-weight="700">${safeTitle}</text>

    <!-- Designation / description -->
    <text x="150" y="295" fill="#CFF2DA" font-family="Inter, sans-serif" font-size="24">${safeDescription}</text>

    <!-- Eyebrow (username) -->
    <text x="150" y="130" fill="#CFF2DA" font-family="Geist Mono, monospace" font-size="24" opacity="0.7">${safeEyebrow}</text>

    <!-- Bottom branding -->
    <text x="150" y="460" fill="#CFF2DA" font-family="Geist Mono, monospace" font-size="48" font-weight="700">Forklore</text>
    <rect x="430" y="443" width="30" height="9" fill="#CFF2DA"/>

    <!-- Subtitle -->
    <text x="150" y="500" fill="#CFF2DA" font-family="Geist Mono, monospace" font-size="16">By FOSS United</text>
  </g>
</svg>`;
}

function svgToPng(svg) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
    font: {
      fontBuffers: [fontMono, fontSans],
      loadSystemFonts: false,
    },
  });
  return resvg.render().asPng();
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
  const svg = renderOg({
    title: data.full_name || data.username,
    eyebrow: `@${data.username}`,
    description: stripMarkdown(data.designation) || "Forklore maintainer profile",
  });
  await writeFile(path.join(maintainerOutputDir, `${data.username}.png`), svgToPng(svg));
}

console.log(`Generated ${files.length + 1} OG images (PNG) in public/og`);
