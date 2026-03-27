import Parser from "rss-parser";
import { Feed } from "feed";
import { promises as fs } from "fs";
import path from "path";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const BASE_URL = config.public.siteUrl || "https://forklore.in";

  try {
    // Create the aggregated feed using the same Feed package you already use
    const feed = new Feed({
      title: "Forklore Planet - Aggregated Blog Posts",
      description: "Aggregated blog posts from India's open source maintainers",
      id: `${BASE_URL}/planet`,
      link: `${BASE_URL}/planet`,
      language: "en",
      feedLinks: {
        rss: `${BASE_URL}/planet/rss`,
        atom: `${BASE_URL}/planet/atom`,
      },
      author: { name: "Forklore", link: BASE_URL },
      copyright: `All rights reserved ${new Date().getFullYear()}, Forklore`,
      updated: new Date(),
      ttl: 60, // Cache for 60 minutes
    });

    const parser = new Parser({
      timeout: 10000,
      headers: {
        "User-Agent": "Forklore-Planet/1.0",
      },
    });

    const contentDir = path.resolve("content/maintainers");
    const files = (await fs.readdir(contentDir)).filter((f) =>
      f.endsWith(".json"),
    );

    const maintainers = await Promise.all(
      files.map(async (file) => {
        const raw = await fs.readFile(path.join(contentDir, file), "utf-8");
        return JSON.parse(raw);
      }),
    );
    // Filter maintainers with RSS feeds
    const maintainersWithFeeds = maintainers.filter((m) => m.rssfeed);

    // Fetch all RSS feeds
    const feedPromises = maintainersWithFeeds.map(async (maintainer) => {
      try {
        const rssFeed = await parser.parseURL(maintainer.rssfeed);

        return rssFeed.items.map((item) => ({
          title: item.title || "Untitled",
          id: item.link || item.guid || "",
          link: item.link || "",
          description: item.contentSnippet || item.summary || "",
          content:
            item.content || item["content:encoded"] || item.summary || "",
          date: new Date(item.pubDate || item.isoDate || Date.now()),
          author: [
            {
              name: `${maintainer.full_name} (${maintainer.username})`,
              link: `https://forklore.in${maintainer.path}`,
            },
          ],
          category: item.categories?.map((cat) => ({ name: cat })) || [],
        }));
      } catch (error) {
        console.error(`Error fetching feed for ${maintainer.username}:`, error);
        return [];
      }
    });

    const allPostsArrays = await Promise.all(feedPromises);
    const allPosts = allPostsArrays
      .flat()
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    // Add all posts to the feed
    allPosts.forEach((post) => {
      feed.addItem(post);
    });

    const feedString = feed.rss2();

    setHeader(event, "Content-Type", "application/rss+xml; charset=utf-8");
    setHeader(event, "Cache-Control", "public, max-age=3600"); // Cache for 1 hour

    return feedString;
  } catch (error) {
    console.error("Error generating planet RSS feed:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to generate planet RSS feed",
    });
  }
});
