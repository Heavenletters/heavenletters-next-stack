# DBA Runbook for Gate A: Safety Preflight

This runbook provides step-by-step procedures for database administrators (DBAs) to complete Gate A safety measures for the Heavenletters migration project. It covers password rotation, user provisioning, backups, restores, and rollback. Follow this in sequence on the production/development DB server (192.168.8.103:3306, heaven schema).

**Prerequisites**:
- Admin access (e.g., root user) to MySQL/MariaDB on 192.168.8.103:3306.
- Secure channel for handling/rotating secrets (e.g., password manager; see [SECRETS_POLICY.md](heavenletters-next-stack/docs/SECRETS_POLICY.md)).
- Staging environment for testing restores (separate DB instance).
- Tools: mysql client, mysqldump, md5sum (or sha256sum).
- Reference: [DATA_SAFETY_CHECKLIST.md](heavenletters-next-stack/docs/DATA_SAFETY_CHECKLIST.md) for proof recording.

**Important Notes**:
- No secrets in this document or repo. Use placeholders and rotate immediately.
- Test all steps in staging before production.
- Log all actions with timestamps and outcomes for audit.
- Contact: Escalation to project lead (e.g., orchestrator@project.com) for issues.

## 1. Password Rotation Procedure
Rotate the heaven database password to invalidate old credentials and align with least-privilege principles.

1. **Prepare New Password**:
   - Generate a strong password (e.g., 32+ chars, mixed case, numbers, symbols) via secure tool (e.g., `openssl rand -base64 32`).
   - Distribute via secure channel to need-to-know personnel only (no email/Slack).

2. **Connect as Admin**:
   ```bash
   mysql -h 192.168.8.103 -P 3306 -u root -p heaven
   ```
   - Enter current admin password interactively.

3. **Rotate Password**:
   ```sql
   ALTER USER 'root'@'%' IDENTIFIED BY 'NEW_STRONG_PASSWORD';  -- For admin if needed
   FLUSH PRIVILEGES;
   ```
   - Update any application configs (e.g., Keystone DATABASE_URL) with new password via secure storage.

4. **Test Connection**:
   - Exit and reconnect with new password.
   - Verify: Run `SELECT 1;` and `SHOW DATABASES;`.

5. **Invalidate Old Credentials**:
   - Revoke any known old users or sessions.
   - Record: Date, old/new hash (no plaintext), affected systems.

6. **Update and Audit**:
   - Update secure vaults.
   - Log in [DATA_SAFETY_CHECKLIST.md](heavenletters-next-stack/docs/DATA_SAFETY_CHECKLIST.md).
   - Trigger: Follow [SECRETS_POLICY.md](heavenletters-next-stack/docs/SECRETS_POLICY.md) for cadence.

## 2. Least-Privilege User Creation and Grants
Provision a dedicated user (keystone_app) restricted to ks_* tables. Use either static SQL or dynamic script.

1. **Connect as Admin** (as above).

2. **Option A: Static Grants (for known tables)**:
   - Source the template:
     ```bash
     mysql -h 192.168.8.103 -P 3306 -u root -p heaven < db/sql/keystone_least_privilege.sql
     ```
   - Edit template first: Replace 'REDACTED_CHANGE_ME' with rotated password.
   - Add grants for new ks_* tables post-Prisma push.

3. **Option B: Dynamic Grants (for all ks_* tables)**:
   ```bash
   # Set env vars (use secure storage for MYSQL_PASSWORD)
   export MYSQL_HOST=192.168.8.103 MYSQL_PORT=3306 MYSQL_USER=root MYSQL_PASSWORD=securepass MYSQL_DB=heaven

   # Dry-run first
   cd heavenletters-next-stack
   ./scripts/grant-ks-tables.sh keystone_app --dry-run

   # Execute (if dry-run OK)
   ./scripts/grant-ks-tables.sh keystone_app --revoke-legacy  # Optional: revoke legacy if broad grants exist
   ```

