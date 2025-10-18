# Database Migration Mapping: Drupal 5.x to KeystoneJS

## Overview

This document provides a comprehensive mapping of Drupal 5.x database schema to KeystoneJS for the Heavenletters migration project. The current sync script is failing due to schema mismatches, particularly around content type fields and translation handling.

## Current Issues Identified

Based on analysis of [`heavenletters-next-stack/backend/sync-heavenletters.js`](heavenletters-next-stack/backend/sync-heavenletters.js) and comprehensive database audit:

1. **Missing CCK Fields**: The script only queries `node` and `node_revisions` tables but ignores `content_type_heavenletters` table which contains custom fields
2. **Incorrect Translation Join**: References `ln.locale` from a non-existent table alias in the query
3. **Incorrect Field Mapping**: Critical field mappings are wrong based on actual database schema analysis

## ✅ CORRECTED FIELD MAPPINGS (Based on Database Audit)

### Critical Corrections Discovered:

| KeystoneJS Field | Previous (Incorrect) Mapping | Corrected Mapping | Evidence from Audit |
|------------------|------------------------------|-------------------|---------------------|
| `publishNumber` | `node.nid` | `content_type_heavenletters.field_heavenletter__value` | Audit shows `field_heavenletter__value` contains actual publish numbers (1240, 1241, etc.) |
| `publishedOn` | `node.created` | `content_field_published_date.field_published_date_value` | Dedicated table exists with proper date values like "2007-03-25T00:00:00" |
| `writtenOn` | `node.changed` | `content_field_date_written.field_date_written_value` | Dedicated table exists (sample data empty but schema correct) |

**Note**: The `field_publish_date` table mentioned in the original task does NOT exist. The correct table name is `content_field_published_date`.

## Database Schema Analysis

### 1. Node Table (`node`)

**Primary content nodes table**

| Field | Type | Description | Migration Mapping |
|-------|------|-------------|-------------------|
| `nid` | int(10) unsigned | Node ID (Primary Key) | `publishNumber` |
| `vid` | int(10) unsigned | Version ID | Not needed in KeystoneJS |
| `type` | varchar(32) | Content type | Filter for 'heavenletter' |
| `language` | varchar(12) | Language code | `locale` |
| `title` | varchar(255) | Node title | `title` |
| `uid` | int(10) unsigned | Author user ID | Not needed in current scope |
| `status` | tinyint(4) | Publication status | Filter for published (1) |
| `created` | int(11) | Creation timestamp | `publishedOn` |
| `changed` | int(11) | Last modification timestamp | `writtenOn` |
| `comment` | int(11) | Comment settings | Not needed |
| `promote` | tinyint(4) | Promotion status | Not needed |
| `moderate` | tinyint(4) | Moderation status | Not needed |
| `sticky` | tinyint(4) | Sticky status | Not needed |
| `tnid` | int(10) unsigned | Translation set ID | `tnid` |

### 2. Node Revisions Table (`node_revisions`)

**Content revisions with body text**

| Field | Type | Description | Migration Mapping |
|-------|------|-------------|-------------------|
| `nid` | int(10) unsigned | Node ID (Foreign Key) | Join key |
| `vid` | int(10) unsigned | Version ID (Primary Key) | Not needed |
| `uid` | int(10) unsigned | Author user ID | Not needed |
| `title` | varchar(255) | Revision title | `title` |
| `body` | longtext | Content body | `body` |
| `teaser` | longtext | Content teaser | Not needed in current scope |
| `log` | longtext | Revision log | Not needed |
| `timestamp` | int(11) | Revision timestamp | Not needed |
| `format` | int(11) | Text format | Not needed |

### 3. Content Type Heavenletters Table (`content_type_heavenletters`)

**CCK (Content Construction Kit) fields for heavenletter content type**

