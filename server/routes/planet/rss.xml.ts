import { Feed } from "feed";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const BASE_URL = config.public.siteUrl || "https://forklore.in";

  const feed = new Feed({
    title: "Planet Forklore - Aggregated Blog Posts",
    description: "Aggregated blog posts from India's open source maintainers",
    id: `${BASE_URL}/planet`,
    link: `${BASE_URL}/planet`,
    language: "en",
    feedLinks: { rss: `${BASE_URL}/planet/rss.xml` },
    author: { name: "Forklore", link: BASE_URL },
    copyright: `All rights reserved ${new Date().getFullYear()}, Forklore`,
    updated: new Date(),
  });

  const allMaintainerData = await queryCollection(event, "planet").all();

  type Entry = { name: string; username: string; post: any };
  const allEntries: Entry[] = [];
  for (const md of allMaintainerData) {
    for (const post of md.posts || []) {
      allEntries.push({ name: md.maintainerName, username: md.maintainerUsername, post });
    }
  }

  allEntries.sort(
    (a, b) =>
      new Date(b.post.pubDate).getTime() - new Date(a.post.pubDate).getTime(),
  );

  for (const { name, username, post } of allEntries) {
    feed.addItem({
      title: post.title,
      id: post.link || post.guid || post.slug,
      link: post.link,
      description: post.contentSnippet,
      content: post.content,
      date: new Date(post.pubDate),
      author: [{ name: post.author || name, link: `${BASE_URL}/maintainers/${username}` }],
      category: (post.tags || []).map((t: string) => ({ name: t })),
      ...(post.image && { image: post.image }),
    });
  }

  setHeader(event, "Content-Type", "application/rss+xml; charset=utf-8");
  setHeader(event, "Cache-Control", "public, max-age=3600");

  return feed.rss2();
});
