# Architecture

Reference guide for LLMs and new contributors. Describes where things go and why.

---

## Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Next.js App Router | 16.2.4 |
| Language | TypeScript | ^5 |
| Database / Auth | Supabase (PostgreSQL + RLS) | @supabase/ssr ^0.10 |
| i18n | next-intl | ^4.9 |
| Theming | next-themes | ^0.4 |
| UI components | shadcn/ui (Radix primitives) | — |
| Styling | Tailwind CSS | ^4 |
| Charts | recharts | ^3.8 |
| Icons | lucide-react | ^1.14 |
| Validation | Zod | ^4 |

---

## Folder Structure

```
/
├── app/
│   └── [locale]/           # i18n dynamic segment (en | es)
│       ├── (auth)/         # route group: login, register, forgot-password
│       └── (app)/          # route group: authenticated area
│           └── dashboard/
│               ├── layout.tsx   # fetches user, wraps with AppShell + CurrencyProvider
│               └── page.tsx     # fetches all dashboard data in parallel, passes to DashboardContent
│
├── core/                   # Shared infrastructure (no business logic)
│   ├── components/
│   │   ├── shell/          # AppShell (topbar + sidenav + mobile sheet)
│   │   └── ui/             # shadcn components (Button, Badge, Table, etc.)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── server.ts   # createClient() for server components and server actions
│   │   │   └── client.ts   # createClient() for client components (browser)
│   │   ├── i18n/
│   │   │   ├── navigation.ts  # Link, usePathname, useRouter (locale-aware)
│   │   │   └── request.ts     # loads message files per locale
│   │   ├── shadcn/
│   │   │   └── libs/utils.ts  # cn() helper
│   │   └── currency-context.tsx  # CurrencyProvider + useCurrency()
│   └── types/
│       └── i18n.types.ts   # TypeScript types for all message namespaces
│
├── features/               # Feature modules (one folder per domain)
│   ├── auth/
│   │   ├── actions/        # Server actions (login, logout, register)
│   │   └── components/     # LoginForm, RegisterForm, etc.
│   └── dashboard/
│       ├── components/     # All dashboard UI components (client)
│       ├── lib/
│       │   ├── queries.ts  # Server-side Supabase query functions
│       │   ├── mock-data.ts # Fallback/seed constants (re-exports types from types.ts)
│       │   └── formatters.ts # formatCurrency(), formatShortDate()
│       └── types.ts        # Domain interfaces: KpiDataPoint, FiatAccount, Transaction, etc.
│
├── messages/
│   ├── en/                 # One JSON file per feature namespace
│   └── es/
│
└── supabase/
    ├── migrations/         # Ordered SQL migrations
    └── seed.sql            # Dev seed: 3 test users with rich transaction history
```

---

## Feature Module Anatomy

When adding a new feature (e.g. `transactions`, `accounts`), follow this structure:

```
features/transactions/
├── components/
│   ├── TransactionsPage.tsx   # "use client" orchestrator, receives data as props
│   └── TransactionRow.tsx     # pure presentational subcomponent
├── lib/
│   ├── queries.ts             # async functions that call Supabase (server-only)
│   └── formatters.ts          # pure formatting helpers (no side effects)
└── types.ts                   # interfaces and types for this domain
```

Rules:
- `queries.ts` is **server-only** — imports `createClient` from `@/core/lib/supabase/server`
- `types.ts` has zero imports from the project — pure TypeScript interfaces
- `components/` are **client components** (`"use client"`) — they receive data as props, never fetch
- `mock-data.ts` is optional — only needed during development before queries are wired up

---

## Server vs Client: The Pattern

Data flows **top-down**. Server fetches, client renders.

```
app/[locale]/(app)/feature/page.tsx   ← async server component
  → calls queries in parallel (Promise.all)
  → passes typed props to FeaturePage component

features/feature/components/FeaturePage.tsx   ← "use client"
  → receives all data as props
  → passes subsets to child components
  → handles client-side interactivity (state, events)

features/feature/components/FeatureCard.tsx   ← "use client"
  → pure presentational, props only, no data fetching
```

