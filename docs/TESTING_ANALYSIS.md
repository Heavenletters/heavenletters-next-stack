# Heavenletters Migration Testing Strategy

## Current Status: 🔄 Phase 0 Testing Requirements

### 🎯 **Testing Scope**
The project is currently in **Phase 0 (Safety Preflight)** of migrating from Drupal 5.x to KeystoneJS + AstroJS. Testing focuses on database safety, migration accuracy, and data integrity validation.

### ✅ **Completed Testing Areas**
- **Database Connectivity**: ✅ Verified connection to `192.168.8.103:3306`
- **Schema Analysis**: ✅ Comprehensive audit of Drupal 5.x structure completed
- **Field Mapping**: ✅ Corrected mappings identified for CCK fields
- **URL Alias Strategy**: ✅ Permalink preservation approach validated

### 🔄 **Current Testing Priorities**

#### 1. **Gate A Safety Validation**
- **Secrets Management**: Verify no plaintext credentials in repository
- **Database Access**: Test least-privilege user permissions
- **Backup Procedures**: Validate backup and restore functionality
- **Environment Configuration**: Confirm .env files properly configured

#### 2. **Migration Accuracy Testing**
- **Field Mapping Validation**: Ensure all CCK fields correctly mapped
- **Translation Handling**: Verify multi-language content relationships
- **URL Alias Extraction**: Test permalink sourcing from `url_alias` table
- **Data Integrity**: Validate 6,620 records migrate without loss

#### 3. **Content Validation Testing**
- **Record Count Verification**: Confirm all heavenletters migrated
- **Permalink Preservation**: Validate URLs exactly match Drupal aliases
- **Multi-language Support**: Test translation relationships maintained
- **Content Completeness**: Verify all fields populated correctly

## 🧪 **Migration Test Cases**

### Database Safety Tests
```sql
-- Test 1: Verify least-privilege user access
-- Execute as keystone user (should succeed)
SELECT COUNT(*) FROM ks_heavenletter;

-- Test 2: Verify Drupal tables protected
-- Execute as keystone user (should fail)
SELECT COUNT(*) FROM node;

-- Test 3: Verify backup integrity
-- Restore backup to staging and compare record counts
SELECT COUNT(*) FROM node WHERE type = 'heavenletter';
```

### Migration Accuracy Tests
```sql
-- Test 4: Field mapping validation
SELECT
  n.nid,
  n.title,
  cth.field_heavenletter__value as publishNumber,
  cpd.field_published_date_value as publishedOn,
  ua.dst as permalink
FROM node n
JOIN content_type_heavenletters cth ON n.vid = cth.vid
LEFT JOIN content_field_published_date cpd ON n.vid = cpd.vid
LEFT JOIN url_alias ua ON ua.src = CONCAT('node/', n.nid)
WHERE n.type = 'heavenletter' AND n.status = 1
LIMIT 5;
```

### Content Validation Tests
```sql
-- Test 5: Translation relationship validation
SELECT
  n.nid, n.tnid, n.language,
  ln.locale, ln.pid
FROM node n
LEFT JOIN localizernode ln ON n.nid = ln.nid
WHERE n.type = 'heavenletter' AND n.tnid IS NOT NULL
LIMIT 10;

-- Test 6: URL alias completeness
SELECT COUNT(*) as total_heavenletters,
       COUNT(ua.dst) as heavenletters_with_alias
FROM node n
LEFT JOIN url_alias ua ON ua.src = CONCAT('node/', n.nid)
WHERE n.type = 'heavenletter' AND n.status = 1;
```

## 📊 **Testing Metrics & Validation**

### Success Criteria
- **Data Safety**: ✅ Zero modifications to Drupal tables during testing
- **Record Accuracy**: ✅ All 6,620 heavenletters successfully processed
- **Permalink Preservation**: ✅ 100% of URLs sourced from `url_alias` table
- **Translation Integrity**: ✅ Multi-language relationships maintained
- **Performance Baseline**: ✅ Migration completes within acceptable time

### Risk Mitigation Tests
- **Rollback Testing**: Verify ability to revert to Drupal if needed
- **Concurrent Access**: Test migration with active Drupal site
- **Data Validation**: Automated checks for data consistency
- **Error Handling**: Validate graceful handling of edge cases

## 🔍 **Database Schema Validation**

### Drupal 5.x Structure Confirmed
- **Primary Tables**: `node`, `node_revisions`, `content_type_heavenletters`
- **CCK Fields**: `field_heavenletter__value`, `field_published_date_value`
- **Translation Tables**: `localizernode` with `tnid` relationships
- **URL Management**: `url_alias` table with `src`/`dst` mappings

### KeystoneJS Target Schema
```javascript
// ks_heavenletter table structure
{
  nid: Int,           // Drupal node ID
  tnid: Int,          // Translation set ID
  title: String,      // Heavenletter title
  body: String,       // Full content (from node_revisions.body)
  locale: String,     // Language code
  permalink: String,  // Canonical URL (from url_alias.dst)
  publishNumber: Int, // Heavenletter number (from CCK field)
  publishedOn: DateTime, // Publication date (from CCK field)
  writtenOn: DateTime,   // Written date (from CCK field)
}
```

## 🎯 **Next Testing Phases**

### Phase 2 Testing (Backend Setup)
1. **KeystoneJS Installation**: Verify installation and configuration
2. **Schema Generation**: Test Prisma schema creation and push
3. **Migration Script**: Validate sync script functionality
4. **GraphQL API**: Test queries and data retrieval

### Phase 3 Testing (Frontend Development)
1. **AstroJS Setup**: Verify static site generation
2. **Content Rendering**: Test heavenletter display components
3. **Search Functionality**: Validate content search and filtering
4. **Multi-language**: Test locale switching and translation display

### Phase 4 Testing (Integration & E2E)
1. **End-to-End Workflows**: Test complete user journeys
2. **Performance Testing**: Load testing and optimization validation
3. **Accessibility Testing**: WCAG compliance verification
4. **Cross-browser Testing**: Compatibility across browsers

## 🚨 **Critical Testing Requirements**

### Data Safety Validation
- **Read-Only Operations**: Confirm no Drupal tables modified during testing
- **Backup Verification**: Test restore procedures before migration
- **Rollback Capability**: Verify ability to revert if issues found

### Migration Accuracy Validation
- **Field Mapping**: Ensure all CCK fields correctly transferred
- **Translation Preservation**: Verify multi-language content maintained
- **URL Integrity**: Confirm permalinks exactly match Drupal aliases
- **Content Completeness**: Validate no data loss during migration

---

**Current Testing Phase**: Phase 0 - Safety Preflight validation
**Next Testing Phase**: Phase 2 - Backend setup and migration testing
**Overall Status**: 🔄 TESTING STRATEGY DEFINED - Ready for Gate A completion