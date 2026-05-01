import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/core/lib/supabase/server";

/**
 * Layout del área autenticada de la app. Centraliza el guard: cualquier ruta
 * que viva dentro de `(app)/` queda protegida sin tocar la page.
 *
 * El día de mañana acá puede vivir un topbar/sidebar compartido.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const locale = await getLocale();
    redirect(`/${locale}/login`);
  }

  return <>{children}</>;
}
