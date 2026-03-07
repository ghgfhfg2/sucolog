# Global Blog EN/JA Rollout Progress

- Last updated: 2026-03-07 13:22 KST run
- Target repo: `sooyaBlg`
- Strategy: subdirectories `/en/` and `/ja/`

## Current totals
- Eligible Korean source posts (published=true): **10**
- Fully converted (EN+JA published): **5**
- Remaining Korean posts to convert: **5**

## Completed in this run
- Source: `2026-03-03-shell-command-safety-context-for-dev-guides.md`
  - Published: `2026-03-03-shell-command-safety-context-for-dev-guides-en.md`
  - Published: `2026-03-03-shell-command-safety-context-for-dev-guides-ja.md`
- Source: `2026-03-04-dependency-version-pinning-guide-for-seo-trust.md`
  - Published: `2026-03-04-dependency-version-pinning-guide-for-seo-trust-en.md`
  - Published: `2026-03-04-dependency-version-pinning-guide-for-seo-trust-ja.md`

## Previously completed
- `2026-02-28-first-post.md` → EN/JA published
- `2026-03-05-http-request-timeout-and-fail-fast-guide.md` → EN/JA published
- `2026-03-06-npm-ci-lockfile-reproducible-build-guide.md` → EN/JA published

## SEO checks applied this run
- Added localized `title` and `description` metadata for EN/JA posts
- Added/verified `lang`, `translation_key`, language-specific `permalink`, and `alternates` (`ko`/`en`/`ja`/`x_default`) across KO/EN/JA sets
- Verified internal links in EN/JA point to localized `/en/` and `/ja/` paths where targets exist
- Confirmed hreflang output compatibility with `_includes/head-custom.html`
- Canonical/sitemap consistency kept via Jekyll SEO + sitemap defaults with per-language permalinks

## Remaining queue
- 2026-02-28-jekyll-drafts-vs-published-false.md
- 2026-03-01-reproducible-code-example-checklist.md
- 2026-03-02-api-error-troubleshooting-context.md
- 2026-03-02-cli-output-sanitizing-guide.md
- 2026-03-03-log-example-sanitization-for-trustworthy-dev-posts.md
