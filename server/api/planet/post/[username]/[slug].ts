export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username");
  const slug = getRouterParam(event, "slug");

  if (!username || !slug) {
    throw createError({ statusCode: 400, message: "Username and slug are required" });
  }

  const context = getQuery(event).context as string | undefined;

  try {
    const [mData, maintainerData] = await Promise.all([
      queryCollection(event, "maintainers").path(`/maintainers/${username}`).first(),
      queryCollection(event, "planet").path(`/planet/${username}`).first(),
    ]);

    const maintainerPhoto = mData?.photo;

    if (context === "planet") {
      // Global context: prev/next spans all maintainers sorted by date
      const allMaintainerData = await queryCollection(event, "planet").all();

      type Entry = { post: any; maintainerName: string; maintainerUsername: string; feedUrl?: string };
      const allEntries: Entry[] = [];

      for (const md of allMaintainerData) {
        for (const p of md.posts || []) {
          allEntries.push({
            post: p,
            maintainerName: md.maintainerName,
            maintainerUsername: md.maintainerUsername,
            feedUrl: md.feedUrl,
          });
        }
      }

      allEntries.sort(
        (a, b) =>
          new Date(b.post.pubDate).getTime() - new Date(a.post.pubDate).getTime(),
      );

      const idx = allEntries.findIndex(
        (e) => e.maintainerUsername === username && e.post.slug === slug,
      );
      if (idx === -1) throw createError({ statusCode: 404, message: "Post not found" });

      const entry = allEntries[idx];
      const newerEntry = idx > 0 ? allEntries[idx - 1] : null;
      const olderEntry = idx < allEntries.length - 1 ? allEntries[idx + 1] : null;

      return {
        ...entry.post,
        maintainerName: entry.maintainerName,
        maintainerUsername: entry.maintainerUsername,
        maintainerPath: `/maintainers/${entry.maintainerUsername}`,
        feedUrl: entry.feedUrl,
        maintainerPhoto,
        newer: newerEntry
          ? { slug: newerEntry.post.slug, title: newerEntry.post.title, maintainerUsername: newerEntry.maintainerUsername }
          : null,
        older: olderEntry
          ? { slug: olderEntry.post.slug, title: olderEntry.post.title, maintainerUsername: olderEntry.maintainerUsername }
          : null,
      };
    }

    // Username-scoped context (default)
    if (!maintainerData) throw createError({ statusCode: 404, message: "Post not found" });

    const posts: any[] = maintainerData.posts;
    const index = posts.findIndex((p) => p.slug === slug);
    if (index === -1) throw createError({ statusCode: 404, message: "Post not found" });

    const post = posts[index];
    const newer = index > 0 ? posts[index - 1] : null;
    const older = index < posts.length - 1 ? posts[index + 1] : null;

    return {
      ...post,
      maintainerName: maintainerData.maintainerName,
      maintainerUsername: maintainerData.maintainerUsername,
      maintainerPath: `/maintainers/${maintainerData.maintainerUsername}`,
      feedUrl: maintainerData.feedUrl,
      maintainerPhoto,
      newer: newer ? { slug: newer.slug, title: newer.title, maintainerUsername: username } : null,
      older: older ? { slug: older.slug, title: older.title, maintainerUsername: username } : null,
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({ statusCode: 404, message: "Post not found" });
  }
});
