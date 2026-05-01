"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/core/lib/supabase/server";
import { registerSchema } from "../lib/schemas";
import { flattenZodErrors, type AuthFormState } from "./types";

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: flattenZodErrors(parsed.error) };
  }

  const { firstName, lastName, email, password } = parsed.data;
  const locale = await getLocale();

  // Construimos la URL absoluta del callback. Necesita ser absoluta porque
  // viaja en el correo de confirmación que envía Supabase.
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const proto = requestHeaders.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${host}`;
  const emailRedirectTo = `${origin}/${locale}/auth/callback`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      return { error: "emailAlreadyRegistered" };
    }
    return { error: "unknown" };
  }

  // Cuando Supabase tiene email confirmation activo y el correo ya existe,
  // devuelve `data.user` con `identities = []` (no manda email, no avisa por
  // seguridad). Mapeamos a "email duplicado" para que el usuario tenga señal.
  if (data.user && data.user.identities?.length === 0) {
    return { error: "emailAlreadyRegistered" };
  }

  redirect(`/${locale}/verify-email?email=${encodeURIComponent(email)}`);
}
