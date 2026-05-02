// ---------------------------------------------------------------------------
// Mock data — reemplazar con queries reales a Supabase cuando estén listos
// Las interfaces viven en @/features/dashboard/types
// ---------------------------------------------------------------------------

export type {
  KpiDataPoint,
  FiatAccount,
  CryptoHolding,
  ExpenseCategory,
  CashflowEntry,
  TxType,
  Transaction,
  NavItem,
  NavSection,
} from "@/features/dashboard/types";

import type {
  KpiDataPoint,
  FiatAccount,
  CryptoHolding,
  ExpenseCategory,
  CashflowEntry,
  Transaction,
  NavSection,
} from "@/features/dashboard/types";

// ---------------------------------------------------------------------------

export const KPI_DATA: Record<
  "netWorth" | "monthIncome" | "monthExpenses" | "monthFees",
  KpiDataPoint
> = {
  netWorth: { value: 84_230.5, delta: 3.2 },
  monthIncome: { value: 6_400.0, delta: 12.5 },
  monthExpenses: { value: 3_850.75, delta: -4.1 },
  monthFees: { value: 124.5, delta: 8.3 },
};

// ---------------------------------------------------------------------------

export const FIAT_ACCOUNTS: FiatAccount[] = [
  { id: "1", name: "Chase Checking", currency: "USD", balance: 12_450.0 },
  { id: "2", name: "Chase Savings", currency: "USD", balance: 24_800.5 },
  { id: "3", name: "BBVA Cuenta", currency: "ARS", balance: 580_000.0 },
  { id: "4", name: "N26 Current", currency: "EUR", balance: 3_200.75 },
];

// ---------------------------------------------------------------------------

export const CRYPTO_HOLDINGS: CryptoHolding[] = [
  { id: "1", symbol: "BTC", name: "Bitcoin", amount: 0.45, valueUsd: 28_350 },
  { id: "2", symbol: "ETH", name: "Ethereum", amount: 3.2, valueUsd: 9_600 },
  {
    id: "3",
    symbol: "USDC",
    name: "USD Coin",
    amount: 5_000,
    valueUsd: 5_000,
  },
  { id: "4", symbol: "SOL", name: "Solana", amount: 18, valueUsd: 1_800 },
];

// ---------------------------------------------------------------------------

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { name: "Housing", value: 1_200.0, fill: "#2563EB" },
  { name: "Food", value: 650.0, fill: "#3B82F6" },
  { name: "Transport", value: 320.0, fill: "#60A5FA" },
  { name: "Health", value: 280.0, fill: "#93C5FD" },
  { name: "Entertainment", value: 200.0, fill: "#1E3A5F" },
  { name: "Other", value: 400.75, fill: "#172554" },
];

// ---------------------------------------------------------------------------

export const CASHFLOW_DATA: CashflowEntry[] = [
  { month: "Nov", income: 5_800, expenses: 3_200 },
  { month: "Dec", income: 7_200, expenses: 4_800 },
  { month: "Jan", income: 6_100, expenses: 3_900 },
  { month: "Feb", income: 6_400, expenses: 3_600 },
  { month: "Mar", income: 5_900, expenses: 3_700 },
  { month: "Apr", income: 6_400, expenses: 3_850 },
];

// ---------------------------------------------------------------------------

export const RECENT_TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    date: "2026-04-30",
    description: "Salary April",
    category: "Income",
    amount: 4_200.0,
    currency: "USD",
    type: "income",
  },
  {
    id: "t2",
    date: "2026-04-29",
    description: "Rent",
    category: "Housing",
    amount: -1_200.0,
    currency: "USD",
    type: "expense",
  },
  {
    id: "t3",
    date: "2026-04-28",
    description: "BTC Purchase",
    category: "Crypto",
    amount: -560.0,
    currency: "USD",
    type: "crypto",
  },
  {
    id: "t4",
    date: "2026-04-27",
    description: "Grocery Store",
    category: "Food",
    amount: -145.3,
    currency: "USD",
    type: "expense",
  },
  {
    id: "t5",
    date: "2026-04-26",
    description: "Transfer to Savings",
    category: "Transfer",
    amount: -2_000.0,
    currency: "USD",
    type: "transfer",
  },
  {
    id: "t6",
    date: "2026-04-25",
    description: "Freelance Project",
    category: "Income",
    amount: 2_200.0,
    currency: "USD",
    type: "income",
  },
  {
    id: "t7",
    date: "2026-04-24",
    description: "Netflix",
    category: "Entertainment",
    amount: -15.99,
    currency: "USD",
    type: "expense",
  },
  {
    id: "t8",
    date: "2026-04-23",
    description: "Doctor Visit",
    category: "Health",
    amount: -80.0,
    currency: "USD",
    type: "expense",
  },
];

// ---------------------------------------------------------------------------

export const NAV_SECTIONS: NavSection[] = [
  {
    titleEn: "Overview",
    titleEs: "Resumen",
    items: [
      {
        href: "/dashboard",
        icon: "LayoutDashboard",
        labelEn: "Dashboard",
        labelEs: "Dashboard",
      },
    ],
  },
  {
    titleEn: "Money",
    titleEs: "Dinero",
    items: [
      {
        href: "/transactions",
        icon: "ArrowLeftRight",
        labelEn: "Transactions",
        labelEs: "Transacciones",
      },
      {
        href: "/accounts",
        icon: "Wallet",
        labelEn: "Accounts",
        labelEs: "Cuentas",
      },
      {
        href: "/crypto",
        icon: "Bitcoin",
        labelEn: "Crypto",
        labelEs: "Cripto",
      },
    ],
  },
  {
    titleEn: "Manage",
    titleEs: "Gestión",
    items: [
      {
        href: "/budgets",
        icon: "TrendingUp",
        labelEn: "Budgets",
        labelEs: "Presupuestos",
      },
      {
        href: "/categories",
        icon: "Tag",
        labelEn: "Categories",
        labelEs: "Categorías",
      },
      {
        href: "/tags",
        icon: "Bookmark",
        labelEn: "Tags",
        labelEs: "Etiquetas",
      },
      {
        href: "/recurring",
        icon: "RefreshCcw",
        labelEn: "Recurring",
        labelEs: "Recurrentes",
      },
    ],
  },
  {
    titleEn: "Reports",
    titleEs: "Reportes",
    items: [
      {
        href: "/reports",
        icon: "BarChart2",
        labelEn: "Reports",
        labelEs: "Reportes",
      },
    ],
  },
];
