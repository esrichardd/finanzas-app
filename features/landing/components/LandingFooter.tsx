import { useTranslations } from "next-intl";

export function LandingFooter() {
  const t = useTranslations("landing");

  return (
    <footer className="bg-background border-t border-border px-6 py-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
          {t("footer.tagline")}
        </p>
        <p className="text-xs text-muted-foreground">{t("footer.rights")}</p>
      </div>
    </footer>
  );
}
