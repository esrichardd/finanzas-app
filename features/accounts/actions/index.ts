"use server";

import { createClient } from "@/core/lib/supabase/server";

export interface AccountActionData {
  name: string;
  typeCode: string;
  currency: string;
  initialBalance: number;
  notes: string;
}

export async function createAccountAction(
  data: AccountActionData,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  const { error } = await supabase.from("accounts").insert({
    user_id: user.id,
    name: data.name,
    account_type_code: data.typeCode,
    currency_code: data.currency,
    initial_balance: data.initialBalance,
    notes: data.notes || null,
  });

  if (error) return { error: error.message };
  return {};
}

export async function updateAccountAction(
  id: string,
  data: AccountActionData,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  const { error } = await supabase
    .from("accounts")
    .update({
      name: data.name,
      account_type_code: data.typeCode,
      currency_code: data.currency,
      initial_balance: data.initialBalance,
      notes: data.notes || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return {};
}

export async function deleteAccountAction(
  id: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  const { error } = await supabase
    .from("accounts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return {};
}
