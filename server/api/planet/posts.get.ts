import { promises as fs } from "fs";
import path from "path";

interface StoredPost {
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
}

interface MaintainerPosts {
  maintainerName: string;
  maintainerUsername: string;
  maintainerPath: string;
  feedUrl: string;
  lastFetched: string;
  posts: StoredPost[];
}

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const perPage = parseInt(query.perPage as string) || 20;
    const author = query.author as string | undefined;
    const tag = query.tag as string | undefined;
    const search = query.search as string | undefined;

    // Read all maintainer post files
    const planetDir = path.resolve("content/planet");
    
    let maintainerFiles: string[] = [];
    try {
      maintainerFiles = (await fs.readdir(planetDir)).filter(f => f.endsWith(".json"));
    } catch (error) {
      // Planet directory doesn't exist yet
      return {
        posts: [],
        totalPosts: 0,
        totalPages: 0,
        currentPage: page,
        perPage: perPage,
        authors: [],
        tags: [],
      };
    }

    // Load all posts from all maintainers
    const allMaintainerData: MaintainerPosts[] = await Promise.all(
      maintainerFiles.map(async (file) => {
        const raw = await fs.readFile(path.join(planetDir, file), "utf-8");
        return JSON.parse(raw);
      })
    );

    // Flatten all posts and add maintainer info
    const allPosts = allMaintainerData.flatMap(maintainerData =>
      (maintainerData.posts || []).map(post => ({
        ...post,
        maintainerName: maintainerData.maintainerName,
        maintainerUsername: maintainerData.maintainerUsername,
        maintainerPath: maintainerData.maintainerPath,
        feedUrl: maintainerData.feedUrl,
      }))
    );

    // Sort by date (newest first)
    allPosts.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    // Filter posts
    let filteredPosts = allPosts;

    if (author) {
      filteredPosts = filteredPosts.filter(
        p => p.maintainerUsername.toLowerCase() === author.toLowerCase()
      );
    }

    if (tag) {
      filteredPosts = filteredPosts.filter(
        p => p.tags.some(t => t.toLowerCase() === tag.toLowerCase())
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredPosts = filteredPosts.filter(
        p => p.title.toLowerCase().includes(searchLower) ||
             p.contentSnippet.toLowerCase().includes(searchLower) ||
             p.author.toLowerCase().includes(searchLower)
      );
    }

    // Get unique authors and tags for filters
    const authors = [...new Set(allPosts.map(p => ({
      username: p.maintainerUsername,
      name: p.maintainerName,
      path: p.maintainerPath,
    })))];

    const allTags = allPosts.flatMap(p => p.tags);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const tags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Paginate
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
    console.error('Error in planet posts API:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch planet posts'
    });
  }
});