4. **Verify Grants**:
   ```sql
   SHOW GRANTS FOR 'keystone_app'@'%';
   ```
   - Expected: Grants only on ks_* (SELECT, INSERT, UPDATE, CREATE, INDEX).
   - Test:
     ```bash
     mysql -h 192.168.8.103 -P 3306 -u keystone_app -p heaven -e "SELECT * FROM ks_heavenletter LIMIT 1;"  # Success
     mysql -h 192.168.8.103 -P 3306 -u keystone_app -p heaven -e "SELECT * FROM node LIMIT 1;"  # Fail: Access denied
     ```

5. **Record Proof**:
   - Save output/logs in [DATA_SAFETY_CHECKLIST.md](heavenletters-next-stack/docs/DATA_SAFETY_CHECKLIST.md).

## 3. Backup Procedure
Take a full, consistent backup before any changes.

1. **Prepare**:
   - Ensure DB is not under heavy load.
   - Decide storage: Secure, encrypted location (e.g., S3 bucket, local vault; retention: 30 days min).

2. **Execute Backup** (mysqldump example; use mariabackup for large DBs):
   ```bash
   # Full logical backup
   mysqldump -h 192.168.8.103 -P 3306 -u root -p --single-transaction --routines --triggers heaven > heaven-backup-$(date +%Y%m%d-%H%M%S).sql

   # Compress
   gzip heaven-backup-*.sql

   # Verify checksum
   md5sum heaven-backup-*.sql.gz
   ```
   - For physical: `mariabackup --backup --target-dir=/backup/dir --user=root --password=securepass`.

3. **Store and Retain**:
   - Upload to secure storage.
   - Tag with date/version.
   - Retention: Keep 7 daily, 4 weekly; delete after Gate E (launch).

4. **Record**:
   - File path, size, checksum in [DATA_SAFETY_CHECKLIST.md](heavenletters-next-stack/docs/DATA_SAFETY_CHECKLIST.md).

## 4. Restore Verification Steps
Test restore to ensure recoverability.

1. **Prepare Staging**:
   - Create test DB: `CREATE DATABASE heaven_staging;`.

2. **Restore**:
   ```bash
   # Decompress if needed
   gunzip heaven-backup.sql.gz

   # Restore
   mysql -h staging-host -P 3306 -u root -p heaven_staging < heaven-backup.sql
   ```

3. **Sanity Checks**:
   - Row counts: `SELECT COUNT(*) FROM node;` (match original ~64,510).
   - Sample data: `SELECT nid, title FROM node LIMIT 5;`.
   - Integrity: Run consistency queries from [DEVELOPMENT.md](heavenletters-next-stack/docs/DEVELOPMENT.md).
   - Time: <1 hour for full restore.

4. **Clean Up**:
   - `DROP DATABASE heaven_staging;`.
   - Log success/fail, paths to proofs in [DATA_SAFETY_CHECKLIST.md](heavenletters-next-stack/docs/DATA_SAFETY_CHECKLIST.md).

## 5. Rollback Plan
If issues arise (e.g., failed rotation, grant errors):

1. **Immediate Actions**:
   - Revert to previous password/user state using backup.
   - Restore from latest verified backup.

2. **Escalation**:
   - Notify: Project lead, Data Safety agent.
   - Contacts: DBA on-call (phone/email), emergency: +1-XXX-XXX-XXXX.
   - Timeline: Resolve within 4 hours; full rollback <24 hours.

3. **Post-Rollback**:
   - Audit logs for root cause.
   - Update checklist; pause gates until resolved.

## Audit and References
- Log all steps with timestamps.
- References:
  - [SECRETS_POLICY.md](heavenletters-next-stack/docs/SECRETS_POLICY.md)
  - [DATA_SAFETY_CHECKLIST.md](heavenletters-next-stack/docs/DATA_SAFETY_CHECKLIST.md)
  - [scripts/grant-ks-tables.sh](heavenletters-next-stack/scripts/grant-ks-tables.sh)
  - [db/sql/keystone_least_privilege.sql](heavenletters-next-stack/db/sql/keystone_least_privilege.sql)
  - [ORCHESTRATOR_ROADMAP.md](heavenletters-next-stack/docs/ORCHESTRATOR_ROADMAP.md)

Version: 1.0 | Last Updated: 2025-10-01