// ---------------------------------------------------------------------------
// Transactions queries — server-side only
// ---------------------------------------------------------------------------

import { createClient } from "@/core/lib/supabase/server";
import type { Transaction, TxType } from "@/features/dashboard/types";

const TX_TYPE_MAP: Record<string, TxType> = {
  income: "income",
  expense: "expense",
  transfer_same_currency: "transfer",
  transfer_fx: "transfer",
  crypto_buy: "crypto",
  crypto_sell: "crypto",
};

export async function getAllTransactions(
  userId: string,
): Promise<Transaction[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, type, occurred_at, description, category_id, category:categories(name), transaction_entries(amount, direction, currency_code, is_fee, account_id, account:accounts(name))",
    )
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("occurred_at", { ascending: false })
    .limit(200);

  if (error || !data) return [];

  return data.map((tx) => {
    const entries =
      (tx.transaction_entries as unknown as {
        amount: number;
        direction: string;
        currency_code: string;
        is_fee: boolean;
        account_id: string | null;
        account: { name: string } | null;
      }[]) ?? [];

    const primary = entries.find((e) => !e.is_fee);
    const amount = primary ? Number(primary.amount) : 0;
    const currency = primary?.currency_code ?? "USD";
    const signed = tx.type === "income" ? amount : -amount;

    return {
      id: tx.id,
      date: (tx.occurred_at as string).split("T")[0],
      description: tx.description ?? "",
      category: (tx.category as unknown as { name: string } | null)?.name ?? "",
      categoryId: tx.category_id ?? undefined,
      amount: signed,
      currency,
      type: TX_TYPE_MAP[tx.type] ?? "expense",
      account: primary?.account?.name ?? "",
      accountId: primary?.account_id ?? undefined,
    };
  });
}

// ---------------------------------------------------------------------------
// Form helpers
// ---------------------------------------------------------------------------

export interface FormAccount {
  id: string;
  name: string;
  currency: string;
}

export interface FormCategory {
  id: string;
  name: string;
  kind: string;
}

export async function getAccountsForForm(userId: string): Promise<FormAccount[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("id, name, currency_code")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("name");

  if (error || !data) return [];
  return data.map((r) => ({ id: r.id, name: r.name, currency: r.currency_code }));
}

export async function getCategoriesForForm(userId: string): Promise<FormCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, kind")
    .or(`user_id.eq.${userId},user_id.is.null`)
    .order("sort_order")
    .order("name");

  if (error || !data) return [];
  return data.map((r) => ({ id: r.id, name: r.name, kind: r.kind }));
}
