import { promises as fs } from "fs";
import path from "path";

interface MaintainerPosts {
  maintainerName: string;
  maintainerUsername: string;
  maintainerPath: string;
  feedUrl: string;
  lastFetched: string;
  posts: Array<{
    id: string;
    slug: string;
    title: string;
    link: string;
    pubDate: string;
    author: string;
    content: string;
    contentSnippet: string;
    tags: string[];
    guid: string;
  }>;
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: "Slug is required",
    });
  }

  try {
    const planetDir = path.resolve("content/planet");

    // Extract username from slug (format: username-hash-title)
    const username = slug.split("-")[0];
    const maintainerFile = path.join(planetDir, `${username}.json`);
    const raw = await fs.readFile(maintainerFile, "utf-8");

    const maintainerData: MaintainerPosts = JSON.parse(raw);

    // Find the post by slug
    const post = maintainerData.posts.find((p) => p.slug === slug);

    if (!post) {
      throw createError({
        statusCode: 404,
        message: "Post not found",
      });
    }

    // Return post with maintainer info
    return {
      ...post,
      maintainerName: maintainerData.maintainerName,
      maintainerUsername: maintainerData.maintainerUsername,
      maintainerPath: maintainerData.maintainerPath,
      feedUrl: maintainerData.feedUrl,
    };
  } catch (error) {
    console.error("Error in post API:", error);
    if (error.statusCode === 404) {
      throw error;
    }
    throw createError({
      statusCode: 404,
      message: `Post not found: ${error.message}`,
    });
  }
});
