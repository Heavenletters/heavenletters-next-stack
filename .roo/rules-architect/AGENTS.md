# Project Architecture Rules (Non-Obvious Only)

## Component Architecture Constraints
- **Independent Services**: Three separate services (backend, graphql-api, scripts) - must coordinate schema changes across all
- **Database Coupling**: Shared MySQL database with different access patterns - schema changes affect all services
- **Working Directory Requirements**: Migration scripts fail when run from incorrect directories

## Data Flow Architecture
- **Legacy Data Path**: Direct SQL queries to Drupal tables in `graphql-api/` - bypasses Keystone ORM
- **Modern Data Path**: Keystone.js manages `ks_` prefixed tables - uses Prisma ORM
- **Migration Bridge**: Custom scripts transform between data models - single point of failure

## Schema Architecture Decisions
- **Dual Schema Maintenance**: Both Drupal 5.x and Keystone schemas active - complex field mappings required
- **Table Prefix Strategy**: `ks_` prefix for modern tables - deviates from Prisma conventions
- **Index Optimization**: Custom indexes on `locale` and `publishNumber` - performance-critical for queries

## Authentication Architecture
- **Temporarily Disabled**: Auth system commented out in production code - preserved for future activation
- **Session-Based Design**: 8-hour stateless sessions with custom secret handling
- **Role-Based Permissions**: Complex self-update logic bypasses standard admin checks

## GraphQL Architecture Extensions
- **Schema Extensions Inactive**: Custom resolvers commented out - preserved for future functionality
- **Legacy Compatibility Layer**: Drupal-style queries maintained alongside modern GraphQL
- **Resolver Context Dependencies**: Custom logic requires specific Keystone context methods

## Development Architecture Patterns
- **Environment Segregation**: Different `DATABASE_URL` patterns per service - prevents standardization
- **Port Assignment Fixed**: Hardcoded ports (3000, 4000) across services - no dynamic allocation
- **Dependency Isolation**: Each service has independent package.json - coordinated updates required

## Performance Architecture Considerations
- **Large Dataset Handling**: 64,510 legacy nodes require pagination and memory optimization
- **Connection Pooling**: Prisma client configuration affects cross-service performance
- **Migration Timing**: Database operations block other services during large data syncs

## Error Handling Architecture
- **Migration Failure Points**: Data transformation scripts are single points of failure
- **Environment Inconsistency**: Different connection patterns cause silent failures
- **Legacy Compatibility Breaking**: Schema changes risk breaking existing GraphQL queries