| Field | Type | Description | Migration Mapping |
|-------|------|-------------|-------------------|
| `vid` | int(10) unsigned | Version ID (Primary Key) | Join key |
| `nid` | int(10) unsigned | Node ID (Foreign Key) | Join key |
| `field_heavenletter__value` | int(11) | **Heavenletter publish number** | `publishNumber` ✅ **CORRECTED** |
| `field_heavenletter_number_nid` | int(11) | Related node ID | Not needed for current scope |
| `field_translated_by_uid` | int(11) | Translator user ID | Not needed for current scope |
| `field_proofed_value` | longtext | Proofreading notes | Not needed for current scope |
| `field_newsletter_sent_value` | varchar(20) | Newsletter status | Not needed for current scope |

**Note**: This table contains the actual content fields defined by the CCK module. The current sync script completely ignores this table, which is likely the primary cause of the migration failures.

### 4. Date Field Tables (CCK Field Storage)

**Separate tables for custom date fields**

#### content_field_published_date
| Field | Type | Description | Migration Mapping |
|-------|------|-------------|-------------------|
| `vid` | int(10) unsigned | Version ID | Join key |
| `nid` | int(10) unsigned | Node ID | Join key |
| `field_published_date_value` | varchar(20) | Publication date | `publishedOn` ✅ **CORRECTED** |

#### content_field_date_written
| Field | Type | Description | Migration Mapping |
|-------|------|-------------|-------------------|
| `vid` | int(10) unsigned | Version ID | Join key |
| `nid` | int(10) unsigned | Node ID | Join key |
| `field_date_written_value` | varchar(20) | Date written | `writtenOn` ✅ **CORRECTED** |

**Note**: These tables store the actual date values for the custom fields. The `field_publish_date` table mentioned in the original task does NOT exist - the correct table name is `content_field_published_date`.

### 4. Localization Node Table (`localizernode`)

**Translation mappings and relationships**

| Field | Type | Description | Migration Mapping |
|-------|------|-------------|-------------------|
| `nid` | int(10) unsigned | Node ID | Join key |
| `locale` | varchar(12) | Language code | `locale` |
| `pid` | int(10) unsigned | Parent node ID for translations | Translation relationship |

**Translation Structure**: Drupal uses a translation set system where:
- `tnid` in `node` table identifies the translation set
- `localizernode` maps individual nodes to their translations
- Each translation has the same `tnid` but different `nid` values

### 5. URL Alias Table (`url_alias`)

**URL path mappings**

| Field | Type | Description | Migration Mapping |
|-------|------|-------------|-------------------|
| `pid` | int(10) unsigned | Alias ID (Primary Key) | Not needed |
| `src` | varchar(128) | Source path | Join key (matches 'node/{nid}') |
| `dst` | varchar(128) | Destination path | `permalink` |

## Content Type Mapping

### Heavenletter Content Type

**Drupal 5.x Structure:**
- **Content Type**: `heavenletter`
- **CCK Fields**:
  - `field_heavenletter__value` (longtext) - Main content body

**KeystoneJS Mapping (CORRECTED):**
```javascript
{
  permalink: "derived-from-url-alias",
  title: "from node.title",
  body: "from node_revisions.body", // Main content body
  locale: "from node.language",
  publishNumber: "from content_type_heavenletters.field_heavenletter__value", // ✅ CORRECTED
  publishedOn: "from content_field_published_date.field_published_date_value", // ✅ CORRECTED
  writtenOn: "from content_field_date_written.field_date_written_value", // ✅ CORRECTED
  tnid: "from node.tnid"
}
```

**Important Notes:**
- `publishNumber` now correctly maps to `field_heavenletter__value` (contains actual numbers like 1240, 1241)
- `publishedOn` now correctly maps to `field_published_date_value` (contains dates like "2007-03-25T00:00:00")
- `writtenOn` now correctly maps to `field_date_written_value` (may be empty in sample data but schema exists)

## Translation Structure

### Drupal Translation System

**How it works:**
1. **Translation Set**: Identified by `tnid` (Translation Node ID)
2. **Node Relationships**: `localizernode` table maps `nid` → `locale` → `pid`
3. **Content Storage**: Each translation is a separate node with its own `nid` but shared `tnid`

