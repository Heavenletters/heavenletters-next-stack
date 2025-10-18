# Project Documentation Rules (Non-Obvious Only)

## Legacy Data Structure Context
- **Drupal 5.x Schema**: 64,510 nodes with CCK fields - understand before querying `content_type_heavenletters`
- **Localization Tables**: `localizernode` and `locale` tables drive multi-language content - not obvious from file structure
- **URL Aliases**: `url_alias` table maps Drupal paths to node IDs - critical for permalink resolution

## Component Architecture Questions
- **Multi-Service Setup**: Three independent services (backend, graphql-api, scripts) - each requires separate dependency installation
- **Database Dual Access**: Keystone uses modern schema while legacy API reads Drupal tables directly
- **Migration Dependencies**: Scripts transform between schemas - understand both data models before debugging

## Configuration Patterns
- **Environment Variables**: Multiple `.env` patterns across services - don't assume shared configs
- **Working Directory Sensitivity**: Scripts fail when run from wrong directory - always verify cwd
- **Port Assignments**: Fixed ports (3000, 4000) across services - conflicts indicate service overlap

## Code Organization Questions
- **TypeScript Config**: `strict: false` in `backend/tsconfig.json` - intentional for legacy compatibility, not oversight
- **Auth State**: Commented out authentication in `keystone.ts` - temporary for development, not broken
- **Schema Extensions**: Commented GraphQL resolvers - preserved for future activation, not dead code

## Development Workflow Context
- **Independent Services**: Each component runs separately - start/stop individually for testing
- **Database First**: Schema changes drive all services - migration scripts mandatory after changes
- **Legacy Preservation**: Drupal 5.x structure maintained - understand both old and new data models

## Hidden Technical Debt
- **Migration Script Coupling**: Schema changes break sync scripts - test data migration after any model changes
- **Environment Dependencies**: Services share database but use different connection patterns
- **Memory Constraints**: Large dataset (64,510 nodes) affects all services - pagination critical