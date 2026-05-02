// ---------------------------------------------------------------------------
// Dashboard domain types
// Interfaces moved here from mock-data.ts so queries.ts and page.tsx
// can import them without pulling in mock constants.
// ---------------------------------------------------------------------------

export interface KpiDataPoint {
  value: number;
  /** Porcentaje de cambio vs. mes anterior (positivo = sube, negativo = baja) */
  delta: number;
}

export interface FiatAccount {
  id: string;
  name: string;
  currency: string;
  balance: number;
}

export interface CryptoHolding {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  /** Valor en USD — null hasta integrar price oracle */
  valueUsd: number | null;
}

export interface ExpenseCategory {
  name: string;
  value: number;
  fill: string;
}

export interface CashflowEntry {
  month: string;
  income: number;
  expenses: number;
}

export type TxType = "income" | "expense" | "transfer" | "crypto";

export interface Transaction {
  id: string;
  date: string; // ISO: YYYY-MM-DD
  description: string;
  category: string;
  categoryId?: string;
  amount: number; // positivo = ingreso, negativo = egreso
  currency: string;
  type: TxType;
  account?: string;
  accountId?: string;
}

export interface NavItem {
  href: string;
  icon: string;
  labelEn: string;
  labelEs: string;
}

export interface NavSection {
  titleEn: string;
  titleEs: string;
  items: NavItem[];
}
