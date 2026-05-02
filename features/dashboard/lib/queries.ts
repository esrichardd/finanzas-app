// ---------------------------------------------------------------------------
// Dashboard queries — server-side only (usa createClient de Supabase SSR)
// Cada función recibe userId y retorna el tipo exacto que usa el componente.
// ---------------------------------------------------------------------------

import { createClient } from "@/core/lib/supabase/server";
import type {
  KpiDataPoint,
  FiatAccount,
  CryptoHolding,
  ExpenseCategory,
  CashflowEntry,
  Transaction,
  TxType,
} from "@/features/dashboard/types";

// Paleta de colores para el donut de gastos (cicla si hay más de 6 categorías)
const CATEGORY_COLORS = [
  "#2563EB",
  "#3B82F6",
  "#60A5FA",
  "#93C5FD",
  "#1E3A5F",
  "#172554",
];

function startOfMonth(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
}

function startOfNextMonth(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString();
}

// ---------------------------------------------------------------------------
// 1. KPI: ingresos, gastos, fees del mes actual vs. mes anterior
// ---------------------------------------------------------------------------

type KpiKey = "netWorth" | "monthIncome" | "monthExpenses" | "monthFees";

export async function getKpiData(
  userId: string,
): Promise<Record<KpiKey, KpiDataPoint>> {
  const supabase = await createClient();

  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [currentRes, prevRes, balancesRes] = await Promise.all([
    supabase
      .from("transactions")
      .select("type, transaction_entries(amount, is_fee)")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .gte("occurred_at", startOfMonth(now))
      .lt("occurred_at", startOfNextMonth(now)),

    supabase
      .from("transactions")
      .select("type, transaction_entries(amount, is_fee)")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .gte("occurred_at", startOfMonth(prevMonth))
      .lt("occurred_at", startOfNextMonth(prevMonth)),

    supabase.from("v_account_balances").select("balance").eq("user_id", userId),
  ]);

  type TxRow = {
    type: string;
    transaction_entries: { amount: number; is_fee: boolean }[];
  };

  function aggregate(rows: TxRow[] | null) {
    let income = 0,
      expenses = 0,
      fees = 0;
    for (const tx of rows ?? []) {
      for (const entry of tx.transaction_entries ?? []) {
        const amount = Number(entry.amount);
        if (entry.is_fee) {
          fees += amount;
        } else if (tx.type === "income") {
          income += amount;
        } else if (tx.type === "expense") {
          expenses += amount;
        }
      }
    }
    return { income, expenses, fees };
  }

  function delta(curr: number, prev: number): number {
    if (prev === 0) return 0;
    return Math.round(((curr - prev) / prev) * 1000) / 10;
  }

  const curr = aggregate(currentRes.data as TxRow[] | null);
  const prev = aggregate(prevRes.data as TxRow[] | null);
  const netWorth = (balancesRes.data ?? []).reduce(
    (sum, row) => sum + Number(row.balance),
    0,
  );

  return {
    netWorth: { value: netWorth, delta: 0 }, // delta requires historical snapshot — TODO
    monthIncome: { value: curr.income, delta: delta(curr.income, prev.income) },
    monthExpenses: {
      value: curr.expenses,
      delta: delta(curr.expenses, prev.expenses),
    },
    monthFees: { value: curr.fees, delta: delta(curr.fees, prev.fees) },
  };
}

// ---------------------------------------------------------------------------
// 2. Cuentas fiat con saldo calculado
// ---------------------------------------------------------------------------

export async function getFiatAccounts(userId: string): Promise<FiatAccount[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("v_account_balances")
    .select("account_id, name, currency_code, balance")
    .eq("user_id", userId);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.account_id,
    name: row.name,
    currency: row.currency_code,
    balance: Number(row.balance),
  }));
}

// ---------------------------------------------------------------------------
// 3. Holdings cripto con cantidad calculada (valueUsd = null hasta price oracle)
// ---------------------------------------------------------------------------

export async function getCryptoHoldings(
  userId: string,
): Promise<CryptoHolding[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("v_crypto_holdings_balances")
    .select("holding_id, name, crypto_symbol, quantity")
    .eq("user_id", userId);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.holding_id,
    symbol: row.crypto_symbol,
    name: row.name,
    amount: Number(row.quantity),
    valueUsd: null,
  }));
}

