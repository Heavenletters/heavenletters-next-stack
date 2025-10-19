# Heavenletters Migration Project - Technical Specifications

## 📋 **Project Overview**
This document provides comprehensive specifications for the Heavenletters migration project, which involves migrating from Drupal 5.x to a modern KeystoneJS + AstroJS stack while preserving all content, SEO permalinks, and multi-language support.

## 🎯 **Current Status Summary**
- **Project Phase**: Phase 0 (Safety Preflight) - In Progress
- **Database Connection**: ✅ Established (192.168.8.103:3306)
- **Secrets Management**: 🔄 In progress - credential rotation and .env setup
- **Database Safety**: 🔄 In progress - least-privilege user and backup verification
- **Migration Planning**: ✅ Complete - KeystoneJS + AstroJS architecture finalized

## 🔧 **Technical Architecture**

### Migration Architecture
```
Drupal 5.x (Source) → Read-Only Sync → KeystoneJS (ks_* tables)
                                                           ↓
KeystoneJS GraphQL API ←→ AstroJS Frontend (Static Site)
                                                           ↓
Production Deployment (Netlify/Vercel + Railway)
```

### Database Schema Strategy
- **Source Database**: Drupal 5.x (preserved untouched)
- **Target Database**: New KeystoneJS tables with `ks_` prefix
- **Migration Method**: Read-only sync from Drupal to KeystoneJS
- **Data Preservation**: Zero modifications to existing Drupal schema

### Technology Stack
- **Backend**: KeystoneJS 6 with Prisma ORM (`ks_heavenletter` table)
- **Frontend**: AstroJS with Tailwind CSS and static generation
- **Database**: MySQL (192.168.8.103:3306) - dual schema approach
- **Development**: Remote database connections for all environments

## 📝 **Detailed Task Breakdown**

### Phase 0: Safety Preflight (Current)
**Priority**: CRITICAL - Must be completed first

1. **Secrets Management**
    - Remove plaintext credentials from documentation
    - Create .env.sample files for all components
    - Establish secrets policy and rotation procedures

2. **Database Safety Setup**
    - Rotate database passwords and update environment variables
    - Create least-privilege MySQL user for KeystoneJS
    - Configure access restricted to `ks_*` tables only

3. **Backup & Verification**
    - Take fresh backup of Drupal database
    - Verify restore procedures on staging environment
    - Document backup verification results

### Phase 2: Backend Setup (Next)
**Priority**: HIGH - Core migration functionality

1. **KeystoneJS Installation**
    - Install KeystoneJS 6 in backend directory
    - Configure MySQL connection to remote database
    - Set up Prisma schema with `ks_heavenletter` table

2. **Data Migration Script**
    - Build read-only sync script from Drupal to KeystoneJS
    - Implement proper field mapping from CCK tables
    - Handle translation relationships and URL aliases

3. **GraphQL API Development**
    - Create queries for heavenletters by permalink
    - Implement locale-based filtering and pagination
    - Test CRUD operations on new `ks_*` tables

### Phase 3: Frontend Development
**Priority**: HIGH - User-facing functionality

1. **AstroJS Setup**
    - Initialize AstroJS project with Tailwind CSS
    - Configure static generation with dynamic routes
    - Set up MDX support for content rendering

2. **Component Development**
    - Build content display components
    - Implement search and language selection
    - Create responsive, accessible UI

3. **Static Generation**
    - Generate pages from KeystoneJS permalinks
    - Implement RSS feeds per language
    - Set up social meta tags and SEO

### Phase 4: Integration & Testing
**Priority**: CRITICAL - Quality assurance

1. **End-to-End Integration**
    - Connect AstroJS frontend to KeystoneJS GraphQL
    - Test content loading and search functionality
    - Verify multi-language support

2. **Content Validation**
    - Validate all 6,620 heavenletters migrated correctly
    - Confirm permalink preservation from Drupal
    - Test translation relationships and locale handling

3. **Performance & Quality**
    - Load testing and performance optimization
    - Accessibility compliance (WCAG)
    - Cross-browser compatibility testing

### Phase 5: Deployment & Launch
**Priority**: HIGH - Go-live preparation

1. **Production Infrastructure**
    - Deploy KeystoneJS backend to production hosting
    - Configure AstroJS static site deployment
    - Set up monitoring and error tracking

