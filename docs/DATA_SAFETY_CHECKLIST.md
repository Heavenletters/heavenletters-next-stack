# Data Safety Checklist for Gate A: Safety Preflight

This checklist ensures all data safety measures are completed before proceeding to backend implementation (Phase 2). It serves as proof of compliance for the Orchestrator. Complete all items, provide evidence (e.g., file paths, logs, screenshots), and obtain sign-offs. Update this file as items are addressed.

## Checklist Items

### 1. Repository Sanitization
- [ ] All documentation and files scanned for plaintext credentials (e.g., passwords, API keys).
  - Proof: Git history grep for known secrets (e.g., `git log -p | grep -i pass`); no matches found.
  - Evidence: [DEVELOPMENT.md](heavenletters-next-stack/docs/DEVELOPMENT.md) updated to use environment variables; references [SECRETS_POLICY.md](heavenletters-next-stack/docs/SECRETS_POLICY.md).
  - Additional: [backend/.env.sample](heavenletters-next-stack/backend/.env.sample) committed with placeholders only.

### 2. Database Password Rotation
- [ ] DB password on 192.168.8.103:3306 (heaven schema) rotated to a new strong value.
  - Proof: Old password invalidated; new password tested via secure connection.
  - Evidence: Update DATABASE_URL in secure storage (not committed); connection test log or screenshot (attach path: e.g., /path/to/test-log.txt).
  - Reference: Follow procedure in [DBA_RUNBOOK_GATE_A.md](heavenletters-next-stack/docs/DBA_RUNBOOK_GATE_A.md).

### 3. Least-Privilege MySQL User Provisioning
- [ ] Created dedicated user (e.g., keystone_app) with access restricted to ks_* tables only.
  - Proof: Grants applied for SELECT, INSERT, UPDATE, CREATE, INDEX on existing and future ks_* tables; no access to legacy Drupal tables.
  - Evidence: 
    - Run [scripts/grant-ks-tables.sh](heavenletters-next-stack/scripts/grant-ks-tables.sh) output (dry-run and execute modes).
    - SHOW GRANTS FOR 'keystone_app'@'%'; query results (attach path: e.g., /path/to/grants.sql).
    - Test: Successful query on ks_heavenletter (if exists); denied query on node table.
  - Reference: Static template in [db/sql/keystone_least_privilege.sql](heavenletters-next-stack/db/sql/keystone_least_privilege.sql); update grants after new Prisma pushes.

### 4. Backup and Restore Verification
- [ ] Fresh full backup of heaven database taken.
  - Proof: Backup command executed (e.g., mysqldump); file checksum verified.
  - Evidence: Backup file path and size (e.g., heaven-2025-10-01.sql.gz, MD5: abc123...); storage location (secure, offsite if possible).
- [ ] Restore procedure tested on staging environment.
  - Proof: Backup restored to test DB; data integrity checks passed (row counts, sample queries).
  - Evidence: Restore log (attach path: e.g., /path/to/restore-log.txt); sanity query results (e.g., SELECT COUNT(*) FROM node;).

### 5. Prisma and Schema Safety Acknowledgments
- [ ] Prisma schema enforces ks_* prefix for all new tables.
  - Proof: @@map("ks_table") or table naming in [backend/prisma/schema.prisma](heavenletters-next-stack/backend/prisma/schema.prisma).
- [ ] Safety flags set: prisma db push with --accept-data-loss=false; no destructive migrations on legacy.
  - Evidence: Prisma command output/logs (attach path: e.g., /path/to/prisma-push.log); confirmation no legacy tables altered.

## Sign-Off Section
Once all checkboxes are marked [x] and evidence provided:

- **Data Safety Agent**: I confirm all safety measures are complete and verifiable. Date: ____ Signature: ____
- **Orchestrator**: Gate A approved for progression to Phase 2. Date: ____ Signature: ____

## Audit Log
- Date | Action | Performed By | Notes
|-----|--------|--------------|-------
| 2025-10-01 | Checklist created | Roo | Initial template
|     |        |              | 

## References
- [SECRETS_POLICY.md](heavenletters-next-stack/docs/SECRETS_POLICY.md)
- [DBA_RUNBOOK_GATE_A.md](heavenletters-next-stack/docs/DBA_RUNBOOK_GATE_A.md)
- [ORCHESTRATOR_ROADMAP.md](heavenletters-next-stack/docs/ORCHESTRATOR_ROADMAP.md) for phase gates
- [scripts/grant-ks-tables.sh](heavenletters-next-stack/scripts/grant-ks-tables.sh)
- [db/sql/keystone_least_privilege.sql](heavenletters-next-stack/db/sql/keystone_least_privilege.sql)

Retention: Keep completed checklist for 1 year post-migration or until project audit.