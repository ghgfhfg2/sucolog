# Global Blog EN/JA Rollout Progress

- Last updated: 2026-03-07 12:52 KST run
- Target repo: `sooyaBlg`
- Strategy: subdirectories `/en/` and `/ja/`

## Current totals
- Eligible Korean source posts: **11**
- Fully converted (EN+JA both published): **3**
- Remaining Korean posts to convert: **8**

## Completed in this run
- Source: `2026-02-28-first-post.md`
- Published:
  - `2026-02-28-first-post-en.md` (`/en/start/2026/02/28/first-post.html`)
  - `2026-02-28-first-post-ja.md` (`/ja/start/2026/02/28/first-post.html`)

## Previously completed
- `2026-03-06-npm-ci-lockfile-reproducible-build-guide.md` → EN/JA published
- `2026-03-05-http-request-timeout-and-fail-fast-guide.md` → EN/JA published

## SEO checks applied
- Added per-language localized `title` + `description` in front matter
- Added stable `permalink` for KO/EN/JA variants under `/`, `/en/`, `/ja/`
- Added `alternates` mapping and `x_default`
- Added `sooyaBlg/_includes/head-custom.html` for `hreflang` link output (`ko`, `en`, `ja`, `x-default`)
- Internal links reviewed; related links kept consistent (KO canonical targets used where localized targets are not yet available)
- Canonical/sitemap consistency: kept Jekyll SEO + sitemap plugin defaults, now with language-specific permalinks
- This run validation: KO/EN/JA front matter all include `lang`, localized metadata (`title`/`description`), matching alternates, and stable per-language permalinks for the `first-post-blog-setup` set

## Remaining queue
- 2026-02-28-jekyll-drafts-vs-published-false.md
- 2026-02-28-private-test-post.md
- 2026-03-01-reproducible-code-example-checklist.md
- 2026-03-02-api-error-troubleshooting-context.md
- 2026-03-02-cli-output-sanitizing-guide.md
- 2026-03-03-log-example-sanitization-for-trustworthy-dev-posts.md
- 2026-03-03-shell-command-safety-context-for-dev-guides.md
- 2026-03-04-dependency-version-pinning-guide-for-seo-trust.md
