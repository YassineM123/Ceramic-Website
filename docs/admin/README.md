# Admin Dashboard

Vite admin dashboard inside the monorepo. It uses the shared root `backend/` API.

## Requirements

- Node.js 18 or newer
- npm

## Quick start

```bash
npm install
npm run dev
```

`npm run dev` starts the storefront, admin dashboard, and backend:

- Storefront: `http://localhost:5173`
- Admin dashboard: `http://localhost:5174/admin/login`
- Shared API: `http://localhost:4000`

## Run services separately

Admin only:

```bash
npm run dev:admin
```

Backend only:

```bash
npm run dev:backend
```

## Build frontend

```bash
npm run build:admin
```

## Documentation

- Backend setup and API routes: `../../backend/README.md`
- Project guidelines: `guidelines/Guidelines.md`
