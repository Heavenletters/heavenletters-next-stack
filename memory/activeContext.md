# Active Context: Heavenletters Migration

## Current Focus
We are currently in **Phase 0: Safety Preflight**. The immediate priority is ensuring the security and integrity of the database before proceeding with the main migration tasks. This involves securing database credentials, setting up a least-privilege user, and validating backup/restore procedures.

## Recent Work
- **Documentation Cleanup**: Outdated documentation has been audited and updated to reflect the current migration project status.
- **Project Planning**: The technical stack (KeystoneJS + AstroJS) has been finalized, and a comprehensive roadmap has been established.
- **Project Structure**: The repository structure has been organized with `backend/`, `frontend/`, `docs/`, and `scripts/` directories.
- **Canonical URL Policy**: A strict policy for preserving existing Drupal permalinks has been defined (`URL_SPEC.md`).
- **Memory Bank Initialization**: The `memory` directory and initial context files (`projectBrief.md`, `productContext.md`) have been created to support agent memory.

## Next Steps
1.  **Gate A Completion**:
    -   Implement strict secrets management (sanitize repo, configure `.env`).
    -   Rotate database passwords and create a least-privilege MySQL user for KeystoneJS.
    -   Perform and verify a fresh database backup.
2.  **Phase 2 Initiation (Backend Setup)**:
    -   Install and configure KeystoneJS 6.
    -   Set up the Prisma schema with the `ks_heavenletter` table.
    -   Establish the connection to the remote development database.
3.  **Migration Script Development**:
    -   Develop the read-only sync script to migrate data from Drupal to KeystoneJS tables.
    -   Implement field mapping and error handling.

## Active Risks
-   **Database Safety**: Working with the legacy database requires extreme caution to prevent accidental data modification. The read-only sync approach and least-privilege user are critical mitigations.
-   **Migration Complexity**: Mapping Drupal 5.x CCK fields to a modern Prisma schema involves complex logic, especially for translations and URL aliases.