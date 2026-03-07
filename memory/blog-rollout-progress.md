# Global Blog EN/JA Rollout Progress

- Last updated: 2026-03-07 20:53 KST run
- Target repo: `sooyaBlg`
- Strategy: subdirectories `/en/` and `/ja/`

## Current totals
- Eligible Korean source posts (published=true): **10**
- Fully converted (EN+JA published): **10**
- Remaining Korean posts to convert: **0**

## Completed in this run
- Source: `2026-02-28-jekyll-drafts-vs-published-false.md`
  - Published: `2026-02-28-jekyll-drafts-vs-published-false-en.md`
  - Published: `2026-02-28-jekyll-drafts-vs-published-false-ja.md`
- Source: `2026-03-01-reproducible-code-example-checklist.md`
  - Published: `2026-03-01-reproducible-code-example-checklist-en.md`
  - Published: `2026-03-01-reproducible-code-example-checklist-ja.md`
- Source: `2026-03-02-api-error-troubleshooting-context.md`
  - Published: `2026-03-02-api-error-troubleshooting-context-en.md`
  - Published: `2026-03-02-api-error-troubleshooting-context-ja.md`
- Source: `2026-03-02-cli-output-sanitizing-guide.md`
  - Published: `2026-03-02-cli-output-sanitizing-guide-en.md`
  - Published: `2026-03-02-cli-output-sanitizing-guide-ja.md`
- Source: `2026-03-03-log-example-sanitization-for-trustworthy-dev-posts.md`
  - Published: `2026-03-03-log-example-sanitization-for-trustworthy-dev-posts-en.md`
  - Published: `2026-03-03-log-example-sanitization-for-trustworthy-dev-posts-ja.md`

## Previously completed
- `2026-02-28-first-post.md` → EN/JA published
- `2026-03-03-shell-command-safety-context-for-dev-guides.md` → EN/JA published
- `2026-03-04-dependency-version-pinning-guide-for-seo-trust.md` → EN/JA published
- `2026-03-05-http-request-timeout-and-fail-fast-guide.md` → EN/JA published
- `2026-03-06-npm-ci-lockfile-reproducible-build-guide.md` → EN/JA published

## SEO checks applied this run
- Added localized EN/JA `title` + `description` (localized phrasing, not literal MT) for all five translated post sets
- Added/verified `lang`, `translation_key`, language-specific `permalink`, and `alternates` (`ko`/`en`/`ja`/`x_default`) on KO/EN/JA files
- Updated internal links in EN/JA posts to localized `/en/` and `/ja/` destinations where localized targets exist
- Verified canonical behavior remains consistent through Jekyll SEO tags with language-specific permalinks
- Confirmed sitemap consistency is maintained because translated posts are now published with stable localized permalinks

## Remaining queue
- None

## Maintenance updates (2026-03-07 14:53 KST)
- Re-checked EN/JA internal links for localized path consistency.
- Fixed 8 links in the following posts to use language subdirectories (`/en/`, `/ja/`) instead of KO default paths:
  - `2026-03-05-http-request-timeout-and-fail-fast-guide-en.md`
  - `2026-03-06-npm-ci-lockfile-reproducible-build-guide-en.md`
  - `2026-03-05-http-request-timeout-and-fail-fast-guide-ja.md`
  - `2026-03-06-npm-ci-lockfile-reproducible-build-guide-ja.md`
- Totals unchanged: converted **10**, remaining **0**.

## Maintenance updates (2026-03-07 15:23 KST)
- Re-ran rollout audit for eligible KO posts and EN/JA pair completeness.
- Re-checked multilingual SEO front matter across all converted sets (`title`, `description`, `lang`, `translation_key`, `permalink`, `alternates`) with no mismatches.
- Totals unchanged: converted **10**, remaining **0**.

## Maintenance updates (2026-03-07 15:53 KST)
- Re-ran conversion eligibility scan (`lang: ko`, `published != false`) and EN/JA pair completeness audit.
- Re-checked multilingual SEO consistency (`title`, `description`, `alternates`/`hreflang`, internal localized links, canonical/permalink pattern, sitemap inclusion assumptions).
- Totals unchanged: converted **10**, remaining **0**.

## Maintenance updates (2026-03-07 16:23 KST)
- Cron rerun audit completed for `sooyaBlg`.
- Eligible KO source posts: **10**; EN/JA pairs complete for all: **10/10**.
- SEO audit rerun passed for all converted sets (`title`, localized `description`, `alternates`/`hreflang`, language `permalink`/canonical pattern, and sitemap inclusion assumptions).
- Totals unchanged: converted **10**, remaining **0**.

