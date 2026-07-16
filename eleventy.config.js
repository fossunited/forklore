const SOCIAL_LABELS = {
  github: "GitHub",
  gitlab: "GitLab",
  codeberg: "Codeberg",
  bitbucket: "BitBucket",
  linkedin: "LinkedIn",
  x: "X",
  "x/twitter": "X",
  twitter: "X",
  mastodon: "Mastodon",
  bluesky: "Bluesky",
  blog: "Web",
  web: "Web",
  website: "Web",
  rss: "RSS",
  medium: "Medium",
  substack: "Substack",
  reddit: "Reddit",
  youtube: "Youtube",
};

function markdownInline(value) {
  return String(value || "")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      '<a href="$2">$1</a>',
    )
    .replace(
      /(?<!="|'>)(https?:\/\/[^\s<)]+)/g,
      '<a href="$1">$1</a>',
    )
    .replace(/<br\s*\/?>/gi, "<br>");
}

export default function (eleventyConfig) {
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("CHANGELOG.md");
  eleventyConfig.ignores.add("GET_FEATURED.md");
  eleventyConfig.ignores.add("docs/**");
  eleventyConfig.ignores.add("site/assets/**");
  eleventyConfig.ignores.add("site/_includes/**");
  eleventyConfig.ignores.add("site/_data/**");
  eleventyConfig.ignores.add("node_modules/**");
  eleventyConfig.ignores.add("site/node_modules/**");

  eleventyConfig.addPassthroughCopy({ "public/images": "images" });
  eleventyConfig.addPassthroughCopy({ "public/logo": "logo" });
  eleventyConfig.addPassthroughCopy({ "public/favicon.svg": "favicon.svg" });
  eleventyConfig.addPassthroughCopy({ "public/og": "og" });
  eleventyConfig.addPassthroughCopy({ "public/og_image_main.png": "og_image_main.png" });
  eleventyConfig.addPassthroughCopy({ "public/og_maintainer_bg.png": "og_maintainer_bg.png" });
  eleventyConfig.addPassthroughCopy({
    "public/maintainer_photo_light.svg": "maintainer_photo_light.svg",
  });
  eleventyConfig.addPassthroughCopy({
    "public/maintainer_photo_dark.svg": "maintainer_photo_dark.svg",
  });
  eleventyConfig.addPassthroughCopy({ "site/assets": "assets" });

  eleventyConfig.addCollection("maintainers", (collectionApi) =>
    collectionApi
      .getFilteredByTag("maintainer")
      .sort(
        (a, b) =>
          new Date(b.data.created_on).getTime() -
          new Date(a.data.created_on).getTime(),
      ),
  );

  eleventyConfig.addFilter("socialLabel", (label) => {
    if (!label) return "Web";
    return SOCIAL_LABELS[String(label).trim().toLowerCase()] || label;
  });

  eleventyConfig.addFilter("dateISO", (date) => {
    const value = new Date(date);
    return Number.isNaN(value.getTime()) ? "" : value.toISOString();
  });

  eleventyConfig.addFilter("formatDate", (date) => {
    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return "";
    return value.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  });

  eleventyConfig.addFilter("truncate", (value, length = 240) => {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    return text.length > length ? `${text.slice(0, length - 1)}…` : text;
  });

  eleventyConfig.addFilter("take", (items, length = 10) =>
    Array.isArray(items) ? items.slice(0, length) : [],
  );

  eleventyConfig.addFilter("whereUsername", (posts, username) =>
    Array.isArray(posts)
      ? posts.filter((post) => String(post.maintainerUsername).toLowerCase() === String(username).toLowerCase())
      : [],
  );

  eleventyConfig.addFilter("tagsForPosts", (posts) => {
    const counts = new Map();
    for (const post of Array.isArray(posts) ? posts : []) {
      for (const tag of post.tags || []) counts.set(tag, (counts.get(tag) || 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  });

  eleventyConfig.addFilter("xmlEscape", (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;"),
  );

  eleventyConfig.addFilter("markdownInline", markdownInline);

  eleventyConfig.amendLibrary("md", (md) => {
    md.set({ linkify: true });
  });

  eleventyConfig.addFilter("year", (date) => {
    const value = new Date(date);
    return Number.isNaN(value.getTime()) ? "" : value.getFullYear();
  });

  eleventyConfig.addFilter("firstEmoji", (content) => {
    const match = String(content || "").match(
      /convey what it is like to be a FOSS maintainer[\s\S]*?<p>(.*?)<\/p>/i,
    );
    if (!match) return "";
    const text = match[1].replace(/<[^>]*>/g, "").trim();
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    for (const item of segmenter.segment(text)) {
      if (/\p{Extended_Pictographic}/u.test(item.segment)) return item.segment;
    }
    return "";
  });

  eleventyConfig.addFilter("rssSocials", (socials) =>
    Array.isArray(socials)
      ? socials.filter((social) => String(social.label || "").trim().toLowerCase() === "rss")
      : [],
  );

  return {
    dir: {
      input: ".",
      includes: "site/_includes",
      data: "site/_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
