"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/core/lib/i18n/navigation";

export function ThemeLangToggle() {
  const tTheme = useTranslations("auth.themeToggle");
  const tLang = useTranslations("auth.langToggle");
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  // Until mounted, server and first client render don't agree on resolvedTheme
  // (next-themes reads localStorage synchronously on the client to avoid the
  // theme flash, but on the server it's undefined). Use a neutral aria-label
  // for that first paint to match SSR output, then upgrade post-mount.
  const themeAriaLabel = mounted
    ? isDark
      ? tTheme("switchToLight")
      : tTheme("switchToDark")
    : tTheme("toggle");

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");
  const toggleLang = () => {
    const next = locale === "en" ? "es" : "en";
    // Hard navigation on locale change: avoids re-rendering the [locale] root
    // layout client-side, which triggers a React 19 warning about the inline
    // <script> that next-themes injects inside ThemeProvider.
    window.location.assign(`/${next}${pathname}`);
  };

  return (
    <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
      {/* Language toggle */}
      <button
        type="button"
        onClick={toggleLang}
        aria-label={locale === "en" ? tLang("switchToEs") : tLang("switchToEn")}
        className="flex items-center gap-1 px-3 py-1.5 border border-border bg-card text-card-foreground font-mono text-xs font-semibold tracking-widest hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-200"
      >
        {locale === "en" ? "ES" : "EN"}
      </button>

      {/* Theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={themeAriaLabel}
        className="w-9 h-9 flex items-center justify-center border border-border bg-card text-card-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-200"
      >
        {mounted ? (
          isDark ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )
        ) : (
          <span className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
