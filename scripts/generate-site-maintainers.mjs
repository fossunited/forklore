import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourceDir = path.join(root, "content", "maintainers");
const outputDir = path.join(root, "site", "maintainers");

function scalar(value) {
  if (value === undefined || value === null) return '""';
  return JSON.stringify(String(value));
}

function block(value, indent = "      ") {
  const text = String(value || "");
  if (!text.trim()) return `${indent}""`;
  return text
    .split(/\r?\n/)
    .map((line) => `${indent}${line}`)
    .join("\n");
}

function listItems(items, renderItem) {
  if (!Array.isArray(items) || !items.length) return "[]";
  return `\n${items.map(renderItem).join("\n")}`;
}

function renderMaintainer(data) {
  const socials = listItems(
    data.socials,
    (social) => `  - label: ${scalar(social.label)}
    link: ${scalar(social.link)}`,
  );

  const projects = listItems(
    data.projects,
    (project) => `  - name: ${scalar(project.name)}
    project_link: ${scalar(project.project_link)}
    website_link: ${scalar(project.website_link)}
    logo: ${scalar(project.logo)}
    short_description: ${scalar(project.short_description)}
    description: |-
${block(project.description)}`,
  );

  const responses = Array.isArray(data.form)
    ? data.form
        .filter((item) => item.question || item.response)
        .map(
          (item) => `## ${item.question}

${item.response || ""}
`,
        )
        .join("\n")
    : "";

  return `---
layout: maintainer.njk
tags: maintainer
permalink: /maintainers/${data.username}/
username: ${scalar(data.username)}
full_name: ${scalar(data.full_name)}
photo: ${scalar(data.photo)}
designation: ${scalar(data.designation)}
created_on: ${scalar(data.created_on)}
socials:${socials}
projects:${projects}
---

${responses}`;
}

await rm(outputDir, { force: true, recursive: true });
await mkdir(outputDir, { recursive: true });

const files = (await readdir(sourceDir))
  .filter((file) => file.endsWith(".json"))
  .sort((a, b) => a.localeCompare(b));

for (const file of files) {
  const data = JSON.parse(await readFile(path.join(sourceDir, file), "utf8"));
  const outputName = `${data.username || path.basename(file, ".json")}.md`;
  await writeFile(path.join(outputDir, outputName), renderMaintainer(data));
}

console.log(`Generated ${files.length} maintainer pages in site/maintainers`);
