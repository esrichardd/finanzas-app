// ---------------------------------------------------------------------------
// Accounts queries — server-side only
// ---------------------------------------------------------------------------

import { createClient } from "@/core/lib/supabase/server";
import type { Account, AccountType } from "@/features/accounts/types";

export async function getAccounts(userId: string): Promise<Account[]> {
  const supabase = await createClient();

  // Two queries: accounts table (with account_types join) + view for computed balances
  const [{ data: rows, error }, { data: balanceRows }] = await Promise.all([
    supabase
      .from("accounts")
      .select(
        "id, name, account_type_code, currency_code, initial_balance, notes, is_archived, account_type:account_types(name_en, name_es)",
      )
      .eq("user_id", userId)
      .is("deleted_at", null)
      .eq("is_archived", false)
      .order("name"),
    supabase
      .from("v_account_balances")
      .select("account_id, balance")
      .eq("user_id", userId),
  ]);

  if (error || !rows) return [];

  const balanceMap = new Map<string, number>();
  for (const b of balanceRows ?? []) {
    balanceMap.set(b.account_id, Number(b.balance));
  }

  return rows.map((row) => {
    const accountType = row.account_type as unknown as {
      name_en: string;
      name_es: string;
    } | null;

    return {
      id: row.id,
      name: row.name,
      typeCode: row.account_type_code,
      typeNameEn: accountType?.name_en ?? row.account_type_code,
      typeNameEs: accountType?.name_es ?? row.account_type_code,
      currency: row.currency_code,
      initialBalance: Number(row.initial_balance),
      balance: balanceMap.get(row.id) ?? Number(row.initial_balance),
      notes: row.notes,
      isArchived: row.is_archived,
    } satisfies Account;
  });
}

export async function getAccountTypes(): Promise<AccountType[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("account_types")
    .select("code, name_en, name_es, is_credit")
    .order("name_en");

  if (error || !data) return [];
  return data.map((r) => ({
    code: r.code,
    nameEn: r.name_en,
    nameEs: r.name_es,
    isCredit: r.is_credit,
  }));
}
