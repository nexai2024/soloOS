# AGENTS.md

## Cursor Cloud specific instructions

### Services Overview

SoloOS is a Next.js 16 + React 19 + TypeScript monolith backed by PostgreSQL (Prisma 7). There is a single service: the Next.js dev server.

### Running the App

- `npm run dev` starts the dev server on port 3000 (Turbopack).
- PostgreSQL must be running first: `sudo pg_ctlcluster 16 main start`
- The `.env` file must contain `DATABASE_URL` pointing to a PostgreSQL database (e.g., `postgresql://soloos:soloos@localhost:5432/soloos`).
- After schema changes: `npx prisma generate && npx prisma migrate deploy`

### Authentication

- The app uses Clerk (`@clerk/nextjs` v6) for auth. Without `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`, Clerk runs in "keyless" development mode with temporary API keys.
- A fallback session-cookie auth system exists (`/api/auth/login`, `/api/auth/signup`, `/api/auth/me`, `/api/auth/logout`). These API endpoints work without Clerk credentials.
- **Important**: The Clerk middleware (`src/middleware.ts`) protects non-public routes. In keyless mode, `/dashboard` and other protected routes redirect to Clerk's hosted sign-in. The fallback auth API routes are accessible via direct HTTP requests (curl) but not via browser navigation due to the middleware.
- To fully test the dashboard UI in a browser, provide real Clerk keys via environment secrets.

### Lint and Typecheck

- `next lint` is removed in Next.js 16. Use `ESLINT_USE_FLAT_CONFIG=false npx eslint src/` instead.
- `npm run typecheck` runs `tsc --noEmit`. There are pre-existing type errors in `src/app/projects/page.tsx` (schema mismatch) that do not prevent the app from running.

### Database

- PostgreSQL 16 is used. Database and user: `soloos` / `soloos` (local dev).
- `npx prisma migrate deploy` applies existing migrations without interactivity (prefer over `migrate dev` in automated contexts).

### Optional Services

- **OpenAI** (`OPENAI_API_KEY`): Powers AI scoring, content generation. App runs without it; AI features return errors when invoked.
- **Clerk** (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`): Enables full browser-based auth. Without it, only API-level fallback auth works.