**Example Translation Structure:**
```
tnid: 123
├── nid: 123, locale: 'en' (Original/Parent)
├── nid: 124, locale: 'es' (Spanish translation)
└── nid: 125, locale: 'fr' (French translation)
```

**Migration Strategy:**
- Group nodes by `tnid` for translation sets
- Create separate KeystoneJS records for each translation
- Maintain relationship through shared `tnid`

## Sample Data

### Node Table Sample
```sql
-- Sample published heavenletter nodes
SELECT nid, type, title, status, created, changed, tnid
FROM node
WHERE type = 'heavenletter' AND status = 1
LIMIT 5;
```

### Node Revisions Sample
```sql
-- Sample content with body text
SELECT nr.nid, nr.title, nr.body, n.created, n.changed
FROM node_revisions nr
JOIN node n ON n.nid = nr.nid
WHERE n.type = 'heavenletter' AND n.status = 1
LIMIT 5;
```

### Content Type Heavenletters Sample
```sql
-- Sample CCK field data (currently missing from sync)
SELECT vid, nid, field_heavenletter__value
FROM content_type_heavenletters
WHERE nid IN (SELECT nid FROM node WHERE type = 'heavenletter' AND status = 1)
LIMIT 5;
```

### Localization Sample
```sql
-- Sample translation mappings
SELECT nid, locale, pid
FROM localizernode
WHERE nid IN (SELECT nid FROM node WHERE type = 'heavenletter')
LIMIT 5;
```

### URL Alias Sample
```sql
-- Sample URL mappings
SELECT src, dst
FROM url_alias
WHERE src LIKE 'node/%'
AND CAST(SUBSTRING_INDEX(src, '/', -1) AS UNSIGNED) IN (
  SELECT nid FROM node WHERE type = 'heavenletter' AND status = 1
)
LIMIT 5;
```

## Migration Flow

### Current (Broken) Flow
```
Drupal Tables → sync-heavenletters.js → KeystoneJS
     ↓
[Missing CCK fields]
[Incorrect translation joins]
[Incomplete field mapping]
     ↓
Schema mismatches and data loss
```

### Corrected Flow
```
Drupal Tables:
├── node (metadata)
├── node_revisions (title, body)
├── content_type_heavenletters (CCK fields) ← Currently missing!
├── localizernode (translations)
└── url_alias (permalinks)

↓

sync-heavenletters.js (corrected):
├── Proper JOIN operations
├── Include CCK field data
├── Correct translation handling
└── Complete field mapping

↓

KeystoneJS ks_heavenletter table
```

## Required Fixes

### 1. Fix the Main Query
**Current (broken):**
```sql
SELECT n.nid, n.status, n.created, n.changed, nr.title, nr.body, ua.dst AS permalink, COALESCE(ln.locale, 'en') as locale
FROM node n
JOIN node_revisions nr ON n.nid = nr.nid
LEFT JOIN url_alias ua ON ua.src = CONCAT('node/', n.nid)
WHERE n.type = 'heavenletter' AND n.status = 1
```

**Fixed (CORRECTED based on audit):**
```sql
SELECT
  n.nid, n.status, n.created, n.changed, n.tnid, n.language,
  nr.title, nr.body,
  ua.dst AS permalink,
  cth.field_heavenletter__value as publishNumber,
  cpd.field_published_date_value as publishedOn,
  cdw.field_date_written_value as writtenOn
FROM node n
JOIN node_revisions nr ON n.nid = nr.nid AND n.vid = nr.vid
LEFT JOIN content_type_heavenletters cth ON n.vid = cth.vid
LEFT JOIN content_field_published_date cpd ON n.vid = cpd.vid
LEFT JOIN content_field_date_written cdw ON n.vid = cdw.vid
LEFT JOIN url_alias ua ON ua.src = CONCAT('node/', n.nid)
WHERE n.type = 'heavenletter' AND n.status = 1
```