// ---------------------------------------------------------------------------
// 4. Gastos por categoría del mes actual (para el donut)
// ---------------------------------------------------------------------------

export async function getExpenseCategories(
  userId: string,
): Promise<ExpenseCategory[]> {
  const supabase = await createClient();

  const now = new Date();

  const { data, error } = await supabase
    .from("transactions")
    .select("category:categories(name), transaction_entries(amount, is_fee)")
    .eq("user_id", userId)
    .eq("type", "expense")
    .is("deleted_at", null)
    .gte("occurred_at", startOfMonth(now))
    .lt("occurred_at", startOfNextMonth(now));

  if (error || !data) return [];

  // Agrupa por nombre de categoría y suma montos
  const totals: Record<string, number> = {};
  for (const tx of data) {
    const categoryName =
      (tx.category as unknown as { name: string } | null)?.name ?? "Other";
    for (const entry of (tx.transaction_entries as {
      amount: number;
      is_fee: boolean;
    }[]) ?? []) {
      if (!entry.is_fee) {
        totals[categoryName] =
          (totals[categoryName] ?? 0) + Number(entry.amount);
      }
    }
  }

  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({
      name,
      value,
      fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));
}

// ---------------------------------------------------------------------------
// 5. Cashflow de los últimos 6 meses
// ---------------------------------------------------------------------------

export async function getCashflowData(
  userId: string,
): Promise<CashflowEntry[]> {
  const supabase = await createClient();

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const { data, error } = await supabase
    .from("transactions")
    .select("type, occurred_at, transaction_entries(amount, is_fee)")
    .eq("user_id", userId)
    .in("type", ["income", "expense"])
    .is("deleted_at", null)
    .gte("occurred_at", sixMonthsAgo.toISOString())
    .order("occurred_at", { ascending: true });

  if (error || !data) return [];

  // Inicializa los 6 meses en orden
  const monthMap = new Map<string, { income: number; expenses: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("en-US", { month: "short" });
    monthMap.set(key, { income: 0, expenses: 0 });
  }

  for (const tx of data) {
    const key = new Date(tx.occurred_at).toLocaleDateString("en-US", {
      month: "short",
    });
    const slot = monthMap.get(key);
    if (!slot) continue;

    for (const entry of (tx.transaction_entries as {
      amount: number;
      is_fee: boolean;
    }[]) ?? []) {
      if (entry.is_fee) continue;
      const amount = Number(entry.amount);
      if (tx.type === "income") slot.income += amount;
      else slot.expenses += amount;
    }
  }

  return Array.from(monthMap.entries()).map(([month, values]) => ({
    month,
    ...values,
  }));
}

// ---------------------------------------------------------------------------
// 6. Transacciones recientes (últimas 10)
// ---------------------------------------------------------------------------

const TX_TYPE_MAP: Record<string, TxType> = {
  income: "income",
  expense: "expense",
  transfer_same_currency: "transfer",
  transfer_fx: "transfer",
  crypto_buy: "crypto",
  crypto_sell: "crypto",
};

export async function getRecentTransactions(
  userId: string,
): Promise<Transaction[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, type, occurred_at, description, category:categories(name), transaction_entries(amount, direction, currency_code, is_fee)",
    )
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("occurred_at", { ascending: false })
    .limit(10);

  if (error || !data) return [];

  return data.map((tx) => {
    const entries =
      (tx.transaction_entries as {
        amount: number;
        direction: string;
        currency_code: string;
        is_fee: boolean;
      }[]) ?? [];

    // Entry principal: no-fee, dirección relevante según tipo
    const primary = entries.find((e) => !e.is_fee);
    const amount = primary ? Number(primary.amount) : 0;
    const currency = primary?.currency_code ?? "USD";

    // Income = positivo, todo lo demás = negativo
    const signed = tx.type === "income" ? amount : -amount;

    return {
      id: tx.id,
      date: (tx.occurred_at as string).split("T")[0],
      description: tx.description ?? "",
      category: (tx.category as unknown as { name: string } | null)?.name ?? "",
      amount: signed,
      currency,
      type: TX_TYPE_MAP[tx.type] ?? "expense",
    };
  });
}
