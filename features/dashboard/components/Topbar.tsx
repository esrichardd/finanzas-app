"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Sun,
  Moon,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/core/lib/i18n/navigation";
import { Button } from "@/core/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { cn } from "@/core/lib/shadcn/libs/utils";
import { useCurrency, type Currency } from "@/core/lib/currency-context";
import { logoutAction } from "@/features/auth/actions/logout";

const CURRENCIES: Currency[] = ["USD", "EUR", "ARS", "BRL"];

interface TopbarProps {
  userName: string;
  userEmail: string;
  avatarInitial: string;
  onMenuClick: () => void;
}

export function Topbar({
  userName,
  userEmail,
  avatarInitial,
  onMenuClick,
}: TopbarProps) {
  const t = useTranslations("dashboard.topbar");
  const { resolvedTheme, setTheme } = useTheme();
  const locale = useLocale();
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  // Hard navigation on locale change — same pattern que ThemeLangToggle
  const toggleLang = () => {
    const next = locale === "en" ? "es" : "en";
    window.location.assign(`/${next}${pathname}`);
  };

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-background flex items-center px-4 gap-4">
      {/* Mobile menu trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden shrink-0"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </Button>

      {/* Logo */}
      <div className="flex items-center gap-2 mr-auto">
        <div className="flex items-center justify-center w-7 h-7 bg-primary">
          <TrendingUp className="size-4 text-primary-foreground" />
        </div>
        <span className="font-mono text-sm font-bold tracking-widest uppercase text-foreground select-none">
          FINTRACK
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1">
        {/* Currency selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="font-mono text-xs tracking-widest uppercase gap-1 h-8 px-2"
            >
              {currency}
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-28">
            {CURRENCIES.map((c) => (
              <DropdownMenuItem
                key={c}
                onClick={() => setCurrency(c)}
                className={cn(
                  "font-mono text-xs tracking-widest uppercase justify-center",
                  c === currency && "bg-accent text-accent-foreground",
                )}
              >
                {c}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Lang toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLang}
          className="font-mono text-xs tracking-widest uppercase h-8 px-2"
          aria-label="Toggle language"
        >
          {locale === "en" ? "ES" : "EN"}
        </Button>

        {/* Theme toggle — mounted guard to avoid hydration mismatch */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {mounted ? (
            isDark ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )
          ) : (
            <span className="size-4" />
          )}
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 ml-1"
              aria-label="User menu"
            >
              <div className="flex items-center justify-center w-7 h-7 bg-primary text-primary-foreground font-mono text-xs font-bold">
                {avatarInitial}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <div className="px-2 py-1.5 border-b border-border mb-1">
              <p className="text-xs font-mono font-semibold tracking-wide text-foreground truncate">
                {userName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {userEmail}
              </p>
            </div>
            <DropdownMenuItem className="gap-2 text-xs">
              <User className="size-3.5" />
              {t("profile")}
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-xs">
              <Settings className="size-3.5" />
              {t("settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="gap-2 text-xs"
              onClick={() => logoutAction()}
            >
              <LogOut className="size-3.5" />
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
