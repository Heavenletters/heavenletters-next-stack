# Secrets Policy for Heavenletters Migration Project

## Overview
This policy outlines the handling, storage, rotation, and distribution of secrets (e.g., database passwords, API keys, session secrets) in the heavenletters-next-stack project. The goal is to ensure security, compliance, and minimal exposure risk during the migration from Drupal 5 to KeystoneJS + AstroJS.

## Core Principles
- **No Secrets in Repository**: Never commit secrets to Git or any version control. All sensitive data must be externalized.
- **Environment Variables**: Use `.env` files for local development, loaded via tools like `dotenv`. Production secrets should be managed via platform-specific vaults (e.g., AWS Secrets Manager, HashiCorp Vault).
- **Least Privilege**: Grant access only to what is necessary for the role and duration required.
- **Auditability**: Maintain records of access and changes to secrets.

## Storage and Version Control
- `.env` files (and variants like `.env.local`, `.env.production`) must be ignored in `.gitignore`.
- Use [backend/.env.sample](heavenletters-next-stack/backend/.env.sample) as a template for required variables with placeholders (e.g., `CHANGE_ME`).
- Do not store real values in any committed files, including documentation. Redact examples (e.g., `REDACTED_CHANGE_ME`).

## Rotation Policy
Rotate secrets under the following triggers:
- **Initial Setup/Import**: Generate new secrets before first use in the project.
- **Personnel Changes**: Revoke and rotate upon team member onboarding/offboarding.
- **Suspected Leak**: Immediately if a secret is potentially exposed (e.g., accidental commit, log exposure).
- **Routine Cadence**: Every 90 days for high-sensitivity secrets like database passwords.

**Procedure**:
1. Generate a new strong secret (e.g., using `openssl rand -hex 32` for 256-bit entropy).
2. Update all consumers (e.g., update DATABASE_URL in secure storage).
3. Invalidate the old secret (e.g., change DB password via DBA runbook).
4. Test functionality post-rotation.
5. Record the rotation in the project audit log (e.g., in DATA_SAFETY_CHECKLIST.md).

## Distribution and Access Control
- **Need-to-Know Basis**: Share secrets only with individuals who require them for their role.
- **Secure Channels**: Use encrypted methods (e.g., 1Password, LastPass shared vaults, encrypted email/Slack) for distribution. Never use unencrypted email or chat.
- **Per-User Access**: Prefer individual vaults over shared files. For teams, use role-based access in a central manager.
- **Revocation**: Immediately revoke access upon role changes, project completion, or suspicion of compromise.

## Auditing and Compliance
- **Access Records**: Maintain a log of who has access to each secret, including dates granted/revoked.
- **Review Process**: Quarterly reviews of access lists by project leads.
- **Incident Response**: If a leak is detected, follow the DATA_SAFETY_CHECKLIST.md for verification and remediation.
- **Proof of Compliance**: Document rotations and access in [DATA_SAFETY_CHECKLIST.md](heavenletters-next-stack/docs/DATA_SAFETY_CHECKLIST.md) for gate approvals.

## References
- [.env.sample Template](heavenletters-next-stack/backend/.env.sample)
- [DATA_SAFETY_CHECKLIST.md](heavenletters-next-stack/docs/DATA_SAFETY_CHECKLIST.md) for verification steps
- [DBA_RUNBOOK_GATE_A.md](heavenletters-next-stack/docs/DBA_RUNBOOK_GATE_A.md) for DB-specific procedures
- [ORCHESTRATOR_ROADMAP.md](heavenletters-next-stack/docs/ORCHESTRATOR_ROADMAP.md) for phase gates requiring secret handling

This policy is effective immediately and applies to all contributors. Violations may result in access revocation and project delays.