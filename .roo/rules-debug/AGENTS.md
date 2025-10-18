# Project Debug Rules (Non-Obvious Only)

## Legacy Data Access Patterns
- **Working Directory Critical**: Data migration scripts must run from `scripts/` directory, not root
- **Database Connection Patterns**: Separate `DATABASE_URL` formats for Keystone vs legacy access
- **Schema Mapping Complexity**: Drupal CCK fields transform unpredictably - verify data integrity after sync

## Authentication Debugging
- **Commented Auth Code**: Session configuration in `keystone.ts` is disabled - uncomment for testing auth flows
- **Environment Variables**: Missing `KEYSTONE_SECRET` causes silent auth failures
- **Role Permissions**: Self-update logic bypasses normal admin checks - verify in debug mode

## GraphQL Schema Issues
- **Extended Schema Inactive**: Custom resolvers in `keystone.ts` are commented out - enable for debugging queries
- **Legacy Compatibility**: Drupal-style queries fail silently if schema extensions disabled
- **Resolver Context**: Missing `context.query` methods cause null returns in custom resolvers

## Database Operation Gotchas
- **Prisma Client Generation**: Schema changes require `prisma:generate` before debugging database operations
- **Migration State**: Failed sync scripts leave inconsistent data - check migration logs first
- **Connection Pooling**: Large datasets (64,510 nodes) exhaust default Prisma connection limits

## Environment-Specific Debugging
- **Port Conflicts**: Backend (3000) and GraphQL API (4000) must both be available
- **Memory Usage**: Large legacy dataset causes OOM errors without proper pagination
- **TypeScript Strict Mode**: Disabled strict checking masks type-related runtime errors

## Component Interaction Issues
- **Cross-Service Dependencies**: Database schema changes affect both Keystone and legacy GraphQL API
- **Environment Consistency**: Different `DATABASE_URL` patterns across services cause connection failures
- **Migration Timing**: Database operations block other services during large data syncs