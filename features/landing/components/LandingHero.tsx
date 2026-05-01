import { TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/core/lib/i18n/navigation";
import { ThemeLangToggle } from "@/features/auth/components/ThemeLangToggle";

export function LandingHero() {
  const t = useTranslations("landing");

  return (
    <section className="relative min-h-[640px] bg-[#0A0F1E] text-[#EFF6FF] overflow-hidden flex">
      {/* Grid background texture */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,99,235,1) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Glow orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#2563EB] opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[480px] h-[480px] bg-[#1E3A5F] opacity-20 blur-3xl pointer-events-none" />

      {/* Logo (absolute, top-left) */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2 animate-fade-in-up">
        <div className="w-8 h-8 bg-[#2563EB] flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        <span className="font-mono text-xl font-bold tracking-widest">
          {t("logo")}
        </span>
      </div>

      {/* Theme + lang toggle (absolute, top-right) */}
      <ThemeLangToggle />

      {/* Hero content centered vertically */}
      <div className="relative z-10 flex flex-1 items-center px-6 py-24 lg:px-16">
        <div className="w-full max-w-4xl mx-auto">
          <h1 className="font-mono text-4xl lg:text-6xl font-bold leading-tight text-balance mb-6 animate-fade-in-up animate-delay-100">
            {t("hero.title")}
          </h1>
          <p className="text-base lg:text-lg leading-relaxed text-[#93b4d8] mb-10 max-w-2xl animate-fade-in-up animate-delay-200">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up animate-delay-300">
            {/* Primary CTA — Sign up */}
            <Link
              href="/register"
              className="h-11 inline-flex items-center justify-center px-6 bg-[#2563EB] text-[#EFF6FF] font-mono text-sm font-semibold uppercase tracking-widest border border-[#2563EB] hover:bg-transparent hover:text-[#2563EB] transition-all duration-200"
            >
              {t("hero.signUp")}
            </Link>
            {/* Secondary CTA — Sign in */}
            <Link
              href="/login"
              className="h-11 inline-flex items-center justify-center px-6 bg-transparent text-[#EFF6FF] font-mono text-sm font-semibold uppercase tracking-widest border border-[#1E3A5F] hover:border-[#2563EB] hover:text-[#2563EB] transition-all duration-200"
            >
              {t("hero.signIn")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
