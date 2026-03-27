import { promises as fs } from "fs";
import path from "path";

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username");
  const slug = getRouterParam(event, "slug");

  if (!username || !slug) {
    throw createError({ statusCode: 400, message: "Username and slug are required" });
  }

  try {
    const planetFile = path.join(
      path.resolve("content/planet"),
      `${username}.json`,
    );
    const raw = await fs.readFile(planetFile, "utf-8");
    const maintainerData = JSON.parse(raw);

    const posts: any[] = maintainerData.posts;
    const index = posts.findIndex((p) => p.slug === slug);
    if (index === -1) throw createError({ statusCode: 404, message: "Post not found" });

    const post = posts[index];

    // Posts are sorted newest-first, so index-1 = newer, index+1 = older
    const newer = index > 0 ? posts[index - 1] : null;
    const older = index < posts.length - 1 ? posts[index + 1] : null;

    const mData = await queryCollection(event, "maintainers")
      .path(`/maintainers/${username}`)
      .first();
    const maintainerPhoto = mData?.photo;

    return {
      ...post,
      maintainerName: maintainerData.maintainerName,
      maintainerUsername: maintainerData.maintainerUsername,
      maintainerPath: `/maintainers/${maintainerData.maintainerUsername}`,
      feedUrl: maintainerData.feedUrl,
      maintainerPhoto,
      newer: newer ? { slug: newer.slug, title: newer.title } : null,
      older: older ? { slug: older.slug, title: older.title } : null,
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({ statusCode: 404, message: "Post not found" });
  }
});
