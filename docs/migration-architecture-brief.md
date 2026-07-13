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

Eleventy is preferred for the spike because Forklore does not need an application framework to ship the baseline experience. Astro is strong when a site benefits from component islands, framework-specific components, or mixed rendering strategies, but those strengths also keep the project closer to the frontend-framework upgrade cycle this migration is trying to reduce. Forklore's baseline requirement is data-in, static-pages-out, with a small amount of plain JavaScript for search, filters, theme switching, and exploratory UI. Eleventy fits that shape with fewer moving pieces: no Vite app layer, no client framework, no hydration model, and a build pipeline that is easy to debug or replace.

Hugo is attractive for raw speed and a single-binary distribution story, but it would move the team into Go template conventions and make the current JavaScript normalization path less direct. That tradeoff can be worth it for a mostly prose site, but Forklore still needs custom transforms for maintainers, projects, feeds, search records, and generated profile pages. Eleventy keeps those transforms in ordinary JavaScript while staying far lighter than the current Nuxt stack. Zola has a similar single-binary advantage, but per-maintainer pages from structured content would still need extra generation or content-shaping work, which becomes another maintenance surface.

The decision is not that Eleventy is universally better than Astro, Hugo, or Zola. It is the smallest practical step for this repo: enough templating and data-pipeline flexibility to model Forklore correctly, without keeping a full application framework for a site that should be static by default.

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

## Maintainer Addition Automation

The target workflow should be hands-off after the initial migration without making the source format hostile to humans.

Short term:

- Keep the existing JSON content as the source while the spike proves rendering parity.
- Generate Markdown/frontmatter into the static site from the current JSON records.
- Validate that generated maintainer pages and project lists match the current Nuxt output.

Migration target:

- Store maintainers as Markdown/frontmatter in `content/maintainers/<username>.md`.
- Keep a schema validator for required fields, social links, project links, image paths, and RSS URLs.
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
- Defer Planet routes until after the stack migration and redesign:
  - `/planet`
  - `/planet/:username`
  - `/planet/:username/:slug`
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

Going forward, Planet should use the same data-pipeline principle as maintainers: stable authored metadata, generated volatile content. Maintainers should own their RSS/feed URL in frontmatter. The build or a scheduled GitHub Action can fetch those feeds, normalize post metadata, and produce a temporary cache for pages such as `/planet`, `/planet/:username`, and `/planet/:username/:slug`. If the team wants feed snapshots committed for reliability, the action should open a grouped review PR instead of pushing frequent noisy commits directly to the main branch.

The Planet phase should avoid pulling the site back toward an app framework. Feed fetching, RSS generation, tag indexes, pagination, and search records can all be generated ahead of time. The runtime page can remain static HTML with light client-side filtering where needed. That keeps Planet functional without reintroducing the dependency and deployment complexity this migration removes.

## Dependency Burden Reduction

The current maintenance pressure is mostly structural, not caused by individual packages. A framework app brings a larger graph: Nuxt, Vue, Nitro, Nuxt Content, Vite-related packages, rendering adapters, and transitive dependencies that need routine patching even when the product surface does not change.

The static migration reduces that burden by:

- Moving the public site to pre-rendered HTML, CSS, and small plain JavaScript files.
- Removing the need for a runtime application framework for the baseline site.
- Keeping generated artifacts out of routine commits unless they are intentionally reviewed.
- Consolidating data normalization into a small build-time script instead of spreading it across framework conventions.
- Making future upgrades optional and deliberate instead of a regular stream of framework ecosystem bumps.

The goal is not zero dependencies. The goal is a dependency graph proportionate to the job: static pages from structured maintainer data, plus targeted progressive enhancement for search, filters, previews, theme mode, and future design experiments.

## Considerations

### Generated Maintainer Files

The spike currently generates Eleventy maintainer pages from the existing JSON records. That is useful for proving parity, but generated Markdown should not become the long-term source of truth if it duplicates the same content elsewhere.

Spike choice:

- Commit the generated `site/maintainers/*.md` files for the migration spike.
- Keep existing `content/maintainers/*.json` as the canonical source during the spike.
- Keep the generator script in the Eleventy build so committed Markdown remains reproducible from the current source data.
- Treat `site/maintainers/*.md` as transition artifacts, not the final authoring location.

Final state:

