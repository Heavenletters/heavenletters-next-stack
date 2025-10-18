# URL and Permalink Specification

Version 1.0 (2025-09-29). This document codifies canonical URL rules for Heavenletters migration. It preserves existing Drupal 5 aliases as canonical permalinks for English and all translations, removes the need for publish_number in URLs, and defines extraction, storage, validation, and deployment behaviors.

## Goals

- Preserve existing public URLs to avoid SEO loss and broken links.
- Use the Drupal `url_alias` table as the single source of truth for canonical paths.
- Support multilingual content by preserving each translation’s own alias.
- Make routing implementation simple and deterministic for Orchestrator and coding agents.

## Canonical Source of Truth

- The Drupal 5 `url_alias` table holds the public-facing aliases.
  - Typical schema (Drupal 5):
    - `pid` int primary key
    - `src` varchar (internal path, e.g., `node/1234`)
    - `dst` varchar (public alias, e.g., `wholeness-on-behalf-of-the-universe.html`)
    - `language` varchar(12) default '' (may be empty; language mapping also available via `localizernode`)
- We consider `dst` the canonical permalink path to be preserved verbatim, including `.html`.

Examples:
- English HL: `dst = wholeness-on-behalf-of-the-universe.html`
- Italian HL: `dst = integrita-per-conto-dell-universo.html`

Note: Legacy site places aliases at the root, with no locale prefix segment. We will preserve this pattern.

## Canonical URL Policy

- Canonical path = exact `dst` from `url_alias`, preserved byte-for-byte (subject to UTF-8 validation).
- Extension: `.html` preserved where present (expected for HLs).
- No publish_number is added to the path. The URL does not include numeric ID or suffix.
- One canonical permalink per node (nid). Each translation node has its own permalink (its own `dst`).
- No locale path prefix is introduced. Translated pages remain at root-level aliases, as in legacy.
- Hostname strategy:
  - Paths remain identical across environments. Any domain or subdomain strategy (present or future) does not alter the path segment.
  - If a future subdomain-per-locale approach is adopted, path stability is preserved; only host varies.

## Extraction Procedure

For each Heavenletter node (English and translations):

1) Identify node:
- Base English nodes: `node.type = 'heavenletters'`
- Translations: Link via `localizernode` (nid, tnid, language)

2) Resolve alias row(s):
- Primary lookup: `SELECT dst FROM url_alias WHERE src IN ('node/{nid}', 'node/{nid}/view') ORDER BY preference_rule LIMIT 1`
- If multiple rows exist:
  - Prefer entries with `.html` suffix.
  - Prefer the alias without trailing slash.
  - If tie remains, choose the lexicographically smallest `dst` (deterministic).
- Optional: If `language` column is present, prefer rows whose `language` equals the node’s language; otherwise accept rows with empty language.

3) Validate alias:
- Must be non-empty, UTF-8 valid, and not start with a slash.
- Must not collide with another node’s alias (see “Collision Handling”).
- Must resolve to an `.html` file-like alias for HLs.

4) Persist to Keystone (see “Keystone Storage”).

5) Record extraction logs:
- Log alias chosen, any alternatives skipped, and any anomalies for QA review.

SQL references:
- Example forward lookup by internal path: `SELECT dst FROM url_alias WHERE src = 'node/1234'`
- Example reverse lookup (rarely needed): `SELECT src FROM url_alias WHERE dst = 'wholeness-on-behalf-of-the-universe.html'`

## Collision Handling

- Collisions are unexpected because legacy publishes unique aliases. If a duplicate `dst` maps to multiple nids:
  - Choose the alias that matches current production content (deterministic rule: the row whose `src` equals the nid intended for the English canonical; translations should have their own localized alias).
  - All other colliding rows are flagged as errors; do not synthesize new canonical paths at this stage.
  - Report a detailed conflict list for manual resolution; only after explicit approval create redirects if absolutely necessary.

## Keystone Storage

Add fields to the `ks_heavenletter` list:

- `nid: Int` Drupal node id (immutable reference)
- `tnid: Int` Translation group id (for linkage)
- `locale: String` ISO code for language (mapped from Drupal’s language)
- `title: String`
- `body: Text/MDX`
- `permalink: String` UNIQUE
  - The canonical path to be served (e.g., `wholeness-on-behalf-of-the-universe.html`)
  - No leading slash. Always `.html` if legacy alias has it.
