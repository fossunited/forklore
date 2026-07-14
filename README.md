<div align="center" markdown="1">
    <img src=".github/github_logo.png" />
    <h1>Forklore</h1>

**Website for Forklore, built with Eleventy**

</div>

## About Forklore

Forklore is a data-driven open-source website featuring stories from maintainers from all over India.

### Planet

Planet Forklore is restored at `/planet/` as statically generated pages from committed feed snapshots. A weekly workflow refreshes maintainer RSS feeds and commits updated `content/planet/*.json` data when posts change.

## Social Media Campaign

Everyone featured on Forklore was already or will be highlighted via the FOSS United social media handles.

Our primary place for showcasing and connecting maintainers is our Forum: [#MeetTheMaintainers](https://forum.fossunited.org/t/introducing-forklore-in/5836)

| [Mastodon](https://mas.to/@fossunited) | [Bluesky](https://bsky.app/profile/fossunited.mas.to.ap.brid.gy) | [LinkedIn](https://www.linkedin.com/company/fossunited/) | [Instagram](https://www.instagram.com/fossunited/) | [X/Twitter](https://x.com/fossunited) |
|:---------------------------------------|:-----------------------------------------------------------------|:---------------------------------------------------------|:---------------------------------------------------|:--------------------------------------|

## Contribute

See something you can fix or make better? In the true spirit of open source, we welcome all contributions from our community.

Looking to get featured? Refer to [this document](/GET_FEATURED.md).

### Prerequisites

```
- node 20+
- yarn 1.22.22+
```

### Local Setup

To get started with local development, follow these steps:

- Clone this repository
- Open this directory in a terminal, and run `yarn --cwd site install`
- Start the development server by running `yarn run dev`
- The website should start running at `http://localhost:3000`

### Maintainer Content

- Validate maintainer records with `yarn validate:maintainers`
- Convert a saved GitHub issue form with `yarn content:from-issue username.md`
- Generate social preview images with `yarn og`