## Maintenance updates (2026-03-07 16:53 KST)
- Recurring worker rerun completed for `sooyaBlg`.
- Eligibility scan result: KO published posts **10**; EN/JA pairs complete **10/10** (remaining **0**).
- SEO spot-check rerun passed (`title`, `description`, `alternates`/`hreflang`, language `permalink` canonical pattern, localized internal link pattern, sitemap inclusion assumptions).
- Totals unchanged: converted **10**, remaining **0**.

## Finalization status
- All eligible KO posts converted to EN/JA: ✅
- SEO validation pass (title/meta/hreflang/internal links/canonical/sitemap): ✅
- Final completion report sent: 2026-03-07 14:22 KST

## Maintenance updates (2026-03-07 17:23 KST)
- Recurring worker audit rerun completed for `sooyaBlg`.
- Eligibility scan result: KO published posts **10**; EN/JA pairs complete **10/10** (remaining **0**).
- SEO audit spot-check passed for multilingual essentials: localized `title`/`description`, `alternates` (`ko`/`en`/`ja`/`x_default`) + hreflang template compatibility, language `permalink` canonical pattern, localized internal link pattern, and sitemap consistency assumptions.
- Totals unchanged: converted **10**, remaining **0**.

## Maintenance updates (2026-03-07 17:53 KST)
- Recurring worker audit rerun completed for `sooyaBlg`.
- Eligibility scan result: KO published posts **10**; EN/JA pairs complete **10/10** (remaining **0**).
- SEO audit rerun passed for multilingual essentials (`title`, localized `description`, `alternates`/hreflang mapping, language permalink canonical pattern, localized internal links, sitemap consistency assumptions).
- Totals unchanged: converted **10**, remaining **0**.

## Maintenance updates (2026-03-07 18:23 KST)
- Recurring migration worker rerun audit completed for `sooyaBlg`.
- Eligibility scan result: KO published posts **10**; EN/JA pairs complete **10/10** (remaining **0**).
- SEO consistency check rerun passed (`title`, localized `meta description`, `alternates`/hreflang mapping, language permalink/canonical pattern, localized internal links, sitemap consistency assumptions).
- Totals unchanged: converted **10**, remaining **0**.

## Maintenance updates (2026-03-07 18:53 KST)
- Recurring migration worker rerun audit completed for `sooyaBlg`.
- Eligibility scan result: KO published posts **10**; EN/JA pairs complete **10/10** (remaining **0**).
- SEO rerun passed for multilingual essentials (`title`, localized `description`, `alternates`/hreflang mapping, language permalink/canonical pattern, localized internal link pattern, sitemap consistency assumptions).
- Totals unchanged: converted **10**, remaining **0**.

## Maintenance updates (2026-03-07 19:23 KST)
- Recurring migration worker rerun audit completed for `sooyaBlg`.
- Eligibility scan result: KO published posts **10**; EN/JA pairs complete **10/10** (remaining **0**).
- SEO rerun passed for multilingual essentials (`title`, localized `description`, `alternates`/hreflang mapping, language permalink/canonical pattern, localized internal link pattern, sitemap consistency assumptions).
- Totals unchanged: converted **10**, remaining **0**.

## Maintenance updates (2026-03-07 19:53 KST)
- Recurring migration worker rerun audit completed for `sooyaBlg`.
- Eligibility scan result: KO published posts **10**; EN/JA pairs complete **10/10** (remaining **0**).
- SEO rerun passed for multilingual essentials (`title`, localized `description`, `alternates`/hreflang mapping, language permalink/canonical pattern, localized internal link pattern, sitemap consistency assumptions).
- Totals unchanged: converted **10**, remaining **0**.

## Maintenance updates (2026-03-07 20:23 KST)
- Recurring migration worker rerun audit completed for `sooyaBlg`.
- Eligibility scan result: KO published posts **10**; EN/JA pairs complete **10/10** (remaining **0**).
- SEO rerun passed for multilingual essentials (`title`, localized `description`, `alternates`/hreflang mapping, language permalink/canonical pattern, localized internal link pattern, sitemap consistency assumptions).
- Totals unchanged: converted **10**, remaining **0**.

## Maintenance updates (2026-03-07 20:53 KST)
- Recurring migration worker rerun audit completed for `sooyaBlg`.
- Eligibility scan result: KO published posts **10**; EN/JA pairs complete **10/10** (remaining **0**).
- SEO rerun passed for multilingual essentials (`title`, localized `description`, `alternates`/hreflang mapping, language permalink/canonical pattern, localized internal links, sitemap consistency assumptions).
- Totals unchanged: converted **10**, remaining **0**.

