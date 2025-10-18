#!/bin/bash

# grant-ks-tables.sh
# Script to grant least-privilege permissions on ks_* tables in the heaven database
# to a target MySQL user. Supports dry-run mode and optional revoke on legacy tables.
#
# Usage:
#   ./grant-ks-tables.sh <target_user> [--dry-run] [--revoke-legacy]
#
# Environment Variables (required unless --dry-run):
#   MYSQL_HOST     - Database host (default: localhost)
#   MYSQL_PORT     - Database port (default: 3306)
#   MYSQL_USER     - Admin user with GRANT/REVOKE privileges
#   MYSQL_PASSWORD - Admin user password
#   MYSQL_DB       - Database name (default: heaven)
#
# Examples:
#   export MYSQL_HOST=192.168.8.103 MYSQL_PORT=3306 MYSQL_USER=root MYSQL_PASSWORD=securepass MYSQL_DB=heaven
#   ./grant-ks-tables.sh keystone_app --dry-run
#   ./grant-ks-tables.sh keystone_app --revoke-legacy
#
# Notes:
# - Enumerates ks_* tables dynamically from information_schema.
# - Grants: SELECT, INSERT, UPDATE, CREATE, INDEX on ks_* tables.
# - Revoke option targets common legacy tables (node, users, etc.) if broad grants were applied.
# - Run as DBA; test in staging first.
# - See docs/DBA_RUNBOOK_GATE_A.md for procedure.

set -euo pipefail

# Default values
MYSQL_HOST="${MYSQL_HOST:-localhost}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_USER="${MYSQL_USER:?Error: MYSQL_USER required}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:?Error: MYSQL_PASSWORD required}"
MYSQL_DB="${MYSQL_DB:-heaven}"

TARGET_USER="${1:?Error: TARGET_USER required (e.g., keystone_app)}"
DRY_RUN=false
REVOKE_LEGACY=false

# Parse options
shift
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --revoke-legacy)
      REVOKE_LEGACY=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# MySQL connection string
MYSQL_CONN="mysql -h${MYSQL_HOST} -P${MYSQL_PORT} -u${MYSQL_USER} -p'${MYSQL_PASSWORD}' ${MYSQL_DB}"

if [[ "${DRY_RUN}" == true ]]; then
  echo "# Dry-run mode: SQL statements will be printed, not executed."
  MYSQL_CMD="echo"
else
  MYSQL_CMD="${MYSQL_CONN}"
fi

# Function to execute or echo SQL
run_sql() {
  local sql="$1"
  echo "+ $sql"
  if [[ "${DRY_RUN}" == false ]]; then
    echo "${sql}" | ${MYSQL_CONN}
  fi
}

# Ensure user exists (create if not)
run_sql "CREATE USER IF NOT EXISTS '${TARGET_USER}'@'%' IDENTIFIED BY 'REDACTED_CHANGE_ME';"
run_sql "FLUSH PRIVILEGES;"

if [[ "${REVOKE_LEGACY}" == true ]]; then
  echo "# Revoking privileges on legacy tables for ${TARGET_USER}"
  # Common legacy Drupal tables to revoke (add more as needed)
  local legacy_tables=("node" "users" "node_revisions" "content_type_heavenletters" "localizernode" "url_alias")
  for table in "${legacy_tables[@]}"; do
    run_sql "REVOKE ALL PRIVILEGES ON ${MYSQL_DB}.${table} FROM '${TARGET_USER}'@'%';"
  done
  run_sql "FLUSH PRIVILEGES;"
fi

# Enumerate ks_* tables
echo "# Granting privileges on ks_* tables for ${TARGET_USER}"
ks_tables=$(${MYSQL_CONN} -e "
  SELECT TABLE_NAME 
  FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA = '${MYSQL_DB}' AND TABLE_NAME LIKE 'ks_%';
" 2>/dev/null | tail -n +2)

if [[ -z "${ks_tables}" ]]; then
  echo "No ks_* tables found in ${MYSQL_DB}. Grants skipped."
else
  while IFS= read -r table; do
    if [[ -n "${table}" ]]; then
      run_sql "GRANT SELECT, INSERT, UPDATE, CREATE, INDEX ON ${MYSQL_DB}.${table} TO '${TARGET_USER}'@'%';"
    fi
  done <<< "${ks_tables}"
  run_sql "FLUSH PRIVILEGES;"
fi

echo "# Script completed for ${TARGET_USER}. Verify with: SHOW GRANTS FOR '${TARGET_USER}'@'%';"