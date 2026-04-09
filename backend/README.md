# Personal Expense Tracker Backend

Production-ready Express + Supabase (Postgres) backend for the Personal Expense Tracker app.

## Tech Stack

- Node.js
- Express.js
- Supabase Postgres
- JWT (access + refresh)
- bcrypt
- Zod validation

## Features Included

- Authentication (`register`, `login`, `refresh`, `logout`)
- User profile and password update
- Categories CRUD
- Accounts CRUD
- Transactions CRUD with account balance updates
- Monthly budgets (`upsert`, list, delete) with computed spend/remaining/progress
- Reports (summary, category breakdown, monthly trend)
- CSV transaction export endpoint
- Recurring rules CRUD
- Security middleware (`helmet`, `cors`, `rate-limit`, `hpp`)
- Centralized error handling

## Project Structure

```bash
backend/
  src/
    config/
    common/
      middleware/
      utils/
      validators/
    modules/
      auth/
      users/
      categories/
      accounts/
      transactions/
      budgets/
      reports/
      recurring/
    jobs/
    app.js
    routes.js
    server.js
  .env.example
  package.json
```

## Setup Instructions

1. Install dependencies:

```bash
cd backend
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Create your Supabase project and run SQL schema:

- Open Supabase SQL Editor.
- Run [supabase/schema.sql](supabase/schema.sql).
- Copy `Project URL` and `service_role` key from Project Settings → API.

4. Update `.env` values with Supabase and JWT secrets.

5. Start development server:

```bash
npm run dev
```

6. Health check:

```bash
GET http://localhost:5000/health
```

## API Base URL

- `http://localhost:5000/api/v1`

## Auth Notes

- Access token: returned in JSON response
- Refresh token: stored in HTTP-only cookie
- Protected routes require `Authorization: Bearer <accessToken>`

## Main Endpoints

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

### Users
- `GET /users/me`
- `PATCH /users/me`
- `PATCH /users/me/password`

### Categories
- `GET /categories`
- `POST /categories`
- `PATCH /categories/:id`
- `DELETE /categories/:id`

### Accounts
- `GET /accounts`
- `POST /accounts`
- `PATCH /accounts/:id`
- `DELETE /accounts/:id`

### Transactions
- `GET /transactions`
- `POST /transactions`
- `GET /transactions/:id`
- `PATCH /transactions/:id`
- `DELETE /transactions/:id`

### Budgets
- `GET /budgets?month=YYYY-MM`
- `PUT /budgets/:categoryId?month=YYYY-MM`
- `DELETE /budgets/:id`

### Reports
- `GET /reports/summary?from=<ISO>&to=<ISO>`
- `GET /reports/category-breakdown?from=<ISO>&to=<ISO>`
- `GET /reports/monthly-trend?months=12`

### Exports
- `GET /exports/transactions/csv?from=<ISO>&to=<ISO>&type=<expense|income>&accountId=<id>&categoryId=<id>`

### Recurring Rules
- `GET /recurring-rules`
- `POST /recurring-rules`
- `PATCH /recurring-rules/:id`
- `DELETE /recurring-rules/:id`

## Security Practices Applied

- Password hashing with bcrypt (`12` salt rounds)
- JWT access and refresh separation
- Refresh token hashing in DB
- HTTP-only refresh cookies
- Input validation with Zod
- Rate limiting for API
- Security headers with Helmet

## Next Step

Backend is integrated with the frontend app and ready to run in monorepo mode from the project root.
