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

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "public/images": "images" });
  eleventyConfig.addPassthroughCopy({ "public/logo": "logo" });
  eleventyConfig.addPassthroughCopy({ "public/favicon.svg": "favicon.svg" });
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

  return {
    dir: {
      input: "site",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
