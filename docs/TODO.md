# Project Todo List

Current item being worked on: Gate A Safety Preflight (secrets rotation, least-privilege DB user, backup/restore verification).

- [x] Discuss and decide frontend framework (Astro vs. Next.js): Review pros/cons, confirm choice (Astro for performance on static content with islands)
- [x] Update PROJECT_ROADMAP.md with chosen framework and rationale (AstroJS frontend, islands for dynamics; edit file to reflect)
- [x] Gather historical context for Heavenletters.org (Collect details on origins, evolution, key milestones to inform VMA and design decisions)
- [x] Create and refine Project VMA document (Draft VMA.md with vision/mission/aims; incorporate historical context from user, review/approve, then finalize file)
- [x] User review/approval of HISTORY.md and VMA.md (Feedback on summaries and integration; make final tweaks if needed)
- [x] Integrate future vision into VMA and roadmap (Update VMA.md with promise to Gloria, sustainability goals [ebooks multilingual, subscriptions, premium content via Stripe]; add to PROJECT_ROADMAP.md as Phase 3.5; note Godwriting workshop as separate project on godwriting.org)
- [x] Adjust plan for new requirements (Initial permalink and i18n strategy drafted; LLM-moderated comments and semantic search scoped post-MVP)
- [x] Simplify MVP for clean UI and full HL availability (Defer full LLM/comments/ebooks/subscriptions/forum to post-MVP; focus Phase 3 on minimal Tailwind UI, basic keyword search; ensure 100% of 6,620 HL migration/access)
- [x] Add DB preservation and remote server notes (Explicitly state MariaDB at 192.168.8.103:3306 for all dev connections; ks_ prefix; no drops/alters to existing 'heaven' schema)
- [x] Update ORCHESTRATOR_ROADMAP.md to align with Keystone plus Astro migration phases and agent handoffs (replace legacy GraphQL restart steps)
- [x] Create URL_SPEC.md codifying canonical URLs from Drupal url_alias.dst; no publish_number in URLs; each translation retains its own root-level alias
- [x] Update PROJECT_ROADMAP.md to v3.1 reflecting URL_SPEC permalink policy and Keystone permalink column

- [x] Final plan approval (Confirm roadmap v3.1 with url_alias-based permalinks, ks_heavenletter.permalink UNIQUE, and safety gates; greenlight Orchestrator Phase 0 Safety Preflight)

Safety Preflight and Secrets (Phase 0) — Owner: Orchestrator — Status: In Progress
- [ ] Sanitize DEVELOPMENT.md by removing plaintext credentials; add .env.sample and a short Secrets Policy; note to rotate exposed DB password immediately
- [ ] Rotate DB password on 192.168.8.103; move credentials to .env; restrict access credentials distribution
- [ ] Provision least-privilege Keystone DB user with CREATE, INSERT, UPDATE, SELECT, INDEX on ks_ tables only; deny ALTER/DROP on legacy Drupal tables
- [ ] Create DATA_SAFETY_CHECKLIST.md covering least-privilege user, Prisma safety flags, ks_ prefix enforcement, backups, preview SQL, and staging validation
- [ ] Take and verify a fresh backup of the heaven database; document restore verification procedure

Phase 2: Backend KeystoneJS
- [ ] Phase 2.1: Install KeystoneJS 6 in backend/ (npm create keystone-app backend --with-prisma); configure MySQL to 192.168.8.103:3306 via env vars; enforce ks_ prefix and Prisma append-only with --accept-data-loss=false
- [ ] Phase 2.2: Define Keystone schema (ks_heavenletter)
      Fields: nid Int; tnid Int; title String; body Text/MDX; locale String; published_on DateTime; written_on DateTime; permalink String UNIQUE (exact url_alias.dst, no leading slash); publish_number Int (metadata only); tags Json; embeddings Json
      Also define User for volunteer admin
- [ ] Phase 2.3: Build data sync script (Node.js/Prisma: read-only from Drupal tables including url_alias and localizernode; upsert all 6,620 HLs into ks_heavenletter with exact permalink; validate UTF-8; log anomalies; do not synthesize slugs)
- [ ] Phase 2.4: Configure Keystone GraphQL (Queries by permalink and listing endpoints; basic auth for /admin; test CRUD strictly on ks_ tables)

Phase 3: Frontend AstroJS
- [ ] Phase 3.1: Initialize AstroJS project in frontend/ (astro new frontend --template minimal; add Tailwind for clean/minimal UI; @astrojs/mdx)
- [ ] Phase 3.2: Develop core components (Static MDX reader; basic keyword search via GraphQL; simple language selector)
- [ ] Phase 3.3: Implement pages/routes (Generate static files exactly at ks_heavenletter.permalink at site root; translations generated at their own root-level aliases per URL_SPEC.md)
- [ ] Phase 3.4: Integrate basic features (RSS per language; social meta; optional fallback reads from Drupal during staging; ensure full HL accessibility via search/archive/tags)

Phase 4: Integration and Testing
- [ ] Phase 4.1: End-to-end integration (Astro fetches Keystone for content/search/tags; caching; ensure routing strictly via permalink)
- [ ] Phase 4.2: Testing suite (Parity vs Drupal for content and exact permalink equality to url_alias.dst; E2E Playwright for UI/routes/basic search; accessibility; confirm all 6,620 HLs load; verify original DB unchanged)
- [ ] Phase 4.3: Optimization (Add DB indexes on ks_heavenletter.permalink, locale, publish_number; Astro performance tuning; UI readability refinements)

Phase 5: Deployment & Launch
- [ ] Phase 5.1: Production infra (Netlify/Vercel for Astro serving root-level .html routes; Railway for Keystone; env vars for DB/OpenAI if used)
- [ ] Phase 5.2: CI/CD (GitHub Actions: build/test/deploy; integrity checks for permalink uniqueness; optional sync trigger for ks_ tables)
- [ ] Phase 5.3: Launch (Full sync to ks_; minimal path redirects required since permalinks are preserved; monitor availability/UI/index with Sentry; confirm Drupal data preserved)

Post-MVP
- [ ] Full LLM semantic search (Natural language queries with embeddings/tags via OpenAI/HuggingFace in frontend)
- [ ] Implement LLM-moderated comments (Add Comments schema/mutations; moderate with GPT-3.5)
- [ ] Sustainability features (Ebooks PDF/EPUB exports; subscriptions/premium with Stripe)
- [ ] Subscriber forum (Discourse/Keystone for paid conversations)
- [ ] Optional host-level i18n (If adopted later; paths remain identical; host varies only)
- [ ] Post-launch decommission plan (Archive Drupal after verification; quarterly reviews; track metrics [traffic, search usage])

Documentation hygiene and scope alignment
- [ ] Create MIGRATION_VALIDATION.md (pre/post counts; alias uniqueness checks; deterministic sampling; content hash golden set; acceptance criteria)
- [ ] Create GODWRITING_SCOPE.md and link from VMA.md and PROJECT_ROADMAP.md as separate initiative not in migration scope
- [ ] Locale mapping: confirm Drupal language codes to internal locale mapping and add a mapping section to URL_SPEC.md
