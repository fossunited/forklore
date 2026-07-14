import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const root = process.cwd();
const requireFromSite = createRequire(path.join(root, "site", "package.json"));
const Parser = requireFromSite("rss-parser");
const yaml = requireFromSite("js-yaml");
const parser = new Parser({
  timeout: 30000,
  maxRedirects: 10,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; Forklore/1.0; +https://forklore.in)",
  },
  customFields: {
    item: [
      ["content:encoded", "contentEncoded"],
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
      ["dc:creator", "dcCreator"],
    ],
  },
});

function frontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  return match ? yaml.load(match[1]) || {} : {};
}

function cleanContent(content, postUrl) {
  try {
    const url = new URL(postUrl);
    const base = `${url.protocol}//${url.host}`;
    return String(content || "")
      .replace(/src=["']\/(?!\/)/g, `src="${base}/`)
      .replace(/href=["']\/(?!\/)/g, `href="${base}/`)
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "");
  } catch {
    return String(content || "");
  }
}

function getSlugFromGuid(guid) {
  try {
    const url = new URL(guid);
    const parts = url.pathname.replace(/\/$/, "").split("/").filter(Boolean);
    const last = parts.at(-1);
    const clean = last?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
    if (clean) return clean;
  } catch {}
  return String(guid || "post").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "post";
}

async function readMaintainers() {
  const dir = path.join(root, "content", "maintainers");
  const files = (await readdir(dir)).filter((file) => file.endsWith(".md"));
  const maintainers = await Promise.all(
    files.map(async (file) => frontmatter(await readFile(path.join(dir, file), "utf8"))),
  );
  return maintainers.filter((m) => m.username);
}

async function main() {
  const args = process.argv.slice(2);
  const planetDir = path.join(root, "content", "planet");
  await mkdir(planetDir, { recursive: true });

  const maintainers = await readMaintainers();
  let feeds = maintainers
    .map((m) => {
      const rss = m.socials?.find((s) => String(s.label || "").toLowerCase() === "rss")?.link;
      return rss
        ? { username: m.username, name: m.full_name, path: `/maintainers/${m.username}`, url: rss }
        : null;
    })
    .filter(Boolean);

  if (args.length) {
    const wanted = new Set(args.map((arg) => arg.toLowerCase()));
    feeds = feeds.filter((feed) => wanted.has(String(feed.username).toLowerCase()) || wanted.has(feed.url.toLowerCase()));
    if (!feeds.length) {
      feeds = args.map((url) => {
        const urlParts = url.match(/\/\/([^./]+)/);
        const username = urlParts ? `test-${urlParts[1]}` : `test-${Date.now()}`;
        return { username, name: username, path: `/test/${username}`, url };
      });
    }
  }

  console.log(`Fetching ${feeds.length} feeds in parallel...`);

  const results = await Promise.allSettled(
    feeds.map(async (feed) => {
      const rss = await parser.parseURL(feed.url);
      const file = path.join(planetDir, `${feed.username}.json`);

      let data = {
        maintainerName: feed.name,
        maintainerUsername: feed.username,
        feedUrl: feed.url,
        lastFetched: new Date().toISOString(),
        posts: [],
      };
      try {
        data = JSON.parse(await readFile(file, "utf8"));
      } catch {}

      const existingByGuid = new Map(data.posts.map((post) => [post.guid, post]));
      const existingSlugs = new Set(data.posts.map((post) => post.slug));
      let newCount = 0;
      let updatedCount = 0;

      for (const item of rss.items) {
        const guid = item.guid || item.link || item.title || "";
        const fullContent =
          item.contentEncoded || item.content || item.summary || item.description || "";
        const author =
          item.dcCreator || item.creator || (Array.isArray(item.authors) ? item.authors.join(", ") : undefined);
        const tags = (item.categories || [])
          .map((category) => (typeof category === "string" ? category : category?._ || ""))
          .filter(Boolean);

        const existing = existingByGuid.get(guid);
        if (existing) {
          existing.title = item.title || existing.title;
          existing.content = cleanContent(fullContent, item.link || "");
          existing.contentSnippet = item.contentSnippet || existing.contentSnippet;
          existing.tags = tags.length ? tags : existing.tags;
          if (author) existing.author = author;
          updatedCount++;
          continue;
        }

        const baseSlug = getSlugFromGuid(item.link || guid);
        let slug = baseSlug;
        let suffix = 1;
        while (existingSlugs.has(slug)) slug = `${baseSlug}-${suffix++}`;
        existingSlugs.add(slug);

        data.posts.push({
          slug,
          guid,
          title: item.title || "Untitled",
          link: item.link || "",
          pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
          content: cleanContent(fullContent, item.link || ""),
          contentSnippet: item.contentSnippet || "",
          ...(author && { author }),
          tags,
        });
        newCount++;
      }

      data.posts.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

      const hasChanges = newCount > 0 || updatedCount > 0;
      if (hasChanges) {
        data.lastFetched = new Date().toISOString();
      }
      await writeFile(file, `${JSON.stringify(data, null, 2)}\n`);

      return { username: feed.username, new: newCount, updated: updatedCount, total: rss.items.length };
    }),
  );

  let totalNew = 0;
  let success = 0;
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      totalNew += result.value.new;
      success++;
      console.log(`OK ${result.value.username}: ${result.value.new} new, ${result.value.updated} updated / ${result.value.total} total`);
    } else {
      const feed = feeds[index];
      const code = result.reason?.code || result.reason?.status || "";
      console.error(`ERR ${feed.username} (${feed.url})${code ? ` [${code}]` : ""}: ${result.reason?.message || result.reason}`);
    }
  });

  console.log(`Done. ${totalNew} new posts from ${success}/${feeds.length} feeds`);
  process.exit(success === 0 && feeds.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
