// Emits /maintainers.json: a stable, cross-verifiable list of maintainers for
// downstream consumers (e.g. the fossunited profile badge) to curl, instead of
// scraping the GitHub contents API.
export default class {
  data() {
    return {
      permalink: "/maintainers.json",
      eleventyExcludeFromCollections: true,
    };
  }

  // "https://github.com/DalgoT4D/" -> "DalgoT4D"
  githubHandle(link) {
    return String(link || "")
      .replace(/[#?].*$/, "")
      .replace(/\/+$/, "")
      .split("/")
      .pop();
  }

  render({ collections }) {
    const maintainers = (collections.maintainers || []).map((item) => {
      const data = item.data;
      const github = (data.socials || []).find(
        (social) => String(social.label).toLowerCase() === "github",
      );
      return {
        username: data.username,
        github: github ? this.githubHandle(github.link) : null,
      };
    });
    return JSON.stringify(maintainers);
  }
}
