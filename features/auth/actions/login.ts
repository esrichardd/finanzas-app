"use server";

import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/core/lib/supabase/server";
import { loginSchema } from "../lib/schemas";
import { flattenZodErrors, type AuthFormState } from "./types";

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: flattenZodErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.message.toLowerCase().includes("not confirmed")) {
      return { error: "emailNotConfirmed" };
    }
    return { error: "invalidCredentials" };
  }

  const locale = await getLocale();
  redirect(`/${locale}/dashboard`);
}
