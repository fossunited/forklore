# Forklore Architecture Brief

## Premise

Forklore is not just a directory. It is a browsable archive of maintainer stories, projects, posts, and small pieces of personality. The migration from Nuxt to Eleventy reduces dependency churn without flattening the experience into static HTML-only pages.

## Goals

- Keep authoring ergonomic for maintainers and contributors.
- Preserve interactive UI components for search, filtering, exploration, and story-led browsing.
- Move validation, normalization, and derived fields into one data pipeline.
- Keep generated routes static and GitHub Pages friendly.
- Reduce recurring maintenance from framework upgrades, generated feed commits, and schema drift.

## Architecture

The public site is a static Eleventy build with Markdown/frontmatter as the maintainer authoring format.

Rationale:

- Maintainers can be authored as readable Markdown instead of JSON.
- Structured fields stay in frontmatter for templates, validation, and automation.
- Long answers, notes, and profile content stay in Markdown where humans can edit them.
- One template can generate all maintainer detail pages.
- The landing page can still be interactive through small progressive-enhancement scripts.
- The dependency surface is much smaller than Nuxt plus Nuxt Content plus Nitro.

Forklore does not need an application framework to ship the baseline experience. Astro is strong when a site benefits from component islands, framework-specific components, or mixed rendering strategies, but those strengths also keep the project closer to the frontend-framework upgrade cycle this migration removes. Forklore's requirement is data-in, static-pages-out, with a small amount of plain JavaScript for search, filters, theme switching, and exploratory UI. Eleventy fits that shape with fewer moving pieces: no Vite app layer, no client framework, no hydration model, and a build pipeline that is easy to debug or replace.

Hugo is attractive for raw speed and a single-binary distribution story, but it would move the team into Go template conventions and make the current JavaScript normalization path less direct. Eleventy keeps those transforms in ordinary JavaScript while staying far lighter than the previous Nuxt stack. Zola has a similar single-binary advantage, but per-maintainer pages from structured content would still need extra generation or content-shaping work, which becomes another maintenance surface.

Eleventy is the smallest practical step for this repo: enough templating and data-pipeline flexibility to model Forklore correctly, without keeping a full application framework for a site that should be static by default.

## Content Model

Maintainer profiles should move from machine-first JSON to human-first Markdown/frontmatter:

```text
content/maintainers/<username>.md
```

Frontmatter owns structured fields:

- `username`
- `full_name`
- `photo`
- `designation`
- `socials`
- `projects`
- `created_on`

Markdown body owns long-form answers and story content.

GitHub issue automation can generate or update these files. The important shift is that humans reviewing a PR can read and edit the file without fighting JSON escaping.

## Maintainer Addition Automation

The target workflow should be hands-off after the initial migration without making the source format hostile to humans.

- Store maintainers as Markdown/frontmatter in `content/maintainers/<username>.md`.
- Keep a framework-independent validator for required fields, social links, project links, image paths, and RSS URLs.
- Use GitHub issue forms or a small contribution template to collect submissions.
- Let a GitHub Action convert approved issue/PR input into a maintainer Markdown file.
- Open or update a PR with the generated file, image checks, and validation results.

This keeps the public contribution flow approachable while avoiding a permanent "write JSON by hand" burden. The generated PR remains reviewable because the final artifact is one readable Markdown file per maintainer.

## Shared Data Layer

All prototype branches should consume the same generated data artifacts:

- `maintainers`: normalized profiles with canonical social labels.
- `projects`: flattened project index with maintainer references.
- `answers`: extracted form answers keyed by stable question IDs.
- `planet`: post metadata and optional full post content.
- `search`: lightweight precomputed search records.
- `stats`: counts and facets used by UI controls.

## Migration Constraints

- Preserve public routes for the maintainer site:
  - `/`
  - `/maintainers/:username`
- Preserve Planet routes in Eleventy:
  - `/planet`
  - `/planet/:username`
  - `/planet/:username/:slug`
  - `/planet/rss.xml`
- Keep the existing weekly Planet refresh model because this feature was already operating as recurring content.
- Keep images local, but add size validation and optimization checks.
- Treat the maintainer schema as a single source of truth and validate Markdown frontmatter against it.

## Planet Strategy

Planet remains part of the architecture and is rendered by Eleventy from committed feed snapshots.

- Maintainer RSS URLs live in maintainer frontmatter.
- Planet posts are machine-fetched content, not human-authored content.
- `.github/workflows/refresh-planet.yml` runs weekly and on demand.
- `yarn planet:refresh` updates `content/planet/*.json`.
- Eleventy renders `/planet`, author pages, post pages, and `/planet/rss.xml` from those snapshots.

Planet uses the same data-pipeline principle as maintainers: stable authored metadata, generated volatile content. Maintainers own their RSS/feed URL in frontmatter. The scheduled GitHub Action fetches those feeds, normalizes post metadata, and commits grouped updates to `content/planet` only when there are actual content changes. The `lastFetched` timestamp in each feed file is only updated when new or updated posts are found, which avoids noisy weekly bot commits when feeds have not changed.

