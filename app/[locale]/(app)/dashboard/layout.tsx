import { createClient } from "@/core/lib/supabase/server";
import { CurrencyProvider } from "@/core/lib/currency-context";
import { AppShell } from "@/core/components/shell/AppShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email ?? "";
  const userName = userEmail.split("@")[0] || "there";
  const avatarInitial = userName[0]?.toUpperCase() ?? "U";

  return (
    <CurrencyProvider>
      <AppShell
        userName={userName}
        userEmail={userEmail}
        avatarInitial={avatarInitial}
      >
        {children}
      </AppShell>
    </CurrencyProvider>
  );
}
