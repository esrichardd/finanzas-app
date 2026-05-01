import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/core/lib/supabase/server";
import { LeftPanel } from "@/features/auth/components/LeftPanel";
import { ThemeLangToggle } from "@/features/auth/components/ThemeLangToggle";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Si ya hay sesión, las pantallas de auth no tienen sentido.
  // Mandamos al dashboard. Esto cubre /login, /register, /verify-email y
  // /forgot-password de un saque, sin tocar cada page.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const locale = await getLocale();
    redirect(`/${locale}/dashboard`);
  }

  return (
    <main className="relative flex min-h-screen bg-background">
      <ThemeLangToggle />
      <LeftPanel />
      <div className="flex flex-1 items-center justify-center min-h-screen bg-background">
        {children}
      </div>
    </main>
  );
}