**Key Changes:**
- Added `n.language` for locale mapping
- Added `cth.field_heavenletter__value` for publishNumber (was missing entirely)
- Added `cpd.field_published_date_value` for publishedOn (correct table name)
- Added `cdw.field_date_written_value` for writtenOn (correct table name)
- Removed incorrect `localizernode` join (use `n.language` instead)

### 2. Update Field Mapping
**Current (incomplete):**
```javascript
const data = {
  permalink,
  title: item.title,
  body: item.body, // Missing CCK field data!
  locale: item.locale || 'en',
  publishNumber: item.nid,
  publishedOn: new Date(item.created * 1000),
  writtenOn: new Date(item.changed * 1000),
  nid: item.nid,
  tnid: item.tnid,
  tags: [],
  embeddings: null,
  createdAt: new Date(item.created * 1000),
  updatedAt: new Date(item.changed * 1000),
};
```

**Fixed (CORRECTED based on audit):**
```javascript
const data = {
  permalink,
  title: item.title,
  body: item.body, // Main content from node_revisions.body
  locale: item.language || 'en', // ✅ CORRECTED: Use node.language
  publishNumber: item.publishNumber, // ✅ CORRECTED: From field_heavenletter__value
  publishedOn: item.publishedOn ? new Date(item.publishedOn) : new Date(item.created * 1000), // ✅ CORRECTED: From field_published_date_value with fallback
  writtenOn: item.writtenOn ? new Date(item.writtenOn) : new Date(item.changed * 1000), // ✅ CORRECTED: From field_date_written_value with fallback
  nid: item.nid,
  tnid: item.tnid,
  tags: [],
  embeddings: null,
  createdAt: new Date(item.created * 1000),
  updatedAt: new Date(item.changed * 1000),
};
```

**Key Changes:**
- `locale` now uses `item.language` (from `node.language`)
- `publishNumber` now uses `item.publishNumber` (from `field_heavenletter__value`)
- `publishedOn` now uses `item.publishedOn` with fallback to `node.created`
- `writtenOn` now uses `item.writtenOn` with fallback to `node.changed`

## User Validation Questions

Based on the database audit results, please validate the following field mappings:

### 1. Publish Number Validation
- **Question**: Does `field_heavenletter__value` from `content_type_heavenletters` correctly represent the public-facing "Heavenletter Number"?
- **Evidence**: Audit shows values like 1240, 1241, 1242 which appear to be sequential publish numbers
- **Impact**: This is a critical field for the content ordering and public display

### 2. Publication Date Validation
- **Question**: Is `field_published_date_value` from `content_field_published_date` the definitive publication date?
- **Evidence**: Contains proper ISO-like date values (e.g., "2007-03-25T00:00:00")
- **Impact**: Affects the chronological ordering of content

### 3. Written Date Validation
- **Question**: Even though sample data is empty, is `field_date_written_value` from `content_field_date_written` the correct field for when the letter was written?
- **Evidence**: Schema exists but sample data is empty - may be optional field
- **Impact**: May affect content organization if this field should have values

### 4. Fallback Strategy
- **Question**: Should migration fall back to `node.created`/`node.changed` when custom date fields are empty?
- **Evidence**: Some records may have empty custom date fields
- **Impact**: Ensures no records are missing date information

## Next Steps

1. **Update sync script** with corrected query and field mappings (see corrected SQL and JavaScript above)
2. **User validation** of field mappings (see questions above)
3. **Test migration** with sample data to verify all fields are captured correctly
4. **Handle translation sets** properly by grouping related nodes
5. **Validate data integrity** after migration
6. **Document any additional fields** discovered during testing

## Conclusion

The primary issue causing the sync script to fail is the omission of the `content_type_heavenletters` table from the migration query. This table contains the actual content fields defined by Drupal's CCK module, which are essential for the complete migration of heavenletter content to KeystoneJS.