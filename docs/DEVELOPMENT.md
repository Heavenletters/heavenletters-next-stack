# Development Database

This file documents the development database used by the heavenletters-next-stack environment.

## Connection Details

- **Host**: Configured via `DB_HOST` environment variable (see .env.sample)
- **Port**: Configured via `DB_PORT` environment variable (default: 3306)
- **Database**: Configured via `DB_NAME` environment variable (default: heaven)
- **Container**: db (Docker container)
- **Running in**: Docker container (development environment)

## Using Environment Variables

Connection details should be provided via environment variables in a `.env` file (never committed to the repository). See [backend/.env.sample](heavenletters-next-stack/backend/.env.sample) for a template with placeholders. Refer to [SECRETS_POLICY.md](heavenletters-next-stack/docs/SECRETS_POLICY.md) for guidelines on handling secrets securely.

Example environment variables (see backend/.env.sample for complete template):
- `DB_HOST=your_database_host` (e.g., 192.168.8.103 for development)
- `DB_PORT=3306` (default MariaDB/MySQL port)
- `DB_NAME=heaven` (database name)
- `DB_USER=your_db_username` (use a least-privilege user)
- `DB_PASSWORD=your_secure_password` (rotate regularly)

## Connection Command

```bash
mysql --host=$DB_HOST --port=$DB_PORT --user=$DB_USER --password -D $DB_NAME
```
Enter the password interactively when prompted, or provide it via secure secret storage (e.g., vault or environment variable). Never include passwords in scripts or commit them to the repository.

## Drupal 5.x Schema Documentation

### Database Overview
- **Total Records**: 64,510 nodes
- **Schema Version**: Drupal 5.x with CCK (Content Construction Kit)
- **Custom Content Types**: heavenletters
- **Localization**: Enabled (localizernode table)

### Core Tables

#### `node` (Main Content Table)
```sql
nid int(10) unsigned NOT NULL auto_increment PRIMARY KEY,
vid int(10) unsigned NOT NULL default '0',
type varchar(32) NOT NULL default '',
title varchar(128) NOT NULL default '',
uid int(10) NOT NULL default '0',
status int(11) NOT NULL default '1',
created int(11) NOT NULL default '0',
changed int(11) NOT NULL default '0',
comment int(11) NOT NULL default '0',
promote int(11) NOT NULL default '0',
moderate int(11) NOT NULL default '0',
sticky int(11) NOT NULL default '0'
```

#### `node_revisions` (Content Revisions)
```sql
nid int(10) unsigned NOT NULL default '0',
vid int(10) unsigned NOT NULL auto_increment PRIMARY KEY,
uid int(10) NOT NULL default '0',
title varchar(128) NOT NULL default '',
body longtext,
teaser longtext,
log longtext,
timestamp int(11) NOT NULL default '0',
format int(11) NOT NULL default '0'
```

#### `users` (Author Information)
```sql
uid int(10) unsigned NOT NULL auto_increment PRIMARY KEY,
name varchar(60) NOT NULL default '',
pass varchar(32) NOT NULL default '',
mail varchar(64) default '',
mode tinyint(4) NOT NULL default '0',
sort tinyint(4) default '0',
threshold tinyint(4) default '0',
theme varchar(255) NOT NULL default '',
signature varchar(255) NOT NULL default '',
created int(11) NOT NULL default '0',
access int(11) NOT NULL default '0',
login int(11) NOT NULL default '0',
status tinyint(4) NOT NULL default '1',
timezone varchar(8) default '',
language varchar(12) NOT NULL default '',
picture varchar(255) NOT NULL default '',
init varchar(64) default '',
data longtext
```

### Custom Content Type Tables

#### `content_type_heavenletters` (Heavenletter-specific Fields)
```sql
nid int(10) unsigned NOT NULL default '0' PRIMARY KEY,
vid int(10) unsigned NOT NULL default '0',
field_heavenletter_body_value longtext,
field_heavenletter_body_format int(10) unsigned default NULL
-- Additional CCK fields as needed
```

#### `localizernode` (Localization Data)
```sql
nid int(10) unsigned NOT NULL default '0',
tnid int(10) unsigned NOT NULL default '0',
language varchar(12) NOT NULL default '',
PRIMARY KEY (nid),
KEY tnid (tnid),
KEY language (language)
```

### GraphQL Field Mappings

**Core Node Fields**:
- `node.nid` → `id`
- `node.title` → `title`
- `node.uid` → `authorId`
- `node.created` → `createdAt`
- `node.changed` → `updatedAt`
- `node.status` → `published`
- `node.type` → `contentType`

**Custom Fields**:
- `content_type_heavenletters.field_heavenletter_body_value` → `body`
- `content_type_heavenletters.field_heavenletter_body_format` → `bodyFormat`

### Data Consistency Checks

Run these queries to verify data integrity:

```sql
-- Check for orphaned content_type_heavenletters records
SELECT COUNT(*) FROM content_type_heavenletters ct
LEFT JOIN node n ON ct.nid = n.nid
WHERE n.nid IS NULL;

-- Check for NULL titles
SELECT COUNT(*) FROM node WHERE title IS NULL OR title = '';

-- Check for orphaned revisions
SELECT COUNT(*) FROM node_revisions nr
LEFT JOIN node n ON nr.nid = n.nid
WHERE n.nid IS NULL;
```

### Notes

- Ensure the Docker container is running and port 3306 is exposed to the host or network.
- Drupal 5.x uses a sequence system instead of auto-increment for database portability.
- CCK tables follow the `content_type_[typename]` naming convention.
- Update this file if the container IP, port, or schema changes.
- Database was restored from `26092025_heavenletters.sql` dump file.
- Always use environment variables for credentials as per SECRETS_POLICY.md.