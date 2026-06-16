# Agile Project

Monorepo containing a Next.js frontend and a Node/TypeScript backend with Prisma and MySQL.

## Repository structure

- `backend/` — Node/TypeScript API, Prisma schema, migrations, and SQL helper files
- `frontend/` — Next.js app (TypeScript)
- `sql/` — SQL helper files used for initial schema or reference
- `uploads/` — uploaded files used by the backend

## Prerequisites

- Node.js (16+ recommended)
- npm (or yarn/pnpm)
- MySQL server (or compatible)

## Quick start

1. Backend

```bash
cd backend
npm install
# run migrations (verify script names in backend/package.json)
npx prisma migrate deploy
# seed database if needed
npx prisma db seed
npm run dev
```

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Note: script names (`dev`, etc.) may vary — check `backend/package.json` and `frontend/package.json`.

## Database

- Prisma schema is at `backend/prisma/schema.prisma` and migrations in `backend/prisma/migrations/`.
- SQL reference files: `backend/sql/*.sql` and `sql/` at the repo root contain helpful DDL for MySQL.
- Typical steps: create a MySQL database, set `DATABASE_URL`, run Prisma migrations, then seed.

## Environment variables

Common environment variables expected by the project (confirm exact names in config files):

- `DATABASE_URL` — connection string for MySQL (Prisma)
- `PORT` — backend server port
- `JWT_SECRET` — JWT signing secret for auth
- Firebase-related variables for frontend (if used)

Place env vars in a `.env` file in the `backend/` and `frontend/` folders as appropriate.

## Development

- Backend: code lives in `backend/src/` and routes in `backend/src/routes/`.
- Frontend: Next.js app lives in `frontend/src/app/`.
- Uploads are stored in `backend/uploads/`.

## Testing & linting

Check `package.json` in each workspace for available scripts such as `test`, `lint`, and `build`.

## Deployment

- Build frontend: `cd frontend && npm run build` (confirm script).
- Backend should be built/transpiled according to `backend/package.json` scripts.
- Ensure environment variables and database migrations are applied in production.

## Contributing

Open issues or PRs with clear descriptions. Follow existing code style and TypeScript conventions.

## License

See `LICENSE` at the repo root.
