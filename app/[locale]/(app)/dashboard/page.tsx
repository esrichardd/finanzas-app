import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/core/lib/supabase/server";
import { DashboardContent } from "@/features/dashboard/components/DashboardContent";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const locale = await getLocale();
    redirect(`/${locale}/login`);
  }

  // Usamos el email como fallback hasta tener perfil con display name
  const userName = user.email?.split("@")[0] ?? "there";

  return <DashboardContent userName={userName} />;
}
