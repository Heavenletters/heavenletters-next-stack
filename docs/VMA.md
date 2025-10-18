# Heavenletters Next Stack - Vision, Mission, Aims (VMA)

**Version 1.4** (Updated 2025-09-29: Integrated future vision, promise to Gloria, sustainability models, and online Godwriting workshop/community. Draws from historical context in HISTORY.md to emphasize legacy continuation, volunteer ethos, and global reach.)

## Vision
Heavenletters.org as a timeless digital sanctuary, honoring Gloria Wendroff's grassroots Godwriting legacy from 1988. A beacon of spiritual inspiration where anyone - seeker or everyday person - accesses profound, free wisdom to transform lives. The new stack (KeystoneJS backend, AstroJS frontend) ensures ad-free simplicity, multilingual accessibility, and sustainable growth, fulfilling the promise to make Heavenletters' therapeutic effects known worldwide. Echoing Gloria's journey: from private notes to global sharing, the site evolves as a living testament to oneness, letting God's light shine through technology without commercial barriers.

## Mission
Migrate the legacy Drupal 5 site (6,620 Heavenletters across 10+ languages) to a modern, performant stack while preserving content integrity, SEO, RSS syndication, and volunteer-driven spirit. Build financial sustainability through innovative, non-intrusive models (ebooks, subscriptions, premium access) to fund operations. Launch an online Godwriting workshop and community to empower users in developing personal relationships with God through writing, extending Gloria's co-facilitated global workshops. Prioritize zero-downtime, WCAG accessibility, and organic growth to reach a worldwide audience, honoring the site's origins in free, heart-led sharing.

## Aims
### Core Migration Aims (Phases 1-5)
1. **Content Preservation**: Sync all Heavenletters (nid, title, publish_number, publish_date, body, locale, translations via tnid) from Drupal DB to Keystone schema; maintain UTF-8 integrity and historical numbering for seamless multilingual access.
2. **Performance & Simplicity**: Leverage AstroJS for static SSG pages (e.g., /en/heavenletter/[number]) with islands for dynamics (search, language switching); ensure <2s load times, mobile-first with Tailwind CSS.
3. **SEO & Discoverability**: Implement 301 redirects from legacy URLs; generate sitemaps/RSS; optimize meta tags for spiritual queries (e.g., "God's wisdom on love").
4. **Admin Ease for Volunteers**: Keystone UI with role-based access (simple CRUD for Heavenletters, no coding needed); integrate historical volunteer ethos for community moderation.
5. **Testing & Launch**: Parity checks (content/search match Drupal); E2E tests with Playwright; deploy on Netlify (Astro)/Railway (Keystone) with monitoring (Sentry); quarterly reviews post-launch.

### Sustainability Aims (Phase 3.5)
1. **Revenue Models**: Generate multilingual ebooks (PDF/EPUB exports from Keystone) for purchase; implement subscriptions/premium content (e.g., ad-free archives, exclusive Q&A) via Stripe in Astro islands; aim for self-funding to end out-of-pocket since 2006.
2. **Global Reach**: Track metrics (traffic +20% YoY, subscription growth); use i18n for 10+ languages; promote via RSS/social meta to amplify therapeutic impact.

### Community & Workshop Aims (Post-MVP)
1. **Online Godwriting Workshop**: Develop 2-3 week program as interactive Keystone/Astro modules (daily writing prompts, video lessons from Gloria's co-facilitation); include progress tracking and user auth.
2. **Community of Practice**: Build forum for sharing Godwriting experiences (Astro islands or Discourse integration); foster volunteer-led discussions, echoing site's oneness theme; user-generated content with moderation to nurture personal God relationships.
3. **Legacy Fulfillment**: Honor promise to Gloria (pre-2024 passing) by sustaining free core access while innovating for growth; measure success by user transformations (e.g., feedback on spiritual connections).

## Guiding Principles (From History)
- **Free Sharing First**: Core content remains open (like 2003 emails); revenue enhances, doesn't gatekeep.
- **Volunteer Ethos**: Easy tools for community (e.g., Keystone for admins, workshop for facilitators).
- **Simplicity & Oneness**: Minimalist design (Astro's low JS); themes of letting go, pure honesty in all features.
- **Therapeutic Focus**: Prioritize emotional/spiritual impact (e.g., search by themes like grief/love).

## Success Metrics
- **Short-Term**: 100% content migration, <1% error rate in sync; site live with zero downtime.
- **Medium-Term**: 50+ subscribers in Year 1; workshop enrollment (100 users); global traffic from 10+ countries.
- **Long-Term**: Self-sustaining revenue ($10k+/year); active community (1k members); quarterly VMA reviews to adapt.

This VMA aligns with PROJECT_ROADMAP.md; updates reflect user-provided future vision for sustainability and Godwriting expansion.