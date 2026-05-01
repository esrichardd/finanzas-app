"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Bitcoin,
  TrendingUp,
  Tag,
  Bookmark,
  RefreshCcw,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/core/lib/i18n/navigation";
import { cn } from "@/core/lib/shadcn/libs/utils";
import { NAV_SECTIONS } from "@/features/dashboard/lib/mock-data";

// ---------------------------------------------------------------------------
// Icon registry — mapea el string del mock-data al componente lucide
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Bitcoin,
  TrendingUp,
  Tag,
  Bookmark,
  RefreshCcw,
  BarChart2,
};

// ---------------------------------------------------------------------------
// NavItem — un solo ítem de navegación
// ---------------------------------------------------------------------------

interface NavItemProps {
  label: string;
  href: string;
  icon: string;
  collapsed: boolean;
  active: boolean;
  onClick?: () => void;
}

function NavItem({ label, href, icon, collapsed, active, onClick }: NavItemProps) {
  const Icon = ICON_MAP[icon] ?? LayoutDashboard;

  return (
    <Link
      href={href as "/"}
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 px-3 py-2 text-sm transition-colors",
        "text-muted-foreground hover:text-foreground hover:bg-muted",
        active && "text-foreground bg-accent/10 border-l-2 border-primary",
        collapsed && "justify-center px-2",
      )}
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// SideNavInner — contenido compartido entre desktop y mobile sheet
// ---------------------------------------------------------------------------

interface SideNavInnerProps {
  collapsed: boolean;
  onCollapse: () => void;
  onItemClick?: () => void;
}

function SideNavInner({ collapsed, onCollapse, onItemClick }: SideNavInnerProps) {
  const t = useTranslations("dashboard.nav");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto py-3" aria-label="Main navigation">
        {NAV_SECTIONS.map((section) => (
          <div key={section.titleEn} className="mb-4">
            {collapsed ? (
              <div className="h-3" />
            ) : (
              <p className="px-3 pb-1 text-[10px] font-mono font-semibold tracking-widest uppercase text-muted-foreground">
                {locale === "es" ? section.titleEs : section.titleEn}
              </p>
            )}
            {section.items.map((item) => (
              <NavItem
                key={item.href}
                label={locale === "es" ? item.labelEs : item.labelEn}
                href={item.href}
                icon={item.icon}
                collapsed={collapsed}
                active={pathname === item.href}
                onClick={onItemClick}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border">
        <Link
          href={"/settings" as "/"}
          title={collapsed ? t("settings") : undefined}
          onClick={onItemClick}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted",
            pathname === "/settings" &&
              "text-foreground bg-accent/10 border-l-2 border-primary",
            collapsed && "justify-center px-2",
          )}
        >
          <Settings className="size-4 shrink-0" />
          {!collapsed && <span>{t("settings")}</span>}
        </Link>

        {/* Collapse toggle */}
        <button
          onClick={onCollapse}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted border-t border-border transition-colors",
            collapsed && "justify-center px-2",
          )}
        >
          {collapsed ? (
            <ChevronRight className="size-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="size-4 shrink-0" />
              <span className="text-xs font-mono tracking-widest uppercase">
                {t("collapse")}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SideNav — sidebar desktop (lado derecho, oculto en mobile)
// ---------------------------------------------------------------------------

export function SideNav() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("fintrack-nav-collapsed");
    if (saved !== null) setCollapsed(saved === "true");
  }, []);

  const handleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("fintrack-nav-collapsed", String(next));
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-64",
      )}
      aria-label="Side navigation"
    >
      <SideNavInner collapsed={collapsed} onCollapse={handleCollapse} />
    </aside>
  );
}

// ---------------------------------------------------------------------------
// SideNavSheetContent — contenido para el Sheet mobile (siempre expandido)
// ---------------------------------------------------------------------------

export function SideNavSheetContent({ onClose }: { onClose: () => void }) {
  return (
    <SideNavInner
      collapsed={false}
      onCollapse={onClose}
      onItemClick={onClose}
    />
  );
}
