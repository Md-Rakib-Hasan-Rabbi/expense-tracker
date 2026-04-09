# Personal Expense Tracker Frontend

React + Tailwind frontend for the Personal Expense Tracker.

## Tech

- React (Vite)
- Tailwind CSS v4
- React Router
- Axios
- Recharts

## Features Implemented

- Responsive sidebar dashboard layout
- Protected routes with auth guard
- Public route guard for login/register
- Authentication pages (Login/Register)
- Dashboard page with KPI + charts
- Transactions page (CRUD + filters + pagination)
- Categories page (CRUD)
- Accounts page (CRUD)
- Budgets page (monthly budget control)
- Reports page (summary + category + trend)
- Reports CSV export integration
- Settings page (profile + password)
- Custom animated UI effects (`auroraShift`, `prismFloat`, `cometSweep`, `meshPulse`)

## Folder Structure

```bash
frontend/
  src/
    app/
      router.jsx
      ProtectedRoute.jsx
    components/
      common/
      layout/
      charts/
    context/
      AuthContext.jsx
      AppStateContext.jsx
      useAuth.js
      useAppState.js
    pages/
      AuthLayout.jsx
      LoginPage.jsx
      RegisterPage.jsx
      DashboardPage.jsx
      TransactionsPage.jsx
      CategoriesPage.jsx
      AccountsPage.jsx
      BudgetsPage.jsx
      ReportsPage.jsx
      SettingsPage.jsx
      NotFoundPage.jsx
    services/
      apiClient.js
      authApi.js
      resourceApi.js
      tokenStorage.js
    utils/
      apiError.js
      formatters.js
    index.css
    main.jsx
  .env.example
  package.json
```

## Environment

Create `.env` from `.env.example`:

```bash
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Run

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Build Check

```bash
npm run build
```

Build is currently passing.
