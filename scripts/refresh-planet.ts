import Parser from "rss-parser";
import { promises as fs } from "fs";
import path from "path";

const parser = new Parser({ timeout: 10000 });

// Simple content cleanup
function cleanContent(content: string, postUrl: string): string {
  try {
    const url = new URL(postUrl);
    const base = `${url.protocol}//${url.host}`;
    return content
      .replace(/src=["']\/(?!\/)/g, `src="${base}/`)
      .replace(/href=["']\/(?!\/)/g, `href="${base}/`)
      .replace(/<script[\s\S]*?<\/script>/gi, "");
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

      const existingGuids = new Set(data.posts.map((p) => p.guid));
      const existingSlugs = new Set(data.posts.map((p) => p.slug));
      let newCount = 0;

      for (const item of rss.items) {
        const guid = item.guid || item.link || item.title || "";
        if (existingGuids.has(guid)) continue;

        // Generate a clean, readable slug from the GUID/link
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
          content: cleanContent(
            item.content || item["content:encoded"] || item.summary || "",
            item.link || "",
          ),
          contentSnippet: item.contentSnippet || item.summary || "",
          tags: (item.categories || [])
            .map((c: any) => (typeof c === "string" ? c : c?._ || ""))
            .filter(Boolean),
        });
        newCount++;
      }

      data.posts.sort(
        (a, b) =>
          new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
      );
      await fs.writeFile(file, JSON.stringify(data, null, 2));

      return { username: feed.username, new: newCount, total: rss.items.length };
    }),
  );

  let totalNew = 0;
  let success = 0;
  results.forEach((r) => {
    if (r.status === "fulfilled") {
      totalNew += r.value.new;
      success++;
      console.log(
        `✓ ${r.value.username}: ${r.value.new} new / ${r.value.total} total`,
      );
    } else {
      console.error(`✗ Error: ${r.reason}`);
    }
  });

  console.log(`\nDone! ${totalNew} new posts from ${success}/${feeds.length} feeds`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