2. **Final Migration**
    - Execute complete data sync to production
    - Verify all content and permalinks
    - Test search and navigation functionality

3. **Go-Live**
    - DNS cutover and redirect setup
    - Final content and SEO validation
    - Post-launch monitoring and support

## 🧪 **Migration Validation Requirements**

### Content Migration Testing
1. **Record Count Validation**
    - Verify all 6,620 heavenletters migrated successfully
    - Confirm translation relationships preserved
    - Validate multi-language content integrity

2. **Field Mapping Validation**
    ```sql
    -- Test permalink preservation
    SELECT COUNT(*) FROM ks_heavenletter WHERE permalink IS NOT NULL;

    -- Test publish number mapping
    SELECT COUNT(*) FROM ks_heavenletter WHERE publishNumber > 0;

    -- Test locale distribution
    SELECT locale, COUNT(*) FROM ks_heavenletter GROUP BY locale;
    ```

3. **URL Alias Validation**
    ```sql
    -- Verify all permalinks sourced from Drupal url_alias
    SELECT DISTINCT permalink FROM ks_heavenletter
    WHERE permalink NOT IN (
      SELECT dst FROM drupal_url_alias WHERE src LIKE 'node/%'
    );
    ```

## 🚨 **Critical Path & Risk Management**

### Current Blocking Issues
1. **Gate A Completion Required**
    - Secrets management and database safety setup must be completed
    - Least-privilege user creation is blocking KeystoneJS installation
    - Backup verification required before proceeding

2. **Database Schema Dependencies**
    - Correct field mapping from Drupal CCK tables must be validated
    - Translation relationship handling needs verification
    - URL alias extraction logic must be confirmed

3. **Migration Script Development**
    - Read-only sync script needs to handle all field mappings correctly
    - Error handling for data inconsistencies required
    - Performance optimization for large dataset (6,620 records)

## 📊 **Success Criteria**

### Phase 0 Success Criteria (Current)
- [ ] Secrets removed from repository and .env files configured
- [ ] Database credentials rotated and least-privilege user operational
- [ ] Fresh backup taken and restore verification completed
- [ ] Gate A approved for Phase 2 transition

### Overall Migration Success Criteria
- [ ] All 6,620 heavenletters successfully migrated to KeystoneJS
- [ ] All permalinks exactly preserved from Drupal url_alias table
- [ ] Multi-language content and translations properly maintained
- [ ] SEO rankings preserved or improved post-migration
- [ ] Performance improved over Drupal 5.x baseline

## 🔄 **Next Phase Transition**

### Phase 0 to Phase 2 Handoff Requirements
1. **Gate A Approval**:
    - Complete secrets sanitization and rotation
    - Verify least-privilege database user functionality
    - Confirm backup and restore procedures

2. **Technical Readiness**:
    - Database schema analysis completed
    - Field mapping validated against Drupal CCK structure
    - Migration script architecture designed

3. **Documentation Updates**:
    - Update TODO.md with Phase 2 task breakdown
    - Ensure all documentation aligns with current roadmap
    - Document any schema discoveries or field mapping corrections

### Critical Success Path
```
Gate A Completion → KeystoneJS Installation → Schema Design → Migration Script → GraphQL API
```

## 📁 **Project Structure**
```
heavenletters-next-stack/
├── backend/               # KeystoneJS application
│   ├── keystone.ts       # Main application config
│   ├── schema.ts         # GraphQL schema definition
│   └── sync-heavenletters.js # Migration script
├── frontend/             # AstroJS static site (planned)
├── docs/                 # Project documentation
│   ├── PROJECT_ROADMAP.md    # Current roadmap
│   ├── TODO.md              # Task tracking
│   ├── URL_SPEC.md          # URL strategy
│   └── CURRENT_STATUS.md    # Current status
└── scripts/              # Utility scripts
```

## 🎯 **Immediate Next Steps**

1. **Complete Phase 0**: Finish Gate A safety requirements
2. **Initiate Phase 2**: Begin KeystoneJS installation once Gate A approved
3. **Schema Development**: Design and validate ks_heavenletter schema
4. **Migration Testing**: Test sync script with sample data
5. **Documentation**: Maintain current status and progress tracking

---

**Next Action**: Complete Gate A (Safety Preflight) requirements before proceeding to Phase 2 (Backend Setup).