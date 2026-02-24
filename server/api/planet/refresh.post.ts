import Parser from 'rss-parser';
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

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
  const parser = new Parser({
    timeout: 10000,
    headers: {
      'User-Agent': 'Forklore-Planet/1.0'
    }
  });

  try {
    // Setup directories
    const contentDir = path.resolve("content/maintainers");
    const planetDir = path.resolve("content/planet");
    await fs.mkdir(planetDir, { recursive: true });

    // Read maintainers
    const files = (await fs.readdir(contentDir)).filter((f) => f.endsWith(".json"));
    const maintainers = await Promise.all(
      files.map(async (file) => {
        const raw = await fs.readFile(path.join(contentDir, file), "utf-8");
        return JSON.parse(raw);
      })
    );

    const maintainersWithFeeds = maintainers.filter(m => m.rssfeed);

    let newPostsCount = 0;
    let updatedPostsCount = 0;
    const errors: string[] = [];

    // Fetch each maintainer's RSS feed
    for (const maintainer of maintainersWithFeeds) {
      try {
        console.log(`Fetching feed for ${maintainer.username}...`);
        const feed = await parser.parseURL(maintainer.rssfeed);
        
        // Load existing posts for this maintainer
        const maintainerFile = path.join(planetDir, `${maintainer.username}.json`);
        let existingData: MaintainerPosts = {
          maintainerName: maintainer.full_name,
          maintainerUsername: maintainer.username,
          maintainerPath: maintainer.path,
          feedUrl: maintainer.rssfeed,
          lastFetched: new Date().toISOString(),
          posts: [],
        };

        try {
          const existing = await fs.readFile(maintainerFile, 'utf-8');
          existingData = JSON.parse(existing);
          existingData.lastFetched = new Date().toISOString();
        } catch {
          // File doesn't exist yet
        }

        const existingGuids = new Set(existingData.posts.map(p => p.guid));
        
        // Process each post from the feed
        for (const item of feed.items) {
          const uniqueId = item.guid || item.link || item.title;
          const postId = crypto.createHash('md5').update(uniqueId).digest('hex');
          
          // Create slug from title
          const slug = (item.title || 'untitled')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 100);

          const postSlug = `${maintainer.username}-${postId.substring(0, 8)}-${slug}`;

          const storedPost: StoredPost = {
            id: postId,
            slug: postSlug,
            title: item.title || 'Untitled',
            link: item.link || '',
            pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
            author: item.creator || item.author || maintainer.full_name,
            content: item.content || item['content:encoded'] || item.summary || '',
            contentSnippet: item.contentSnippet || item.summary || '',
            tags: item.categories || [],
            guid: item.guid || item.link || '',
          };

          // Check if post already exists
          const existingPostIndex = existingData.posts.findIndex(p => p.guid === storedPost.guid);
          
          if (existingPostIndex === -1) {
            // New post
            existingData.posts.push(storedPost);
            newPostsCount++;
          } else {
            // Update existing post (in case content changed)
            existingData.posts[existingPostIndex] = storedPost;
            updatedPostsCount++;
          }
        }

        // Sort posts by date (newest first)
        existingData.posts.sort((a, b) => 
          new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
        );

        // Write maintainer's posts file
        await fs.writeFile(maintainerFile, JSON.stringify(existingData, null, 2), 'utf-8');

        console.log(`✓ Processed ${feed.items.length} posts from ${maintainer.username}`);
      } catch (error) {
        const errorMsg = `Error fetching feed for ${maintainer.username}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    return {
      success: true,
      newPosts: newPostsCount,
      updatedPosts: updatedPostsCount,
      totalFeeds: maintainersWithFeeds.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error('Error in planet refresh:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to refresh planet posts'
    });
  }
});
