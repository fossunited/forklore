import Parser from "rss-parser";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

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

async function main() {
  const args = process.argv.slice(2);
  const planetDir = path.resolve("content/planet");
  await fs.mkdir(planetDir, { recursive: true });

  let feeds = [];

  if (args.length > 0) {
    // Check if first arg is a username
    const potentialUsername = args[0];
    const maintainerFile = path.resolve(
      `content/maintainers/${potentialUsername}.json`,
    );

    try {
      await fs.access(maintainerFile);
      // It's a username - refresh only this maintainer
      const m = JSON.parse(await fs.readFile(maintainerFile, "utf-8"));
      if (!m.rssfeed) {
        console.error(`Error: ${potentialUsername} has no rssfeed field`);
        process.exit(1);
      }
      feeds = [
        {
          username: m.username,
          name: m.full_name,
          path: m.path,
          url: m.rssfeed,
        },
      ];
      console.log(`Refreshing only: ${potentialUsername}`);
    } catch {
      // Not a username - treat as RSS URLs
      feeds = args.map((url) => {
        // Extract username from URL if possible
        const urlParts = url.match(/\/\/([^.\/]+)/);
        const username = urlParts
          ? `test-${urlParts[1]}`
          : `test-${Date.now()}`;
        return { username, name: username, path: `/test/${username}`, url };
      });
      console.log(`Testing with ${feeds.length} external URLs`);
    }
  } else {
    // No args - refresh all maintainers
    const files = (await fs.readdir("content/maintainers")).filter((f) =>
      f.endsWith(".json"),
    );
    const maintainers = await Promise.all(
      files.map(async (f) =>
        JSON.parse(await fs.readFile(`content/maintainers/${f}`, "utf-8")),
      ),
    );
    feeds = maintainers
      .filter((m) => m.rssfeed)
      .map((m) => ({
        username: m.username,
        name: m.full_name,
        path: m.path,
        url: m.rssfeed,
      }));
    console.log(`Refreshing all ${feeds.length} maintainers`);
  }
  console.log(`Fetching ${feeds.length} feeds in parallel...`);

  // Fetch all in parallel
  const results = await Promise.allSettled(
    feeds.map(async (feed) => {
      const rss = await parser.parseURL(feed.url);
      const file = path.join(planetDir, `${feed.username}.json`);

      // Load existing or create new
      let data = {
        maintainerName: feed.name,
        maintainerUsername: feed.username,
        maintainerPath: feed.path,
        feedUrl: feed.url,
        lastFetched: new Date().toISOString(),
        posts: [],
      };
      try {
        data = JSON.parse(await fs.readFile(file, "utf-8"));
        data.lastFetched = new Date().toISOString();
      } catch {}

      const existingGuids = new Set(data.posts.map((p) => p.guid));
      let newCount = 0;

      // Add new posts
      for (const item of rss.items) {
        const guid = item.guid || item.link || item.title || "";
        if (existingGuids.has(guid)) continue;

        const id = crypto.createHash("md5").update(guid).digest("hex");
        const slug = `${feed.username}-${id.slice(0, 8)}-${(
          item.title || "post"
        )
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .slice(0, 80)}`;

        data.posts.push({
          id,
          slug,
          guid,
          title: item.title || "Untitled",
          link: item.link || "",
          pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
          author: item.creator || item.author || feed.name,
          content: cleanContent(
            item.content || item["content:encoded"] || item.summary || "",
            item.link || "",
          ),
          contentSnippet: item.contentSnippet || item.summary || "",
          tags: item.categories || [],
        });
        newCount++;
      }

      // Sort by date, save
      data.posts.sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
      );
      await fs.writeFile(file, JSON.stringify(data, null, 2));

      return {
        username: feed.username,
        new: newCount,
        total: rss.items.length,
      };
    }),
  );

  // Summary
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

  console.log(
    `\nDone! ${totalNew} new posts from ${success}/${feeds.length} feeds`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
