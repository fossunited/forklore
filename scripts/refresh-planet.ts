import Parser from "rss-parser";
import { promises as fs } from "fs";
import path from "path";

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

// Simple content cleanup
function cleanContent(content: string, postUrl: string): string {
  try {
    const url = new URL(postUrl);
    const base = `${url.protocol}//${url.host}`;
    return content
      .replace(/src=["']\/(?!\/)/g, `src="${base}/`)
      .replace(/href=["']\/(?!\/)/g, `href="${base}/`)
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "");
  } catch {
    return content;
  }
}

// Derive a readable slug from the RSS item's GUID/link
function getSlugFromGuid(guid: string): string {
  try {
    const url = new URL(guid);
    const parts = url.pathname.replace(/\/$/, "").split("/").filter(Boolean);
    if (parts.length > 0) {
      const last = parts[parts.length - 1];
      const clean = last
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 100);
      if (clean) return clean;
    }
  } catch {}
  // GUID is not a URL — clean it directly
  return (
    guid
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100) || "post"
  );
}

async function main() {
  const args = process.argv.slice(2);
  const planetDir = path.resolve("content/planet");
  await fs.mkdir(planetDir, { recursive: true });

  let feeds: Array<{ username: string; name: string; path: string; url: string }> = [];

  if (args.length > 0) {
    const potentialUsername = args[0];
    const maintainerFile = path.resolve(
      `content/maintainers/${potentialUsername}.json`,
    );

    try {
      await fs.access(maintainerFile);
      const m = JSON.parse(await fs.readFile(maintainerFile, "utf-8"));
      const rssfeed = m.socials?.find((s: any) => s.label === "RSS")?.link;
      if (!rssfeed) {
        console.error(`Error: ${potentialUsername} has no RSS entry in socials`);
        process.exit(1);
      }
      feeds = [
        {
          username: m.username,
          name: m.full_name,
          path: `/maintainers/${m.username}`,
          url: rssfeed,
        },
      ];
      console.log(`Refreshing only: ${potentialUsername}`);
    } catch {
      // Not a username — treat as RSS URLs
      feeds = args.map((url) => {
        const urlParts = url.match(/\/\/([^./]+)/);
        const username = urlParts ? `test-${urlParts[1]}` : `test-${Date.now()}`;
        return { username, name: username, path: `/test/${username}`, url };
      });
      console.log(`Testing with ${feeds.length} external URLs`);
    }
  } else {
    const files = (await fs.readdir("content/maintainers")).filter((f) =>
      f.endsWith(".json"),
    );
    const maintainers = await Promise.all(
      files.map(async (f) =>
        JSON.parse(await fs.readFile(`content/maintainers/${f}`, "utf-8")),
      ),
    );
    feeds = maintainers
      .filter((m) => m.socials?.some((s: any) => s.label === "RSS"))
      .map((m) => ({
        username: m.username,
        name: m.full_name,
        path: `/maintainers/${m.username}`,
        url: m.socials.find((s: any) => s.label === "RSS").link,
      }));
    console.log(`Refreshing all ${feeds.length} maintainers`);
  }

  console.log(`Fetching ${feeds.length} feeds in parallel...`);

  const results = await Promise.allSettled(
    feeds.map(async (feed) => {
      const rss = await parser.parseURL(feed.url);
      const file = path.join(planetDir, `${feed.username}.json`);

      let data: {
        maintainerName: string;
        maintainerUsername: string;
        feedUrl: string;
        lastFetched: string;
        posts: Array<Record<string, any>>;
      } = {
        maintainerName: feed.name,
        maintainerUsername: feed.username,
        feedUrl: feed.url,
        lastFetched: new Date().toISOString(),
        posts: [],
      };
      try {
        data = JSON.parse(await fs.readFile(file, "utf-8"));
        data.lastFetched = new Date().toISOString();
      } catch {}

      const existingByGuid = new Map(data.posts.map((p) => [p.guid, p]));
      const existingSlugs = new Set(data.posts.map((p) => p.slug));
      let newCount = 0;
      let updatedCount = 0;

      for (const item of rss.items) {
        const guid = item.guid || item.link || item.title || "";
        const fullContent =
          (item as any).contentEncoded ||
          item.content ||
          item.summary ||
          (item as any).description ||
          "";
        const author =
          (item as any).dcCreator ||
          (item as any).creator ||
          (Array.isArray((item as any).authors)
            ? (item as any).authors.join(", ")
            : undefined);
        const tags = (item.categories || [])
          .map((c: any) => (typeof c === "string" ? c : c?._ || ""))
          .filter(Boolean);

        const existing = existingByGuid.get(guid);
        if (existing) {
          // Update mutable fields in case the post was edited
          existing.title = item.title || existing.title;
          existing.content = cleanContent(fullContent, item.link || "");
          existing.contentSnippet = item.contentSnippet || existing.contentSnippet;
          existing.tags = tags.length ? tags : existing.tags;
          if (author) existing.author = author;
          updatedCount++;
          continue;
        }

        // New post — generate slug
        const baseSlug = getSlugFromGuid(item.link || guid);
        let slug = baseSlug;
        let suffix = 1;
        while (existingSlugs.has(slug)) {
          slug = `${baseSlug}-${suffix++}`;
        }
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

      data.posts.sort(
        (a, b) =>
          new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
      );
      await fs.writeFile(file, JSON.stringify(data, null, 2));

      return { username: feed.username, new: newCount, updated: updatedCount, total: rss.items.length };
    }),
  );

  let totalNew = 0;
  let success = 0;
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      totalNew += r.value.new;
      success++;
      console.log(
        `✓ ${r.value.username}: ${r.value.new} new, ${r.value.updated} updated / ${r.value.total} total`,
      );
    } else {
      const feed = feeds[i];
      const code = r.reason?.code || r.reason?.status || "";
      console.error(`✗ ${feed.username} (${feed.url})${code ? ` [${code}]` : ""}: ${r.reason?.message || r.reason}`);
    }
  });

  console.log(`\nDone! ${totalNew} new posts from ${success}/${feeds.length} feeds`);
  process.exit(success === 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
