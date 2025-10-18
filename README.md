# Heaven Letters Next Stack

A modern web application for accessing and managing Heaven Letters content, featuring a three-tier architecture with legacy Drupal data migration.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend        │    │   Database      │
│   (Planned)     │◄──►│   Keystone.js    │◄──►│   MySQL         │
│   Next.js       │    │   CMS/GraphQL    │    │   (Legacy       │
│                 │    │   TypeScript     │    │    Drupal 5.x)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   GraphQL API   │
                       │   Node.js/Express│
                       │   (Legacy Access)│
                       └─────────────────┘
```

## Components

### Backend (TypeScript/Keystone.js)
- **Location**: `backend/`
- **Framework**: Keystone.js CMS with GraphQL
- **Database**: Prisma ORM with MySQL
- **Features**:
  - Modern CMS interface for managing Heaven Letters
  - User authentication and authorization
  - Multi-tenant content management
  - RESTful and GraphQL APIs

### Legacy GraphQL API
- **Location**: `graphql-api/`
- **Purpose**: Access to migrated Drupal 5.x content
- **Features**:
  - Drupal-compatible GraphQL schema
  - Heavenletter content retrieval
  - Translation support
  - Pagination and filtering

### Data Migration Scripts
- **Location**: `scripts/`
- **Purpose**: Migrate legacy Drupal content to modern schema
- **Features**:
  - Automated data transformation
  - Incremental sync capabilities
  - Error handling and recovery

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Database Setup
1. Create a MySQL database named `heaven`
2. Set up environment variables (see `backend/.env.sample`)
3. Run database migrations:
   ```bash
   cd backend
   npm run prisma:migrate
   npm run prisma:generate
   ```

### Backend Development
```bash
cd backend
npm install
npm run dev
```
Access at: http://localhost:3000

### Legacy GraphQL API
```bash
cd graphql-api
npm install
npm start
```
Access at: http://localhost:4000/graphql

## Key Features

### Content Management
- **Heaven Letters**: Spiritual messages with multi-language support
- **User Management**: Admin, author, and translator roles
- **Publishing Workflow**: Draft → Published status management
- **Localization**: Support for multiple languages (en, es, fr, etc.)

### Data Architecture
- **Modern Schema**: Clean Keystone.js models
- **Legacy Compatibility**: Drupal 5.x data structure preservation
- **Migration Tools**: Automated content transformation
- **Indexing**: Optimized database queries with custom indexes

### API Capabilities
- **GraphQL Endpoints**: Modern and legacy API access
- **RESTful APIs**: Traditional HTTP endpoints
- **Authentication**: Session-based auth with role permissions
- **Content Queries**: Advanced filtering and search

## Development Notes

### Non-Obvious Patterns
- **Dual Database Connections**: Backend uses separate connections for Keystone (modern) and legacy data access
- **Auth Temporarily Disabled**: Authentication commented out in `backend/keystone.ts` for testing
- **Custom Sync Scripts**: Data migration requires specific working directories and environment setup
- **TypeScript Strict Mode Disabled**: `backend/tsconfig.json` has relaxed type checking for legacy compatibility

### Critical Gotchas
- **Environment Variables**: Both `DATABASE_URL` and custom env vars required
- **Working Directory**: Migration scripts must run from `scripts/` directory
- **Schema Mapping**: Complex field mapping between Drupal CCK and Keystone models
- **Port Configuration**: Backend runs on port 3000, legacy API on 4000

## Documentation

- [API Documentation](docs/API_DOCUMENTATION.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Project Specifications](docs/PROJECT_SPECIFICATIONS.md)
- [Database Migration Guide](docs/db_migration_mapping.md)

## Scripts

### Backend Commands
```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run prisma:generate    # Generate Prisma client
npm run prisma:push        # Push schema to database
npm run prisma:migrate     # Run migrations
```

### Data Migration
```bash
# From project root
node scripts/sync-heavenletters.js

# Or from backend directory
node sync-heavenletters.js
```

## Contributing

1. Ensure all components can run independently
2. Test both modern and legacy data paths
3. Update documentation for any schema changes
4. Follow the established project patterns

## Tech Stack

- **Backend**: Keystone.js, TypeScript, Prisma, GraphQL
- **Database**: MySQL 8.0+
- **Legacy API**: Node.js, Express, GraphQL
- **Migration Tools**: Custom JavaScript scripts
- **Development**: npm workspaces, ESLint, TypeScript