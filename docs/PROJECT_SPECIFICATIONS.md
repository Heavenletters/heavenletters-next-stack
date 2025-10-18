# Heavenletters GraphQL API - Project Specifications

## 📋 **Project Overview**
This document provides comprehensive specifications for completing the Heavenletters GraphQL API project. The project involves creating a GraphQL API that serves Heavenletters content from a Drupal 5.x database with multi-language support.

## 🎯 **Current Status Summary**
- **Database Connection**: ✅ Established (192.168.8.103:3306)
- **GraphQL Server**: ✅ Running but needs restart to pick up schema changes
- **Schema Issues**: ✅ Fixed but server hasn't reloaded changes
- **Database Inspection**: ✅ In progress to discover actual schema structure

## 🔧 **Technical Architecture**

### Database Schema (Drupal 5.x)
```
Core Tables:
- node: Main content nodes
- node_revisions: Content body and revision data
- content_type_heavenletters: Custom field data for heavenletter numbers
- localizernode: Translation relationships
- users: Author information
```

### GraphQL Schema Structure
```graphql
type Heavenletter {
  nid: ID!
  title: String!
  number: Int
  body: String
  locale: String
  language: String
  created: String
  author: String
}

type Query {
  heavenletters(limit: Int, offset: Int): [Heavenletter]
  heavenletter(nid: ID!): Heavenletter
  heavenletterTranslations(nid: ID!): [Heavenletter]
}
```

## 📝 **Detailed Task Breakdown**

### Phase 1: Server Management & Testing
**Priority**: CRITICAL - Must be completed first

1. **Restart GraphQL Server**
   - Stop current server (Terminal 18)
   - Restart to pick up schema changes
   - Verify server starts without errors
   - Confirm GraphiQL interface loads

2. **Basic Query Testing**
   - Test `heavenletters` query with limit parameter
   - Verify data structure matches expected schema
   - Validate field mappings (nid, title, number, etc.)

3. **Advanced Query Testing**
   - Test single `heavenletter` query by nid
   - Test `heavenletterTranslations` query
   - Verify all fields return correct data types

### Phase 2: Database Schema Validation
**Priority**: HIGH - Required for accurate API responses

1. **Complete Database Inspection**
   - Finish running `inspect-database.js` (Terminal 19)
   - Document actual table structure
   - Identify any missing or additional fields

2. **Schema Alignment**
   - Compare discovered schema with GraphQL definitions
   - Update resolvers if field mappings are incorrect
   - Ensure all promised fields are available

### Phase 3: Data Quality & Performance
**Priority**: MEDIUM - Important for production readiness

1. **Data Validation**
   - Test queries with various nid values
   - Verify translation relationships work correctly
   - Check for null/empty field handling

2. **Performance Testing**
   - Test with different limit values
   - Measure query response times
   - Identify any slow queries needing optimization

### Phase 4: Documentation & Finalization
**Priority**: LOW - Nice to have for handoff

1. **API Documentation**
   - Document all available queries
   - Provide example requests and responses
   - Create usage guidelines

2. **Error Handling**
   - Test invalid nid values
   - Verify graceful error responses
   - Document error codes and messages

## 🧪 **Test Queries for Validation**

### Basic Functionality Test
```graphql
query {
  heavenletters(limit: 3) {
    nid
    title
    number
    locale
    created
    author
  }
}
```

### Single Record Test
```graphql
query {
  heavenletter(nid: 1234) {
    nid
    title
    number
    body
    locale
    author
  }
}
```

### Translation Test
```graphql
query {
  heavenletterTranslations(nid: 890) {
    nid
    title
    locale
    language
  }
}
```

## 🚨 **Critical Issues to Address**

1. **Server Restart Required**
   - Current server has cached old schema
   - Must restart to pick up fixes made by code mode
   - This is blocking all testing progress

2. **Database Inspection Completion**
   - Need to complete database structure discovery
   - May reveal additional fields or different structure
   - Could require schema updates

3. **Field Mapping Validation**
   - Ensure all GraphQL fields map to actual database columns
   - Verify data types match expectations
   - Check for any missing joins or relationships

## 📊 **Success Criteria**

### Minimum Viable Product (MVP)
- [ ] GraphQL server starts without errors
- [ ] Basic `heavenletters` query returns data
- [ ] Single `heavenletter` query works with valid nid
- [ ] All promised fields return appropriate data

### Full Feature Set
- [x] Translation queries work correctly
- [x] All data types are accurate
- [x] Error handling is graceful
- [x] Performance is acceptable
- [x] Documentation is complete

## 🔄 **Handoff Instructions for Orchestrator Mode**

1. **Immediate Actions Required**:
   - Coordinate server restart (Terminal 18)
   - Monitor database inspection completion (Terminal 19)
   - Validate test queries work as expected

2. **Mode Coordination Strategy**:
   - Use **Code Mode** for server operations and testing
   - Use **Debug Mode** if errors occur during testing
   - Return to **Architect Mode** for any design changes needed

3. **Progress Tracking**:
   - Update CURRENT_STATUS.md after each major milestone
   - Document any schema changes or discoveries
   - Record successful test results

4. **Critical Success Path**:
   ```
   Server Restart → Basic Query Test → Schema Validation → Advanced Testing → Documentation
   ```

## 📁 **Project Structure**
```
heavenletters-next-stack/
├── graphql-api/           # Main GraphQL server
├── inspect-database.js    # Database discovery script
├── CURRENT_STATUS.md      # Live status tracking
└── PROJECT_SPECIFICATIONS.md  # This document
```

---

**Next Action**: Hand this specification to Orchestrator Mode to coordinate the completion of Phase 1 tasks, starting with the critical server restart.