- `content/maintainers/*.md` becomes the canonical authored source.
- Eleventy reads those files directly.
- Build output remains generated and uncommitted.
- The JSON-to-`site/maintainers` generator is removed once the content move is complete.

This lets the current PR show the full generated Eleventy content in review without forcing the source-of-truth migration into the same step. Later, the source move can be a simple, deliberate commit: move generated Markdown into `content/maintainers`, update Eleventy input paths, remove duplicated JSON, and delete the transition generator.

### Planet Port

The current root site refreshes Planet through `.github/workflows/refresh-planet.yml`, runs `yarn planet:refresh`, and commits updated `content/planet/` JSON back to the repository. That works, but it creates recurring bot churn for data that is inherently generated.

Best migration choice:

- Do not block the stack replacement on Planet parity.
- Remove Planet buttons and links from the temporary main website.
- Preserve the route and data model plan now.
- Port Planet in a second phase using generated static pages.
- Prefer deploy-time or scheduled cache generation over direct weekly commits.
- If committed snapshots are required, use grouped review PRs instead of direct bot pushes.

### Validation

The root site currently validates maintainer JSON through `maintainer.schema.json`, pre-commit, and Nuxt Content's zod schema in `content.config.ts`.

Best migration choice:

- Keep validation independent of the rendering framework.
- Validate Markdown frontmatter with a small script in CI.
- Check required fields, duplicate usernames, route safety, image/logo paths, social links, project links, and RSS URLs.
- Keep validation close to the content model so future SSG changes do not require rewriting the rules.

This keeps the safety of the current schema flow without tying validation to Nuxt.

### OG Image Preview

The root Nuxt site currently uses `nuxt-og-image` with a Takumi renderer for dynamic maintainer social preview images. The global fallback image is `public/og_image_main.png`, while maintainer previews use `components/OgImage/Maintainer.takumi.vue` and `public/og_maintainer_bg.png`.

Migration status:

- Basic OpenGraph and Twitter meta tags are restored in the Eleventy base layout.
- `https://forklore.in/og_image_main.png` is used as the fallback image for all Eleventy pages.
- Maintainer pages use page-specific titles and descriptions.
- Defer dynamic per-maintainer OG image generation until after the static migration is stable.
- If dynamic images are still required, generate them at build time rather than adding a runtime framework dependency.

This restores social sharing previews without immediately reintroducing the Nuxt/Takumi OG-image dependency surface.

### Deployment Cutover

The root deployment previously ran `yarn generate` and published Nuxt's `dist` directory through GitHub Pages.

Current migration choice:

- Switch the Pages workflow to build the Eleventy site.
- Publish `site/_site` instead of `dist`.
- Keep root package scripts as wrappers around `site` commands for developer ergonomics.
- Move Dependabot tracking from `/` to `/site`.
- Remove root Nuxt dependencies from the active root package and lockfile.
- Keep old Nuxt source files temporarily only as reference until the replacement has settled.

This makes Eleventy the temporary production path while keeping the old Nuxt implementation available for quick visual reference during review.

## Spike Scope

The first implementation should prove:

- Markdown/frontmatter can represent current maintainer data.
- A landing page can list maintainers and projects.
- A detail page can render profile, image, socials, project buttons, and long-form body content.
- The GitHub Pages workflow can publish the Eleventy output directly.
- The active dependency surface is reduced to the Eleventy package under `site/`.

The temporary production path is:

- `yarn generate` delegates to `yarn --cwd site build`.
- GitHub Pages publishes `_site`.
- Eleventy generates maintainer markdown from the current JSON data before build.
- `_site/` remains ignored locally and is only used as the deployment artifact.

## Visual Parity Requirement

The migration baseline should look like the current Nuxt site before design exploration starts.

The Eleventy spike should preserve:

- Dark default palette.
- Centered `max-w-screen-md` style shell.
- Two-pixel dashed borders and dividers.
- Current header links.
- Current home intro copy, with Planet CTA removed for now.
- Maintainer cards with profile header and project sections.
- Maintainer detail pages with project column and maintainer/story column.

Intentional redesign work belongs on later `design/*` branches, not the migration branch.

## Prototype Branches

The three design branches should branch from this migration base:

- `design/interactive-wall`
- `design/lore-map`
- `design/story-scroll`

Each branch should first define the design system, interaction model, and data requirements before implementation.