**Never** import `queries.ts` from a client component. **Never** use `useEffect` to fetch data that could be server-fetched.

---

## i18n

- Message files live in `messages/{locale}/{feature}.json`
- Namespace matches the feature: `dashboard.kpi`, `dashboard.cashflow`, `auth.login`, etc.
- In client components: `const t = useTranslations("dashboard.kpi")`
- In server components: `const t = await getTranslations("dashboard.kpi")`
- **Never** inline `lang === 'es' ? ... : ...` — always go through `useTranslations`
- When adding a new string: add it to both `messages/en/` and `messages/es/` files
- TypeScript types for messages live in `core/types/i18n.types.ts` — update when adding a new namespace

Language switch uses a hard navigation: `window.location.assign(`/${nextLocale}${pathname}`)` — not a router push, because next-intl needs a full reload to re-apply the locale middleware.

---

## Supabase

**Clients:**
- Server components, layouts, pages, server actions → `import { createClient } from "@/core/lib/supabase/server"`
- Client components that need Supabase (auth state, realtime) → `import { createClient } from "@/core/lib/supabase/client"`

**Schema overview:**
- `accounts` + `crypto_holdings` → user's financial accounts
- `transactions` → each financial operation (income, expense, transfer_same_currency, transfer_fx, crypto_buy, crypto_sell)
- `transaction_entries` → double-entry ledger rows; every transaction has ≥2 entries (debit + credit)
- `v_account_balances` → view: computed fiat balances (initial_balance + entries)
- `v_crypto_holdings_balances` → view: computed crypto quantities
- `categories` → system categories (is_system=true, user_id=null) + custom per user
- All tables have Row Level Security — queries are automatically scoped to the authenticated user

**Key constraint:** `transaction_entries` has an `is_fee` boolean. Always exclude fee entries when aggregating amounts for business logic.

---

## Theming

- Dark/light mode via `next-themes` — use `useTheme()` from `next-themes`
- Always add a mounted guard before reading the theme to avoid hydration mismatch:
  ```ts
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <Fallback />
  ```
- CSS variables are defined in `app/globals.css` following shadcn conventions (`--background`, `--foreground`, `--muted-foreground`, etc.)

---

## shadcn / UI Components

- Import from `@/core/components/ui/{component}`
- `cn()` utility: `import { cn } from "@/core/lib/shadcn/libs/utils"`
- Install new components with: `npx shadcn@latest add {component}` — files land in `core/components/ui/`
- Don't install a shadcn component if a native HTML element or Tailwind class is enough

---

## Currency

- `CurrencyProvider` wraps the authenticated area in `app/[locale]/(app)/dashboard/layout.tsx`
- Active currency: `const { currency, setCurrency } = useCurrency()` from `@/core/lib/currency-context`
- Format values: `formatCurrency(value, currency)` from `@/features/dashboard/lib/formatters`
- Supported: `USD | EUR | ARS | BRL`
- Crypto USD values are `null` until a price oracle is integrated — render `"—"` when null

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `KpiCard.tsx` |
| Hooks | camelCase, `use` prefix | `useCurrency.ts` |
| Query functions | camelCase, verb + noun | `getFiatAccounts()` |
| Server actions | camelCase, past tense | `loginAction()`, `logoutAction()` |
| Types / interfaces | PascalCase | `FiatAccount`, `KpiDataPoint` |
| Type unions | PascalCase | `TxType`, `Currency` |
| Message keys | camelCase | `"vsPrevMonth"`, `"monthIncome"` |
| CSS variables | kebab-case | `--muted-foreground` |

---

## Test Users (local dev)

Seed creates three users, all with password `testpassword123`:

| Email | Profile | Primary currency |
|---|---|---|
| `ana@example.com` | Freelance, Colombia | COP |
| `carlos@example.com` | Salaried, USA | USD |
| `sofia@example.com` | Crypto-heavy, Argentina | ARS |

Run `supabase db reset` to wipe and re-seed.
