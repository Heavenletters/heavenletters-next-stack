# Tech Context: Heavenletters Migration

## Technology Stack

### Backend
-   **Framework**: KeystoneJS 6 (Headless CMS)
-   **ORM**: Prisma (with `ks_` table prefix)
-   **Database**: MySQL (hosted at 192.168.8.103:3306)
-   **Language**: TypeScript (Node.js)
-   **API**: GraphQL

### Frontend
-   **Framework**: AstroJS (Static Site Generator)
-   **Styling**: Tailwind CSS
-   **Content**: MDX
-   **Data Source**: KeystoneJS GraphQL API (consumed at build time)

### Migration Scripts
-   **Language**: JavaScript/Node.js
-   **Dependencies**: `mysql2` (for direct Drupal access), `prisma` (for Keystone access)
-   **Execution**: Run from project root or `backend/` directory

## Development Setup

### Prerequisites
-   Node.js (v18+ recommended)
-   npm
-   Access to the remote MySQL database (192.168.8.103:3306)

### Environment Variables
**WARNING**: Never commit `.env` files. Use `.env.sample` as a template.

#### `backend/.env`
```env
# Database connection string for KeystoneJS
# Must point to the remote MySQL server
DATABASE_URL="mysql://<user>:<password>@192.168.8.103:3306/heaven"

# Session secret (min 32 chars)
SESSION_SECRET="...generated_secret..."
```

### Development Workflow
1.  **Backend Start**:
    ```bash
    cd backend
    npm install
    npm run dev
    # accessible at http://localhost:3000
    ```
2.  **Frontend Start**:
    ```bash
    cd frontend
    npm install
    npm run dev
    # accessible at http://localhost:4321
    ```
3.  **GraphQL Playground**: Available at `http://localhost:3000/api/graphql`

## Constraints & Rules
-   **Ports**: Backend must run on port 3000. GraphQL API (Legacy) on port 4000.
-   **Database**: All local development connects to the **remote** database (192.168.8.103). There is no local database container.
-   **Safety**: Always verify `DATABASE_URL` before running migrations (`npm run prisma:migrate` or `npm run prisma:push`).
-   **Directory**: Run migration scripts from the correct directory to avoid path resolution errors.