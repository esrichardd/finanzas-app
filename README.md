# Fintrack

Personal finance tracker with multi-currency support, double-entry accounting, and crypto holdings. Built with Next.js App Router and Supabase.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss)

## Requirements

- Node.js 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`brew install supabase/tap/supabase`)
- Docker (required by Supabase CLI for local dev)

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Start local Supabase (runs migrations + seed automatically)
supabase start

# 3. Values are already set in .env.local for local dev — no changes needed

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL (local: `http://localhost:54321`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only, never exposed to browser) |

## Local Services

| Service | URL |
|---|---|
| App | http://localhost:3000 |
| Supabase Studio | http://localhost:54323 |
| Supabase API | http://localhost:54321 |
| Inbucket (email) | http://localhost:54324 |

## Test Users

All users have password `testpassword123`.

| Email | Profile | Currency |
|---|---|---|
| `ana@example.com` | Freelance, Colombia | COP |
| `carlos@example.com` | Salaried, USA | USD |
| `sofia@example.com` | Crypto-heavy, Argentina | ARS |

## Useful Commands

```bash
# Re-seed the database (wipes data and re-runs migrations + seed.sql)
supabase db reset

# Type-check without building
npx tsc --noEmit

# Lint
npm run lint

# Stop local Supabase
supabase stop
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for folder structure, conventions, and data flow patterns.
