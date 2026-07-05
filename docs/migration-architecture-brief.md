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

Use a static-first component framework rather than a full Nuxt application.

Preferred candidate: Astro.

Rationale:

- Component ergonomics stay strong for design prototypes.
- Static output remains the default.
- Interactive islands can be added only where needed.
- Existing Vue components can be ported incrementally or wrapped during migration.
- The dependency surface is smaller than Nuxt plus Nuxt Content plus Nitro.

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
- Treat JSON Schema as the source of truth or generate it from the TypeScript schema.

## Prototype Branches

The three design branches should branch from this migration base:

- `design/interactive-wall`
- `design/lore-map`
- `design/story-scroll`

Each branch should first define the design system, interaction model, and data requirements before implementation.
