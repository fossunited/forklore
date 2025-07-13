import { promises as fs } from "fs";
import path from "path";
import { Feed } from "feed";

export default defineEventHandler(async () => {
  const contentDir = path.resolve("content/maintainers");
  const files = (await fs.readdir(contentDir)).filter((f) =>
    f.endsWith(".json")
  );

  const feed = new Feed({
    title: "Forklore Maintainers",
    description: "Maintainers and their community projects",
    id: "https://forklore.in/",
    link: "https://forklore.in/",
    language: "en",
    feedLinks: { rss: "https://forklore.in/rss" },
    author: { name: "Forklore", link: "https://forklore.in/" },
    copyright: `All rights reserved ${new Date().getFullYear()}, Forklore`,
  });

  for (const file of files) {
    const raw = await fs.readFile(path.join(contentDir, file), "utf-8");
    const data = JSON.parse(raw);

    const proj =
      ((data.projects || []) as { name: string }[])
        .map((p) => p.name)
        .join(", ") || "No projects listed";

        const filename = path.basename(file, ".json");
        const url = `https://forklore.in/maintainers/${filename.toLowerCase()}`;

    feed.addItem({
      title: data.full_name || data.username,
      id: url,
      link: url,
      description: `Projects: ${proj}`,
      date: new Date(),
    });
  }

  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/rss+xml" },
  });
});
