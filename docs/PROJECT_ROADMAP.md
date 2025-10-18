# Heavenletters Next Stack - Project Roadmap

**Version 3.1** (Updated 2025-09-29: Canonical URLs are preserved from Drupal 5 url_alias.dst, no publish_number in URLs. Add permalink field to Keystone, adopt sync from url_alias, and generate Astro pages exactly at preserved paths. References [URL_SPEC.md](heavenletters-next-stack/docs/URL_SPEC.md))

## Overview
Migrate Drupal 5 (6,620 Heavenletters, multilingual via tnid) to KeystoneJS (GraphQL CMS, MySQL ks_ prefix on remote DB at 192.168.8.103:3306) + AstroJS (static frontend). For development, the database is hosted on 192.168.8.103:3306 ('heaven' schema); all local Keystone connections are temporarily made to this remote server—no local DB setup. Preserve existing DB intact. MVP: Preserve permalinks/SEO using Drupal url_alias as source of truth, clean UI for viewing/basic keyword search, all HLs available in languages. Phase 2 includes LLM integration prep (indexing for future semantic search). Post-MVP: Full LLM features, premium. No Godwriting. Phased: Backend (data/LLM prep, remote DB-safe), frontend (simple UI), integration/testing, launch. Guiding: Simplicity, volunteer ease, free core, WCAG.

## Phase 1: Preparation & Planning (Completed)
- [x] Review Drupal schema (publish_number, published_on/written_on, title, translations via tnid).
- [x] Stack: KeystoneJS backend (remote DB connections for dev), AstroJS frontend (Tailwind clean UI, mdx).
- [x] VMA/HISTORY (Legacy + future; simplicity first).
- [x] Project structure: heavenletters-next-stack/ (docs/, backend/, frontend/).
- [x] Canonical URL policy defined in [URL_SPEC.md](heavenletters-next-stack/docs/URL_SPEC.md)

## Phase 2: Backend Setup (KeystoneJS) - 1-2 weeks (MVP + LLM Integration Prep)
Focus: Migrate all 6,620 HLs with preserved permalinks to new ks_ tables on remote DB; all local dev connections to 192.168.8.103:3306; preserve existing—no deletions.
- [ ] 2.1: Install KeystoneJS 6 (`npm create keystone-app backend --with-prisma`); configure MySQL connection to remote server for local dev (host 192.168.8.103 port 3306, database 'heaven', ks_ prefix for new tables only; Prisma append mode/no-drop to avoid altering existing Drupal tables; env vars for credentials—make it clear all local connections temporarily to this remote server, no local DB; add OpenAI/HuggingFace deps for indexing).
- [ ] 2.2: Schema (Prisma list ks_heavenletter):
  - Fields: nid Int, tnid Int, title String, body Text(MDX), locale String, published_on DateTime, written_on DateTime, permalink String UNIQUE (canonical path from url_alias.dst), publish_number Int (metadata only, not used in URL), tags Json, embeddings Json.
  - User list for auth/volunteers.
  - Migrate with db push --accept-data-loss=false on remote DB.
- [ ] 2.3: Sync script (Node.js/Prisma) [see [URL_SPEC.md](heavenletters-next-stack/docs/URL_SPEC.md)]
  - Read-only from Drupal tables including url_alias and localizernode.
  - For each HL: resolve alias via url_alias (dst) and store in ks_heavenletter.permalink (exact, no leading slash). No publish_number in URL.
  - Translations: each translation node has its own alias; store their own permalink. No locale path prefix is introduced.
  - Upsert all 6,620 HLs to ks_heavenletter; validate UTF-8; log anomalies; optional batch-tag/embedding fields (deferred execution by default).
- [ ] 2.4: GraphQL
  - Queries for HLs by permalink, locale, publish_number, and listing with pagination.
  - Basic auth /admin; test sync/CRUD/indexing on new ks_ tables only (remote connection for local dev).

