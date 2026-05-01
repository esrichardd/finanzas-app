"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { Topbar } from "@/features/dashboard/components/Topbar";
import {
  SideNav,
  SideNavSheetContent,
} from "@/features/dashboard/components/SideNav";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/core/components/ui/sheet";

interface AppShellProps {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  avatarInitial: string;
}

/**
 * AppShell — contenedor base del área autenticada.
 * Integra Topbar, SideNav (desktop) y Sheet de navegación mobile.
 */
export function AppShell({
  children,
  userName,
  userEmail,
  avatarInitial,
}: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Topbar
        userName={userName}
        userEmail={userEmail}
        avatarInitial={avatarInitial}
        onMenuClick={() => setMobileNavOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* SideNav — izquierda (solo desktop) */}
        <SideNav />

        {/* Contenido principal — derecha */}
        <main className="flex-1 overflow-y-auto min-w-0" role="main">
          {children}
        </main>
      </div>

      {/* Sheet de navegación mobile (izquierda) */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          className="p-0 w-72 gap-0"
          showCloseButton={false}
        >
          <SheetHeader className="px-4 py-3 border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 bg-primary">
                <TrendingUp className="size-3.5 text-primary-foreground" />
              </div>
              <span className="font-mono text-sm font-bold tracking-widest uppercase">
                FINTRACK
              </span>
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <SideNavSheetContent onClose={() => setMobileNavOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
