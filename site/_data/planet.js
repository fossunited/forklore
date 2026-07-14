import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const root = process.cwd();

function frontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  return match ? yaml.load(match[1]) || {} : {};
}

function readMaintainers() {
  const dir = path.join(root, "content", "maintainers");
  const maintainers = new Map();
  for (const file of readdirSync(dir).filter((name) => name.endsWith(".md"))) {
    const data = frontmatter(readFileSync(path.join(dir, file), "utf8"));
    if (data.username) maintainers.set(String(data.username).toLowerCase(), data);
  }
  return maintainers;
}

function readPlanet() {
  const dir = path.join(root, "content", "planet");
  const maintainers = readMaintainers();
  const docs = [];

  try {
    for (const file of readdirSync(dir).filter((name) => name.endsWith(".json"))) {
      const doc = JSON.parse(readFileSync(path.join(dir, file), "utf8"));
      const maintainer = maintainers.get(String(doc.maintainerUsername || "").toLowerCase());
      docs.push({
        ...doc,
        maintainerPhoto: maintainer?.photo || "",
        maintainerDesignation: maintainer?.designation || "",
      });
    }
  } catch {
    return { authors: [], posts: [], tags: [], totalPosts: 0 };
  }

  const posts = docs
    .flatMap((doc) =>
      (doc.posts || []).map((post) => ({
        ...post,
        maintainerName: doc.maintainerName,
        maintainerUsername: doc.maintainerUsername,
        maintainerPhoto: doc.maintainerPhoto,
        maintainerDesignation: doc.maintainerDesignation,
        feedUrl: doc.feedUrl,
      })),
    )
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  const tagCounts = new Map();
  for (const post of posts) {
    for (const tag of post.tags || []) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }

  return {
    authors: docs
      .map((doc) => ({
        name: doc.maintainerName,
        username: doc.maintainerUsername,
        photo: doc.maintainerPhoto,
        feedUrl: doc.feedUrl,
        posts: doc.posts?.length || 0,
        lastFetched: doc.lastFetched,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    posts,
    tags: [...tagCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    totalPosts: posts.length,
  };
}

export default readPlanet();
