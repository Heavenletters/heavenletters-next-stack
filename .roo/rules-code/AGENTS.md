# Project Coding Rules (Non-Obvious Only)

## Database Schema Patterns
- **Custom Table Names**: Keystone uses `ks_` prefix (e.g., `ks_heavenletter`, `ks_user`) - not standard Prisma naming
- **Legacy Field Preservation**: Drupal CCK fields mapped with custom prefixes in schema.prisma
- **Index Strategy**: Custom indexes on `locale` and `publishNumber` are performance-critical for queries

## TypeScript Configuration (Non-Obvious)
- **Strict Mode Disabled**: `backend/tsconfig.json` has `strict: false` for legacy compatibility - don't enable without testing
- **No Implicit Any**: `noImplicitAny: false` allows flexible typing with legacy code - changing this breaks existing patterns
- **CommonJS Modules**: `"module": "CommonJS"` despite modern tooling - required for Keystone.js compatibility

## Dual Database Architecture
- **Separate Connections**: Backend uses different Prisma clients for modern vs legacy data - don't consolidate
- **Schema Mapping**: Complex field transformations between Drupal CCK and Keystone models - preserve existing mappings
- **Migration Dependencies**: Sync scripts require specific database schemas and working directories - don't modify without testing

## Authentication Implementation
- **Temporarily Disabled**: Auth wrapper commented out in `keystone.ts` for development - preserve commented code
- **Session Configuration**: Custom 8-hour timeout, fallback secret generation - don't change without understanding impact
- **Permission Filters**: Complex access control logic with self-update capabilities - test thoroughly before modifying

## GraphQL Schema Extensions
- **Commented Code**: Extended GraphQL schema code preserved but disabled in `keystone.ts` - don't delete
- **Custom Resolvers**: Heavenletter search and retrieval logic (currently inactive) - preserve for future activation
- **Legacy Compatibility**: Drupal-style queries maintained for backward compatibility - don't break existing patterns

## Data Migration Scripts
- **Working Directory Critical**: Scripts fail if not run from correct directory - always verify cwd before execution
- **Environment Variables**: Separate `DATABASE_URL` patterns for different components - don't standardize
- **Error Handling**: Custom retry logic and fallback mechanisms required - don't simplify without testing

## Component Coupling
- **Hidden Dependencies**: Database schema changes affect all components - test across all services
- **Environment Variables**: Shared secrets across multiple services - maintain consistency
- **Port Assignments**: Fixed ports (3000 backend, 4000 GraphQL API) - don't change without coordination

## Error Prevention
- **Preserve Auth Code**: Commented auth code must be maintained for future re-enablement
- **Legacy Compatibility**: GraphQL schema compatibility must be maintained
- **Migration Scripts**: Update when schema changes occur - never skip this step