import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Button } from "@/core/components/ui/button";
import { logoutAction } from "@/features/auth/actions/logout";
import { createClient } from "@/core/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const locale = await getLocale();
    redirect(`/${locale}/login`);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="flex flex-col gap-4 w-full max-w-md text-center">
        <h1 className="font-mono text-2xl font-bold text-foreground">
          {`Hola, ${user.email}`}
        </h1>
        <p className="text-sm text-muted-foreground">{`User ID: ${user.id}`}</p>
        <form action={logoutAction}>
          <Button
            type="submit"
            size="xl"
            className="w-full font-mono uppercase tracking-widest border border-primary hover:bg-transparent hover:text-primary"
          >
            Logout
          </Button>
        </form>
      </div>
    </main>
  );
}
