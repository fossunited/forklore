export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const perPage = parseInt(query.perPage as string) || 20;
    const author = query.author as string | undefined;
    const tag = query.tag as string | undefined;
    const search = query.search as string | undefined;

    // Load maintainer photos and feed URLs
    const photoMap: Record<string, string | undefined> = {};
    const feedUrlMap: Record<string, string | undefined> = {};
    const maintainerList = await queryCollection(event, "maintainers").all();
    for (const m of maintainerList) {
      photoMap[m.username] = m.photo;
      feedUrlMap[m.username] = (m.socials as any[])?.find(
        (s) => s.label === "RSS",
      )?.link;
    }

    // Load all planet data
    const allMaintainerData = await queryCollection(event, "planet").all();

    if (!allMaintainerData.length) {
      return {
        posts: [],
        totalPosts: 0,
        totalPages: 0,
        currentPage: page,
        perPage,
        authors: [],
        tags: [],
      };
    }

    // Flatten all posts
    const allPosts = allMaintainerData.flatMap((md) =>
      (md.posts || []).map((post: any) => ({
        ...post,
        maintainerName: md.maintainerName,
        maintainerUsername: md.maintainerUsername,
        maintainerPath: `/maintainers/${md.maintainerUsername}`,
        feedUrl: md.feedUrl,
        maintainerPhoto: photoMap[md.maintainerUsername],
      })),
    );

    // Sort by date (newest first)
    allPosts.sort(
      (a, b) =>
        new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
    );

    // Filter posts
    let filteredPosts = allPosts;

    if (author) {
      filteredPosts = filteredPosts.filter(
        (p) => p.maintainerUsername.toLowerCase() === author.toLowerCase(),
      );
    }

    if (tag) {
      filteredPosts = filteredPosts.filter((p) =>
        p.tags.some((t: string) => t.toLowerCase() === tag.toLowerCase()),
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredPosts = filteredPosts.filter(
        (p) =>
          (p.title || "").toLowerCase().includes(searchLower) ||
          (p.contentSnippet || "").toLowerCase().includes(searchLower),
      );
    }

    // Unique authors
    const authorMap = new Map<
      string,
      { username: string; name: string; path: string; photo?: string; feedUrl?: string }
    >();
    for (const post of allPosts) {
      if (!authorMap.has(post.maintainerUsername)) {
        authorMap.set(post.maintainerUsername, {
          username: post.maintainerUsername,
          name: post.maintainerName,
          path: `/maintainers/${post.maintainerUsername}`,
          photo: photoMap[post.maintainerUsername],
          feedUrl: feedUrlMap[post.maintainerUsername],
        });
      }
    }
    const authors = Array.from(authorMap.values());

    const tagCounts = allPosts
      .flatMap((p) => p.tags as string[])
      .reduce(
        (acc, t) => {
          acc[t] = (acc[t] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );
    const tags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const totalPosts = filteredPosts.length;
    const totalPages = Math.ceil(totalPosts / perPage);
    const start = (page - 1) * perPage;
    const paginatedPosts = filteredPosts.slice(start, start + perPage);

    return {
      posts: paginatedPosts,
      totalPosts,
      totalPages,
      currentPage: page,
      perPage,
      authors,
      tags,
    };
  } catch (error) {
    console.error("Error in planet posts API:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to fetch planet posts",
    });
  }
});
