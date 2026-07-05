# Forklore Migration Architecture Brief

## Premise

Forklore is not just a directory. It is a browsable archive of maintainer stories, projects, posts, and small pieces of personality. The migration should reduce dependency churn without flattening the experience into static HTML-only pages.

## Goals

- Keep authoring ergonomic for maintainers and contributors.
- Preserve interactive UI components for search, filtering, exploration, and story-led browsing.
- Move validation, normalization, and derived fields into one data pipeline.
- Keep generated routes static and GitHub Pages friendly.
- Reduce recurring maintenance from framework upgrades, generated feed commits, and schema drift.

## Recommended Direction

Use a dead-simple static site generator for the public site, with Markdown/frontmatter as the maintainer authoring format.

Current spike candidate: Eleventy.

Rationale:

- Maintainers can be authored as readable Markdown instead of JSON.
- Structured fields stay in frontmatter for templates, validation, and automation.
- Long answers, notes, and profile content stay in Markdown where humans can edit them.
- One template can generate all maintainer detail pages.
- The landing page can still be interactive through small progressive-enhancement scripts.
- The dependency surface is much smaller than Nuxt plus Nuxt Content plus Nitro.

Astro remains the fallback if the Eleventy spike proves too limiting for component ergonomics. Zola is less attractive for this repo because per-maintainer pages from structured content require an extra generation layer, which becomes another thing to maintain.

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

GitHub issue automation can still generate or update these files later. The important shift is that humans reviewing a PR can read and edit the file without fighting JSON escaping.

## Shared Data Layer

All prototype branches should consume the same generated data artifacts:

- `maintainers`: normalized profiles with canonical social labels.
- `projects`: flattened project index with maintainer references.
- `answers`: extracted form answers keyed by stable question IDs.
- `planet`: post metadata and optional full post content.
- `search`: lightweight precomputed search records.
- `stats`: counts and facets used by UI controls.

## Migration Constraints

- Preserve public routes where possible:
  - `/`
  - `/maintainers/:username`
  - `/planet`
  - `/planet/:username`
  - `/planet/:username/:slug`
  - `/rss.xml`
  - `/planet/rss.xml`
- Do not commit recurring Planet refresh output unless explicitly curated.
- Keep images local, but add size validation and optimization checks.
- Treat the maintainer schema as a single source of truth and validate Markdown frontmatter against it.

## Planet Strategy

Planet remains part of the architecture, but it should not block the maintainer-page migration.

- Maintainer RSS URLs live in maintainer frontmatter.
- Planet posts are machine-fetched content, not human-authored content.
- A later phase should fetch feeds during deploy or through a scheduled action.
- Generated Planet cache should either be deploy-only or committed through explicit review PRs, not recurring unreviewed churn.
- Existing Planet routes should be preserved when the Planet phase starts.

## Spike Scope

The first implementation spike should prove:

- Markdown/frontmatter can represent current maintainer data.
- A landing page can list maintainers and projects.
- A detail page can render profile, image, socials, project buttons, and long-form body content.
- The current Nuxt app can remain in place while the static spike is evaluated.

The spike must not change the production deployment path. Until the migration is explicitly accepted:

- `yarn generate` continues to run the Nuxt site.
- GitHub Pages continues to publish `dist` from Nuxt.
- Eleventy is isolated under `site/` and is not installed by the root deployment workflow.
- Eleventy is only invoked from the spike package with `cd site && yarn build` or `cd site && yarn serve`.
- `_site/` remains ignored and is not a deployment artifact.

## Visual Parity Requirement

The migration baseline should look like the current Nuxt site before design exploration starts.

The Eleventy spike should preserve:

- Dark default palette.
- Centered `max-w-screen-md` style shell.
- Two-pixel dashed borders and dividers.
- Current header links.
- Current home intro copy and Planet CTA.
- Maintainer cards with profile header and project sections.
- Maintainer detail pages with project column and maintainer/story column.

Intentional redesign work belongs on later `design/*` branches, not the migration branch.

## Prototype Branches

The three design branches should branch from this migration base:

- `design/interactive-wall`
- `design/lore-map`
- `design/story-scroll`

Each branch should first define the design system, interaction model, and data requirements before implementation.