- Optional:
  - `publish_number: Int` retained as metadata only (not used in URL)
  - `created_at`, `published_on`, `written_on`
  - `tags: Json`, `embeddings: Json` (post-MVP prep)

GraphQL expectations:
- Query by `permalink` and `locale` for disambiguation if ever needed; `permalink` alone should be unique globally.

## Frontend Routing (Astro)

- Route strategy: generate static pages using `permalink` values directly as output paths.
  - Build step enumerates all `permalink` strings and writes files accordingly at the root, e.g., `/wholeness-on-behalf-of-the-universe.html`
- Component rendering:
  - Pull content via Keystone GraphQL by `permalink`.
- No `/[locale]/` prefix is introduced in paths.
- If host-based i18n is adopted later, the same paths are served under locale-specific hosts without changing the path segment.

## Redirects and Canonicalization

- Because we preserve the exact legacy aliases, no path-to-path redirects are required for HL pages.
- Recommended:
  - Enforce `.html` form as canonical if alternative variants exist (e.g., trailing slash). Use a lightweight redirect rule at CDN/proxy.
  - Normalize to lowercase if and only if all legacy aliases are lowercase; otherwise do not force-case.
  - Remove any duplicate alias entries at the web tier (globalredirect-like behavior), but only when they do not contradict preserved aliases.

Domain changes:
- If the production hostname changes:
  - Configure a domain-level 301 from the legacy domain to the new domain, preserving path.
  - No path rewriting needed if aliases are identical.

## Sitemap and SEO

- Generate sitemaps from `permalink` values for each locale.
- Ensure `<link rel="canonical">` in HTML points to the preserved path on the primary host.
- Retain legacy RSS behavior; RSS item links use preserved `permalink`.

## Validation and QA

Automated checks after sync:
- Count consistency: total HLs and per-locale counts match Drupal.
- Alias existence: each HL must have a non-empty alias in Keystone.
- Uniqueness: `permalink` must be unique across all HLs.
- UTF-8: No invalid bytes in alias or title.
- 200 check: Newly served pages by `permalink` return 200 in staging.
- Random sampling: for each locale and across eras, verify:
  - Body, title, alias, and language are correct.
  - HTML entity normalization and encoding are correct.
  - No accidental publish_number in URL.

Conflicts and anomalies:
- Produce a report of:
  - Missing alias rows for any nid.
  - Multiple alias rows per nid (tie-break applied).
  - Duplicate alias across distinct nids (requires manual resolution).
- Do not auto-alter canonical paths without explicit approval.

## Edge Cases

- Aliases without `.html`: Preserve as-is if historically used (rare). Flag for review.
- Percent-encoded characters: Preserve exact bytes; do not “prettify” or re-encode.
- Non-Latin scripts: Preserve exact `dst`. Ensure web server and CDN handle UTF-8 in paths correctly.
- Leading/trailing whitespace: Trim stored values; do not alter canonical bytes beyond trimming.
- Uppercase letters: Preserve case exactly as in `dst` unless policy confirms a uniform lowercase legacy.

## Operations and Safety

- Export `url_alias` and `localizernode` to a staging dataset for repeatable sync tests.
- All extraction is read-only against legacy tables.
- Before any public deployment:
  - Backups complete and verified.
  - Alias collision report reviewed and signed off.
  - Random sample set validated across locales.

## Implementation Notes

Backend sync (Keystone/Prisma):
- SQL to map alias:
  - Preferred: `SELECT dst FROM url_alias WHERE src = CONCAT('node/', :nid) ORDER BY preference_rule LIMIT 1`
  - Consider also `src = CONCAT('node/', :nid, '/view')`
  - If `url_alias.language` is used in your install, add `AND (language = :lang OR language = '') ORDER BY language DESC`
- If no alias is found:
  - Do not fabricate a new canonical path.
  - Log as error and keep the record out of publication until resolved.

Frontend (Astro) build:
- Fetch list of `permalink` records from Keystone.
- Generate files exactly matching `permalink` at root.
- Do not add locale directories or alter case.

## Change Control

- This spec is authoritative for URL behavior in MVP.
- Amendments require Architect approval and update to deployment rules and test suites.
- Any change that would alter a public path must include:
  - A migration plan,
  - Redirect mapping,
  - SEO impact assessment,
  - Orchestrator gate approval.
