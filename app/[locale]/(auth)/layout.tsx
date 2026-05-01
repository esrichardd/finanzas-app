import { LeftPanel } from "@/features/auth/components/LeftPanel";
import { ThemeLangToggle } from "@/features/auth/components/ThemeLangToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