## Phase 3: Frontend Development (AstroJS) - 2-4 weeks (MVP Focus)
Focus: Clean UI for all HLs; basic search (keyword + tag filter from LLM prep).
- [ ] 3.1: Initialize Astro (`astro new frontend --template minimal`); add Tailwind (minimal, responsive UI), @astrojs/mdx.
- [ ] 3.2: Components (Static MDX viewer clean design; basic search (keyword + LLM tags via GraphQL); language selector).
- [ ] 3.3: Pages/routes
  - Generate static pages exactly matching ks_heavenletter.permalink values at site root, e.g., /wholeness-on-behalf-of-the-universe.html.
  - Translations: generate their own root-level permalinks, e.g., /integrita-per-conto-dell-universo.html.
  - No locale prefix segment is added in paths.
- [ ] 3.4: Features (RSS per language; social meta; optional fallback to Drupal during staging; ensure full HL access via search/archive/tags).

## Phase 4: Integration & Testing - 1-2 weeks
Focus: All HLs available, clean UI, LLM prep validation on remote DB.
- [ ] 4.1: Integration (Astro queries Keystone content/search/tags from ks_ tables on remote DB; caching; ensure routes are backed by permalinks).
- [ ] 4.2: Testing
  - Parity vs Drupal: content and exact permalink match url_alias.dst for each sampled HL.
  - E2E Playwright for UI/routes/search; accessibility checks for clean UI.
  - Confirm all 6,620 HLs load; spot-check LLM tags; verify original remote DB unchanged.
- [ ] 4.3: Optimization (DB indexes on ks_ tables for permalink/publish_number/locale; Astro performance; UI simplicity; optional LLM indexing batch efficiency).

## Phase 5: Deployment & Launch - 1 week
Focus: Reliable simple rollout with LLM backend on remote DB (temporary for dev).
- [ ] 5.1: Infra (Netlify/Vercel Astro build serving root-level .html routes; Railway Keystone connecting to remote DB 192.168.8.103:3306; env vars DB/OpenAI for indexing; read-only to original tables).
- [ ] 5.2: CI/CD (GitHub Actions build/test/deploy; integrity checks for permalink uniqueness; sync/index trigger on ks_ tables).
- [ ] 5.3: Launch (Full sync to ks_; because permalinks are preserved, minimal path redirects expected; monitor availability/UI/index Sentry; confirm Drupal data preserved on 192.168.8.103).

## Post-MVP: Enhancements (3+ months)
Focus: Activate LLM, add premium.
- [ ] LLM Semantic Search: Natural queries (embeddings for topics death/relationships in frontend).
- [ ] LLM-Moderated Comments: Add schema/mutations; moderate GPT-3.5.
- [ ] Sustainability: Ebooks exports; subscriptions Stripe.
- [ ] Subscriber Forum: Discourse/Keystone paid convos.
- [ ] Optional host-level i18n: If later adopted, preserve permalinks; vary host only.
- [ ] Decommission: Archive Drupal (after verification); quarterly reviews (expand LLM based on usage).

## Risks & Mitigations
- DB Preservation: Strict Prisma config (append/no-drop); backups pre-sync; test on remote staging copy; all local dev connections to 192.168.8.103:3306—no local DB, temporary remote for local dev.
- URL Integrity: Source permalinks exclusively from url_alias; do not synthesize slugs; collision report and manual resolution per [URL_SPEC.md](heavenletters-next-stack/docs/URL_SPEC.md).
- 6,620 HL Scale: Batch sync/indexing (500/batch for any LLM API).
- LLM Integration: Offline/HuggingFace for prep to minimize costs.

## Timeline & Milestones
- End Week 2: Backend/sync complete (remote DB safe), permalinks populated from url_alias.
- End Week 4: Frontend MVP clean UI rendering at preserved permalinks.
- End Week 6: Tested/deployed.
- End Week 7: Launch.
- Month 4+: LLM activation.

References
- [URL_SPEC.md](heavenletters-next-stack/docs/URL_SPEC.md)
- [ORCHESTRATOR_ROADMAP.md](heavenletters-next-stack/docs/ORCHESTRATOR_ROADMAP.md)
- [DEVELOPMENT.md](heavenletters-next-stack/docs/DEVELOPMENT.md)
- [VMA.md](heavenletters-next-stack/docs/VMA.md)