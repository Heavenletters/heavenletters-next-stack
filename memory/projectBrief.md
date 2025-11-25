# Project Brief: Heavenletters Migration

## Vision
To modernize the Heavenletters legacy platform by migrating from Drupal 5.x to a performant, maintainable Next.js stack (KeystoneJS + AstroJS) while preserving the sacred integrity of all 6,620 Heavenletters, their translations, and their established SEO presence. The goal is to ensure these divine messages remain accessible to the world through a robust, future-proof architecture that honors the original content while enabling modern capabilities like LLM-powered semantic search.

## Core Features
- **Content Integrity**: Complete migration of 6,620 Heavenletters and 64,510+ nodes without data loss.
- **Permalink Preservation**: Strict adherence to existing URL structures sourced from Drupal's `url_alias` table to maintain SEO rankings.
- **Multi-language Support**: Native support for 10+ languages with proper locale handling and translation relationships.
- **Modern Architecture**:
  - **Backend**: KeystoneJS 6 (Headless CMS) with Prisma ORM.
  - **Frontend**: AstroJS for high-performance static site generation (SSG).
  - **Database**: MySQL with a dual-schema approach (legacy Drupal tables + modern `ks_` tables).
- **Future-Readiness**: Architecture designed to support future LLM integration for semantic search and natural language queries.

## Target Audience
- **Global Readers**: Spiritual seekers worldwide accessing Heavenletters in multiple languages.
- **Translators**: Volunteers who translate Heavenletters into various languages.
- **Administrators**: Maintainers of the platform who need a reliable, modern CMS interface.

## Hard Constraints
- **Zero Content Modification**: Original Drupal 5.x data must remain untouched during migration.
- **URL Integrity**: Existing permalinks must be preserved exactly as they appear in Drupal's `url_alias` table. No synthesized slugs.
- **Dual Database Operation**: The system must operate with both legacy and modern schemas co-existing in the same MySQL database.
- **Legacy Compatibility**: Must maintain backward compatibility with legacy GraphQL queries where possible.
- **Environment Segregation**: Strict separation of credentials and configuration across Backend, GraphQL API, and Scripts.
- **Port Assignments**: Fixed ports must be respected (Backend: 3000, GraphQL API: 4000).

## "Vibe"
- **Reverent**: Treating the content as sacred text.
- **Reliable**: Ensuring absolute data stability and availability.
- **Clean & Modern**: Moving from a dated interface to a crisp, responsive, and accessible design.
- **Transparent**: Open documentation and clear process for migration and operations.