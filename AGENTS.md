# AGENTS.md

## Cursor Cloud specific instructions

### Services

| Service | How to run | Notes |
|---|---|---|
| PostgreSQL | `sudo pg_ctlcluster 16 main start` | Must be running before the dev server. Database `soloos` with user `soloos`/`soloos` on port 5432. |
| Next.js dev server | `npm run dev` | Runs on port 3000. Uses Turbopack. |

### Database

- Connection string in `.env`: `DATABASE_URL="postgresql://soloos:soloos@localhost:5432/soloos"`
- After schema changes: `npx prisma generate && npx prisma migrate dev`
- Prisma client output is at `src/generated/prisma/`

### Authentication

- The app uses Clerk for auth in production, but has a **fallback session-cookie auth** system for development.
- Without Clerk keys, the signup/login UI pages show Clerk's development-mode form (with temporary keys). Clerk's middleware (`src/middleware.ts`) protects non-public routes by redirecting to Clerk's sign-in page.
- For API-level testing without Clerk UI, use the REST endpoints directly:
  - `POST /api/auth/signup` with `{email, password, name}`
  - `POST /api/auth/login` with `{email, password}`
  - The session cookie from these endpoints authenticates subsequent API calls.

### Lint & Typecheck

- `next lint` was removed in Next.js 16. Run ESLint directly: `ESLINT_USE_FLAT_CONFIG=false npx eslint 'src/**/*.{ts,tsx}'`
- TypeScript: `npm run typecheck` (there are pre-existing type errors in the codebase)

### Common commands

See `CLAUDE.md` for the full list. Key commands: `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`.