Feed fetching, RSS generation, tag indexes, and search records are all generated ahead of time. The runtime page is static HTML with light client-side filtering. That keeps Planet functional without reintroducing the dependency and deployment complexity the migration removed.

## Dependency Burden Reduction

The previous maintenance pressure was mostly structural, not caused by individual packages. The Nuxt app brought a larger graph: Nuxt, Vue, Nitro, Nuxt Content, Vite-related packages, rendering adapters, and ~487 transitive packages that needed routine patching even when the product surface did not change.

The static architecture reduces that burden by:

- Moving the public site to pre-rendered HTML, CSS, and small plain JavaScript files.
- Removing the need for a runtime application framework for the baseline site.
- Keeping generated artifacts out of routine commits unless they are intentionally reviewed.
- Consolidating data normalization into a small build-time script instead of spreading it across framework conventions.
- Making future upgrades optional and deliberate instead of a regular stream of framework ecosystem bumps.

The goal is not zero dependencies. The goal is a dependency graph proportionate to the job: static pages from structured maintainer data, plus targeted progressive enhancement for search, filters, previews, theme mode, and future design experiments.

## Considerations

### Maintainer Files

- `content/maintainers/*.md` becomes the canonical authored source.
- Eleventy reads those files directly.
- Build output remains generated and uncommitted.
- The JSON-to-Markdown transition generator has been removed.
- `parse-maintainer.py` writes Markdown/frontmatter from saved issue forms.
- `.github/workflows/maintainer-from-issue.yml` can create a PR from an approved issue.

This avoids a duplicated source of truth while keeping maintainer submissions reviewable as one readable file per maintainer.

### Planet

`.github/workflows/refresh-planet.yml` runs weekly and on demand. It runs `yarn planet:refresh`, which fetches RSS feeds from maintainer frontmatter, and commits updated `content/planet/*.json` snapshots only when feed content has changed. The `lastFetched` field in each file is only updated when new or updated posts are found.

Eleventy renders `/planet/`, `/planet/:username/`, `/planet/:username/:slug/`, and `/planet/rss.xml` from those snapshots. Feed fetching is outside the Eleventy render path so normal builds remain deterministic.

### Validation

Validation is independent of the rendering framework. `scripts/validate-maintainers.mjs` checks required fields, duplicate usernames, route safety, image/logo paths, social links, project links, and RSS URLs. The build runs validation before Eleventy render.

This replaces the previous approach of `maintainer.schema.json`, pre-commit JSON schema checks, and Nuxt Content's zod schema in `content.config.ts`. Keeping validation close to the content model means future SSG changes do not require rewriting the rules.

### OG Image Preview

OpenGraph and Twitter meta tags are set in the Eleventy base layout. `scripts/generate-og-images.mjs` creates static SVG OG images during build. The fallback image is `/og/index.svg`; maintainer pages use `/og/maintainers/<username>.svg` with page-specific titles and descriptions.

This replaces the previous `nuxt-og-image` + Takumi renderer approach. If PNG previews become necessary for platform compatibility, add a build-time SVG-to-PNG renderer rather than a runtime framework dependency.

### Deployment

`.github/workflows/pages.yml` builds the Eleventy site on push to `develop` and publishes `_site` to GitHub Pages.

- Root `package.json` scripts (`build`, `dev`, `generate`) are thin wrappers around `yarn --cwd site` for developer ergonomics.
- Dependencies live exclusively in `site/package.json` and `site/yarn.lock`. The root has no `node_modules` or lockfile.
- Dependabot tracks `site/` only.
- The old Nuxt source exists only in git history for reference.

## Current Stack

The production path:

- `yarn build` (or `yarn generate`) delegates to `yarn --cwd site build`.
- Build runs maintainer validation, generates OG SVG images, then runs Eleventy.
- Eleventy reads maintainer Markdown directly from `content/maintainers` and planet snapshots from `content/planet`.
- GitHub Pages publishes `_site`.
- `_site/` is gitignored and only used as the deployment artifact.
- Fonts (Geist Mono, Inter) are self-hosted as woff2 files under `site/assets/fonts/`.
- Social link icons use inline SVG (Tabler Icons) via the `social-icon.njk` include.
- A custom 404 page is generated at `_site/404.html` for GitHub Pages.

The active dependency surface is three packages under `site/`: `@11ty/eleventy`, `js-yaml`, `rss-parser`.

## Visual Parity

The current site preserves the previous Nuxt site's look:

- Dark default palette with light mode toggle.
- Centered `max-width: 768px` shell with dashed 2px borders.
- Same header links (Get Featured, FOSS United Grants, Discussion Forum).
- Planet CTA in the homepage intro section, not the header.
- Maintainer cards with profile header and project grid.
- Maintainer detail pages with project column and story column.
- Search with keyboard shortcut, sort controls, Surprise Me and Commit to Emoji buttons.
- Scroll-to-top button.
- Social link icons matching the old Tabler Icon set.

Intentional redesign work belongs on `design/*` branches.

## Prototype Branches

The three design branches should branch from this migration base:

- `design/interactive-wall`
- `design/lore-map`
- `design/story-scroll`

Each branch should first define the design system, interaction model, and data requirements before implementation.
