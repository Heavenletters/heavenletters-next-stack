# Natural Query Schema for Heavenletters Database

This document provides concise schema information for an AI agent to generate accurate SQL queries for the Heavenletters legacy Drupal 5.x database with CCK fields.

## Core Database Schema

### Primary Tables

#### `node` (Central Content Table)
```sql
nid int(10) unsigned NOT NULL auto_increment PRIMARY KEY,  -- Unique node ID
vid int(10) unsigned NOT NULL default '0',                -- Published version ID (not for joins!)
type varchar(32) NOT NULL default '',                     -- Content type ('heavenletters')
title longtext,                                           -- Node title
status int(11) NOT NULL default '1'                       -- 1=Published, 0=Draft
```

**Notes:**
- `nid` is the primary identifier for all content
- `vid` points to the currently published revision (NOT for joining with CCK tables)
- Always join via `vid` from `node_revisions` for CCK field tables

#### `node_revisions` (Content Versions)
```sql
vid int(10) unsigned NOT NULL auto_increment PRIMARY KEY,  -- Version ID (unique)
nid int(10) unsigned NOT NULL default '0',                -- Node ID (foreign key)
title longtext,                                           -- Revision title
body longtext                                             -- HTML content
```

**Notes:**
- Each node can have multiple revisions (history)
- Always use the LATEST revision (max `vid` per `nid`) for current content
- Use `vid` from this table to join with ALL CCK field tables

#### `localizernode` (Language/Locale Mapping)
```sql
nid int(10) unsigned NOT NULL default '0' PRIMARY KEY,    -- Node ID
locale varchar(12) NOT NULL default ''                    -- Language code ('eng', 'de', 'fr', etc.)
```

**Notes:**
- Maps nodes to their language versions
- Use for filtering by language/locale

#### `users` (User Information)
```sql
uid int(10) unsigned NOT NULL auto_increment PRIMARY KEY,  -- User ID
name varchar(60) NOT NULL default '',                     -- Username
pass varchar(32) NOT NULL default '',                     -- Password hash
mail varchar(64) default '',                              -- Email
mode tinyint(4) NOT NULL default '0',                     -- Display mode
sort tinyint(4) default '0',                               -- Sort order
threshold tinyint(4) default '0',                          -- Comment threshold
theme varchar(255) NOT NULL default '',                   -- Theme
signature varchar(255) NOT NULL default '',               -- Signature
created int(11) NOT NULL default '0',                     -- Account creation timestamp
access int(11) NOT NULL default '0',                      -- Last access timestamp
login int(11) NOT NULL default '0',                       -- Last login timestamp
status tinyint(4) NOT NULL default '1',                   -- Account status (1=Active)
timezone varchar(8) default '',                           -- Timezone
language varchar(12) NOT NULL default '',                 -- Preferred language
picture varchar(255) NOT NULL default '',                 -- Avatar picture path
init varchar(64) default '',                              -- Initial email used for account
data longtext                                             -- Serialized user data
```

### CCK Field Tables (Content Type: heavenletters)

#### `content_type_heavenletters` (Publish Number)
```sql
vid int(10) unsigned NOT NULL default '0' PRIMARY KEY,    -- Version ID (foreign key)
nid int(10) unsigned NOT NULL default '0',                -- Node ID
field_heavenletter__value int(11) default NULL            -- Official publish number
```

#### `content_field_published_date` (Publication Date)
```sql
vid int(10) unsigned NOT NULL default '0' PRIMARY KEY,    -- Version ID (foreign key)
nid int(10) unsigned NOT NULL default '0',                -- Node ID
field_published_date_value datetime default NULL          -- Publication date (YYYY-MM-DD HH:MM:SS)
```

#### `content_field_translated_by` (Translator User ID)
```sql
vid int(10) unsigned NOT NULL default '0' PRIMARY KEY,    -- Version ID (foreign key)
nid int(10) unsigned NOT NULL default '0',                -- Node ID
field_translated_by_uid int(10) unsigned default NULL     -- Translator user ID (from users.uid)
```

## Relationships

- `node.nid` → `node_revisions.nid` (one-to-many)
- `node.nid` → `localizernode.nid` (one-to-one)
- `node_revisions.vid` → `content_type_heavenletters.vid` (one-to-one)
- `node_revisions.vid` → `content_field_published_date.vid` (one-to-one)
- `node_revisions.vid` → `content_field_translated_by.vid` (one-to-one)
- `content_field_translated_by.field_translated_by_uid` → `users.uid` (many-to-one)

## Translation System

Translations are separate nodes sharing a `tnid` (translation set ID) in the `node` table. Each translation has its own `nid` and is mapped to a locale via `localizernode.locale`.

## Query Patterns

### Basic Heavenletter Query (English Only)
```sql
SELECT nr.title, nr.body, cth.field_heavenletter__value AS publishNumber
FROM node n
INNER JOIN localizernode ln ON n.nid = ln.nid AND ln.locale = 'eng'
INNER JOIN (SELECT nid, MAX(vid) AS max_vid FROM node_revisions GROUP BY nid) max_rev ON n.nid = max_rev.nid
INNER JOIN node_revisions nr ON max_rev.max_vid = nr.vid
LEFT JOIN content_type_heavenletters cth ON nr.vid = cth.vid
WHERE n.type = 'heavenletters' AND n.status = 1
ORDER BY COALESCE(cth.field_heavenletter__value, n.nid) ASC;
```

### Query with Translator Information
```sql
SELECT nr.title, u.name AS translator_username, cth.field_heavenletter__value AS publishNumber
FROM node n
INNER JOIN localizernode ln ON n.nid = ln.nid AND ln.locale = 'de'
INNER JOIN (SELECT nid, MAX(vid) AS max_vid FROM node_revisions GROUP BY nid) max_rev ON n.nid = max_rev.nid
INNER JOIN node_revisions nr ON max_rev.max_vid = nr.vid
LEFT JOIN content_type_heavenletters cth ON nr.vid = cth.vid
LEFT JOIN content_field_translated_by ctb ON nr.vid = ctb.vid
LEFT JOIN users u ON ctb.field_translated_by_uid = u.uid
WHERE n.type = 'heavenletters' AND n.status = 1
ORDER BY cth.field_heavenletter__value ASC;
```

## AI Agent Instructions

### Strict Rules
- **DO NOT prefix table names with the database name** (e.g., use `node`, not `heaven.node`).
- **Always join CCK field tables using version ID (`vid`) from the `node_revisions` table.**
- **When a user asks about a 'translator', you must join from `content_field_translated_by` to the `users` table on `field_translated_by_uid` = `users.uid`.**

### Query Construction Rules
1. Always filter for published content: `n.status = 1 AND n.type = 'heavenletters'`
2. Always use latest revisions: Subquery for MAX(vid) per nid
3. Join CCK tables on revision vid: Never on node.vid
4. Handle missing data: Use LEFT JOINs and COALESCE for null values
5. Default to 'eng' locale if not specified
6. Order by publish number: `COALESCE(cth.field_heavenletter__value, n.nid)`

### Common Patterns
- Count by language: Filter by locale, use COUNT(*)
- Find by translator: Join content_field_translated_by → users
- Aggregate by date: Use content_field_published_date
- Unique by publish number: GROUP BY field_heavenletter__value

## Safety Notes
- All queries are read-only (SELECT statements only)
- No data modification operations are allowed
- Results should be paginated for large datasets (64,510+ nodes)