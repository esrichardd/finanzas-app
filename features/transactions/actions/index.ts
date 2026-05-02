"use server";

import { createClient } from "@/core/lib/supabase/server";

export interface TxActionData {
  type: "income" | "expense";
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  currency: string;
  categoryId: string;
  accountId: string;
}

export async function createTransactionAction(
  data: TxActionData,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthenticated" };

  // 1. Crear la transacción
  const { data: tx, error: txError } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      type: data.type,
      occurred_at: new Date(data.date).toISOString(),
      category_id: data.categoryId || null,
      description: data.description,
    })
    .select("id")
    .single();

  if (txError || !tx) return { error: txError?.message ?? "Failed to create transaction" };

  // 2. Crear la entrada doble — income: credit/destination, expense: debit/source
  const direction = data.type === "income" ? "credit" : "debit";
  const role = data.type === "income" ? "destination" : "source";

  const { error: entryError } = await supabase
    .from("transaction_entries")
    .insert({
      transaction_id: tx.id,
      direction,
      role,
      account_id: data.accountId,
      amount: data.amount,
      currency_code: data.currency,
    });

  if (entryError) {
    // Rollback: borrar la transacción huérfana
    await supabase.from("transactions").delete().eq("id", tx.id);
    return { error: entryError.message };
  }

  return {};
}

export async function updateTransactionAction(
  id: string,
  data: TxActionData,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthenticated" };

  // 1. Actualizar la transacción (updated_at lo maneja el trigger)
  const { error: txError } = await supabase
    .from("transactions")
    .update({
      type: data.type,
      occurred_at: new Date(data.date).toISOString(),
      category_id: data.categoryId || null,
      description: data.description,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (txError) return { error: txError.message };

  // 2. Actualizar la entry principal in-place (no delete+insert — el trigger
  //    CONSTRAINT DEFERRABLE INITIALLY DEFERRED valida al final de cada transacción
  //    de BD, así que delete+insert separados dejan el conteo en 0 y el trigger falla).
  const { data: existingEntry, error: fetchError } = await supabase
    .from("transaction_entries")
    .select("id")
    .eq("transaction_id", id)
    .eq("is_fee", false)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (fetchError || !existingEntry) {
    return { error: fetchError?.message ?? "Primary entry not found" };
  }

  const direction = data.type === "income" ? "credit" : "debit";
  const role = data.type === "income" ? "destination" : "source";

  const { error: entryError } = await supabase
    .from("transaction_entries")
    .update({
      direction,
      role,
      account_id: data.accountId,
      amount: data.amount,
      currency_code: data.currency,
    })
    .eq("id", existingEntry.id);

  if (entryError) return { error: entryError.message };

  return {};
}

export async function deleteTransactionAction(
  id: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthenticated" };

  const { error } = await supabase
    .from("transactions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return {};
}
