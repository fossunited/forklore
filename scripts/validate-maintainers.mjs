import { access, readdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const root = process.cwd();
const requireFromSite = createRequire(path.join(root, "site", "package.json"));
const yaml = requireFromSite("js-yaml");
const maintainersDir = path.join(root, "content", "maintainers");
const publicDir = path.join(root, "public");
const routePattern = /^[a-zA-Z0-9_-]+$/;
const remoteImagePattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp|bmp|ico|avif)(\?.*)?$/i;
const localImagePattern = /^\/images\/.+\.(jpg|jpeg|png|gif|svg|webp|bmp|ico|avif)$/i;
const urlPattern = /^https?:\/\/.+/i;

const errors = [];
const warnings = [];
const usernames = new Map();

function location(file, message) {
  return `${path.relative(root, file)}: ${message}`;
}

function parseFrontmatter(file, source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    errors.push(location(file, "missing YAML frontmatter"));
    return null;
  }

  try {
    return yaml.load(match[1]);
  } catch (error) {
    errors.push(location(file, `invalid frontmatter: ${error.message}`));
    return null;
  }
}

async function existsLocalAsset(assetPath) {
  const normalized = assetPath.replace(/^\/+/, "");
  try {
    await access(path.join(publicDir, normalized));
    return true;
  } catch {
    return false;
  }
}

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

async function validateImage(file, field, value) {
  if (!hasText(value)) {
    warnings.push(location(file, `${field} is empty`));
    return;
  }

  if (localImagePattern.test(value)) {
    if (!(await existsLocalAsset(value))) {
      errors.push(location(file, `${field} points to missing local asset: ${value}`));
    }
    return;
  }

  if (!remoteImagePattern.test(value)) {
    errors.push(location(file, `${field} must be a remote image URL or /images/... asset`));
  }
}

function validateUrl(file, field, value, required = true) {
  if (!hasText(value)) {
    if (required) warnings.push(location(file, `${field} is empty`));
    return;
  }

  if (!urlPattern.test(value)) {
    errors.push(location(file, `${field} must start with http:// or https://`));
  }
}

async function validateMaintainer(file, data, body) {
  if (!isObject(data)) {
    errors.push(location(file, "frontmatter must be an object"));
    return;
  }

  if (!routePattern.test(data.username || "")) {
    warnings.push(location(file, "username is not route-safe: letters, numbers, underscores, hyphens"));
  } else if (usernames.has(data.username)) {
    errors.push(location(file, `duplicate username also used by ${usernames.get(data.username)}`));
  } else {
    usernames.set(data.username, path.relative(root, file));
  }

  if (data.layout !== "maintainer.njk") errors.push(location(file, "layout must be maintainer.njk"));
  if (data.tags !== "maintainer") errors.push(location(file, "tags must be maintainer"));
  if (data.permalink !== `/maintainers/${data.username}/`) {
    errors.push(location(file, "permalink must match /maintainers/<username>/"));
  }
  if (!hasText(data.full_name)) errors.push(location(file, "full_name is required"));
  if (!hasText(data.designation)) warnings.push(location(file, "designation is empty"));
  if (Number.isNaN(new Date(data.created_on).getTime())) {
    errors.push(location(file, "created_on must be a valid date"));
  }

  await validateImage(file, "photo", data.photo);

  if (!Array.isArray(data.socials) || data.socials.length === 0) {
    errors.push(location(file, "socials must contain at least one item"));
  } else {
    data.socials.forEach((social, index) => {
      if (!isObject(social)) {
        errors.push(location(file, `socials[${index}] must be an object`));
        return;
      }
      if (!hasText(social.label)) errors.push(location(file, `socials[${index}].label is required`));
      validateUrl(file, `socials[${index}].link`, social.link);
    });
  }

  if (!Array.isArray(data.projects) || data.projects.length === 0) {
    errors.push(location(file, "projects must contain at least one item"));
  } else {
    for (const [index, project] of data.projects.entries()) {
      if (!isObject(project)) {
        errors.push(location(file, `projects[${index}] must be an object`));
        continue;
      }

      if (!hasText(project.name)) errors.push(location(file, `projects[${index}].name is required`));
      validateUrl(file, `projects[${index}].project_link`, project.project_link);
      validateUrl(file, `projects[${index}].website_link`, project.website_link);
      if (!hasText(project.short_description)) {
        warnings.push(location(file, `projects[${index}].short_description is empty`));
      }
      if (!hasText(project.description)) {
        warnings.push(location(file, `projects[${index}].description is empty`));
      }
      if (hasText(project.logo)) {
        await validateImage(file, `projects[${index}].logo`, project.logo);
      }
    }
  }

  const responseCount = [...body.matchAll(/^## /gm)].length;
  if (responseCount !== 8) {
    warnings.push(location(file, `body has ${responseCount} response sections; expected 8`));
  }
}

const files = (await readdir(maintainersDir))
  .filter((file) => file.endsWith(".md"))
  .sort((a, b) => a.localeCompare(b));

for (const name of files) {
  const file = path.join(maintainersDir, name);
  const source = await readFile(file, "utf8");
  const data = parseFrontmatter(file, source);
  const body = source.replace(/^---\n[\s\S]*?\n---\n?/, "");
  if (data) await validateMaintainer(file, data, body);
}

if (warnings.length) {
  console.warn(`Maintainer validation warnings (${warnings.length}):`);
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length) {
  console.error(`Maintainer validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${files.length} maintainer records.`);
