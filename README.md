# Personal Expense Tracker (Full Stack)

A full-stack personal expense tracker with React frontend and Express + Supabase Postgres backend.

## Tech Stack

- Frontend: React, Tailwind CSS, React Router, Axios, Recharts
- Backend: Node.js, Express, Supabase Postgres, JWT, bcrypt, Zod

## Monorepo Structure

```bash
expense-tracker/
  backend/
  frontend/
  package.json
```

## Final Run Instructions

1. Install root dependencies:

```bash
npm install
```

2. Install backend/frontend dependencies (if needed):

```bash
npm install --prefix backend
npm install --prefix frontend
```

3. Configure environment files:

```bash
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

4. Configure Supabase project and database schema (see backend README for SQL setup).

5. Start full stack from root:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API base: http://localhost:5000/api/v1

## Final Environment Variables

### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=5000
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLIENT_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
JWT_ACCESS_SECRET=replace_with_a_long_random_secret
JWT_REFRESH_SECRET=replace_with_a_long_random_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
REFRESH_COOKIE_NAME=refreshToken
REFRESH_COOKIE_MAX_AGE_MS=604800000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Integration Coverage Completed

- Frontend API calls aligned with backend routes
- Auth flow fixed (access token + refresh-cookie bootstrap + guards)
- Protected and public-only routing fixed
- Dashboard fetching + chart mapping fixed
- Forms validation and CRUD flows fixed
- Budget calculations integrated (`spent`, `remaining`, `progress`)
- Reports logic and date range mapping fixed
- Export route integration completed (`/exports/transactions/csv`)

## Useful Commands

```bash
npm run dev              # full stack (root)
npm run dev:backend      # backend only
npm run dev:frontend     # frontend only
npm run build --prefix frontend
```

## Possible Improvements

1. Add refresh token rotation with device/session management UI.
2. Add server-side pagination/sorting controls to categories/accounts/budgets.
3. Add CSV import pipeline with validation preview and rollback on errors.
4. Add test coverage (unit + integration + e2e).
5. Add role-based access and audit logs.
6. Add Docker Compose for API + Web one-command startup.
7. Add code splitting and lazy route loading for smaller frontend bundle.
8. Add observability (structured logs, tracing, metrics dashboards).
