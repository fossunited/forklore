export const usePlanetMetaData = () =>
  useAsyncData("planet-meta", async () => {
    const [planetDocs, maintainerDocs] = await Promise.all([
      queryCollection("planet").all(),
      queryCollection("maintainers").all(),
    ]);

    const photoMap: Record<string, string | undefined> = {};
    for (const m of maintainerDocs) {
      photoMap[m.username] = m.photo;
    }

    const posts = planetDocs.flatMap((md) =>
      (md.posts || []).map((post: any) => ({
        slug: post.slug,
        title: post.title,
        link: post.link,
        pubDate: post.pubDate,
        contentSnippet: post.contentSnippet,
        tags: (post.tags || []) as string[],
        maintainerName: md.maintainerName,
        maintainerUsername: md.maintainerUsername,
        maintainerPhoto: photoMap[md.maintainerUsername],
        feedUrl: md.feedUrl as string | undefined,
      })),
    );
    posts.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    const authorMap = new Map<string, { username: string; name: string; photo?: string }>();
    for (const post of posts) {
      if (!authorMap.has(post.maintainerUsername)) {
        authorMap.set(post.maintainerUsername, {
          username: post.maintainerUsername,
          name: post.maintainerName,
          photo: photoMap[post.maintainerUsername],
        });
      }
    }

    return { posts, authors: Array.from(authorMap.values()) };
  });
