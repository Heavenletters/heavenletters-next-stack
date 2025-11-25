# System Patterns: Heavenletters Migration

## Architecture Overview
The system employs a dual-stack architecture to transition from Drupal 5.x to a modern Headless CMS (KeystoneJS) + Static Site Generator (AstroJS) setup.

### Data Flow
1.  **Legacy Source**: Drupal 5.x MySQL database (Read-Only).
2.  **Migration Layer**: Custom Node.js scripts sync data from Drupal tables to KeystoneJS tables (`ks_*`).
3.  **Modern Backend**: KeystoneJS manages the `ks_` tables and exposes a GraphQL API.
4.  **Frontend**: AstroJS consumes the GraphQL API at build time to generate static HTML.

## Design Patterns

### Dual Schema Strategy
-   **Co-existence**: The MySQL database hosts both legacy Drupal tables and modern KeystoneJS tables (`ks_` prefix).
-   **Isolation**: KeystoneJS is configured to only recognize and manage tables with the `ks_` prefix, preventing accidental modification of legacy data.
-   **Migration**: Data flows one-way from legacy to modern tables via sync scripts.

### Permalink Preservation
-   **Source of Truth**: The Drupal `url_alias` table is the absolute authority for URLs.
-   **Direct Mapping**: The `dst` column from `url_alias` is mapped directly to the `permalink` field in KeystoneJS.
-   **No Synthesis**: Slugs are never auto-generated from titles; they are always strictly copied from the legacy system to ensure 100% SEO preservation.

### Multi-Root Monorepo
-   **Structure**: The repository is organized into distinct root directories (`backend`, `frontend`, `scripts`, `graphql-api`) rather than a workspace-based monorepo.
-   **Independence**: Each component manages its own dependencies and configuration.

## "How-to" Guidelines

### Handling Authentication
-   **Current State**: Auth is temporarily disabled/commented out in `keystone.ts` for Phase 0/Phase 2 development.
-   **Future State**: Stateless sessions with 8-hour expiration will be enabled.
-   **Rule**: Do not uncomment auth code until explicit instruction.

### Database Operations
-   **Migration Scripts**: Always run migration scripts from the project root or specifically `backend/` as documented, checking `process.cwd()` if necessary.
-   **Schema Changes**:
    1.  Modify `backend/schema.prisma`.
    2.  Run `npm run prisma:generate`.
    3.  Run `npm run prisma:push` (ensure it targets `ks_` tables).

### Deploying Changes
-   **Keystone**: Re-build and restart the Node.js process.
-   **Astro**: Trigger a full build to fetch fresh content from the GraphQL API and regenerate static pages.