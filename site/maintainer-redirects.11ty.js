// Short-link helper: /<username>/ -> /maintainers/<username>/ for every known
// maintainer, so a bare handle resolves to the profile. Static meta-refresh
// stubs (same approach as maintainers.njk), one per maintainer in the
// collection, so the target always exists. Usernames that would shadow a real
// top-level route are skipped rather than break the build.
const RESERVED = new Set([
  "planet",
  "maintainers",
  "page",
  "commit-emoji",
  "assets",
  "images",
  "logo",
  "og",
  "rss",
  "favicon",
  "apple-touch-icon",
  "404",
]);

export default class {
  data() {
    return {
      pagination: {
        data: "collections.maintainers",
        size: 1,
        alias: "maintainer",
        addAllPagesToCollections: false,
      },
      eleventyExcludeFromCollections: true,
      permalink: (data) => {
        const username = data.maintainer?.data?.username;
        if (!username || RESERVED.has(String(username).toLowerCase())) return false;
        return `/${username}/index.html`;
      },
    };
  }

  render({ maintainer }) {
    const username = maintainer.data.username;
    const name = maintainer.data.full_name || username;
    const target = `/maintainers/${username}/`;
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <script>location.replace(${JSON.stringify(target)})</script>
    <meta http-equiv="refresh" content="0; url=${target}">
    <link rel="canonical" href="${target}">
    <meta name="robots" content="noindex">
    <meta name="color-scheme" content="dark light">
    <style>:root{background:#18222a}@media(prefers-color-scheme:light){:root{background:#fafafa}}</style>
    <title>Redirecting&hellip;</title>
  </head>
  <body>
    <p><a href="${target}">Redirecting to ${name}&hellip;</a></p>
  </body>
</html>`;
  }
}
