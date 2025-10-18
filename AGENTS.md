# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Build/Lint/Test Commands

### Backend (Keystone.js)
```bash
cd backend
npm run dev          # Start development server on port 3000
npm run build        # Build for production
npm run start        # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:push      # Push schema to database
npm run prisma:migrate   # Run database migrations
```

### Legacy GraphQL API
```bash
cd graphql-api
npm start            # Start GraphQL server on port 4000
```

### Data Migration Scripts
```bash
# From project root (critical - working directory matters)
node scripts/sync-heavenletters.js

# Alternative: from backend directory
cd backend && node sync-heavenletters.js
```

## Code Style Guidelines

### TypeScript Configuration (Non-Obvious)
- **Strict Mode Disabled**: `backend/tsconfig.json` has `strict: false` for legacy compatibility
- **No Implicit Any**: `noImplicitAny: false` allows flexible typing with legacy code
- **CommonJS Modules**: `"module": "CommonJS"` despite modern tooling

### Database Schema Patterns
- **Custom Table Names**: Keystone uses `ks_` prefix (e.g., `ks_heavenletter`, `ks_user`)
- **Legacy Field Preservation**: Drupal CCK fields mapped with custom prefixes
- **Index Strategy**: Custom indexes on `locale` and `publishNumber` for performance

### Authentication & Security
- **Session-Based Auth**: Stateless sessions with 8-hour expiration
- **Role-Based Access**: Admin/Author/Translator permissions (currently disabled for testing)
- **Environment Secrets**: All credentials via `.env` files (see `backend/.env.sample`)

## Critical Non-Obvious Patterns

### Dual Database Architecture
- **Separate Connections**: Backend uses different Prisma clients for modern vs legacy data
- **Schema Mapping**: Complex field transformations between Drupal CCK and Keystone models
- **Migration Dependencies**: Sync scripts require specific database schemas and working directories

### Auth Implementation
- **Temporarily Disabled**: Auth wrapper commented out in `keystone.ts` for development
- **Session Configuration**: Custom 8-hour timeout, fallback secret generation
- **Permission Filters**: Complex access control logic with self-update capabilities

### GraphQL Schema Extensions
- **Commented Code**: Extended GraphQL schema code preserved but disabled in `keystone.ts`
- **Custom Resolvers**: Heavenletter search and retrieval logic (currently inactive)
- **Legacy Compatibility**: Drupal-style queries for backward compatibility

### Data Migration Gotchas
- **Working Directory Critical**: Scripts fail if not run from correct directory
- **Environment Variables**: Separate `DATABASE_URL` patterns for different components
- **Error Handling**: Custom retry logic and fallback mechanisms required

## Project-Specific Conventions

### File Organization
- **Multi-Root Structure**: Separate `backend/`, `graphql-api/`, `scripts/` directories
- **Configuration Patterns**: `.env.sample` files provide templates (never commit actual `.env`)
- **Documentation**: Extensive docs in `docs/` with specific formatting requirements

### Development Workflow
- **Independent Components**: Each service can run separately for development
- **Database First**: Schema changes require migration scripts and Prisma regeneration
- **Legacy Preservation**: Drupal 5.x data structure maintained for compatibility

## Hidden Dependencies & Coupling

### Component Interdependencies
- **Database Schema**: All components depend on consistent MySQL schema
- **Environment Variables**: Shared secrets across multiple services
- **Port Assignments**: Fixed ports (3000 backend, 4000 GraphQL API)

### Runtime Considerations
- **Memory Usage**: Large legacy dataset (64,510 nodes) requires optimization
- **Connection Pooling**: Prisma client configuration affects performance
- **Migration Timing**: Database operations can be time-intensive with large datasets

## Error Prevention Rules

### Database Operations
- Always check `DATABASE_URL` before running database commands
- Use `prisma:generate` after any schema changes
- Test migrations on development database before production

### Development Setup
- Install dependencies in each subdirectory (`backend/`, `graphql-api/`)
- Configure MySQL database before starting Keystone.js
- Verify port availability (3000, 4000) before starting services

### Code Changes
- Preserve commented auth code for future re-enablement
- Maintain legacy GraphQL schema compatibility
- Update migration scripts when schema changes occur