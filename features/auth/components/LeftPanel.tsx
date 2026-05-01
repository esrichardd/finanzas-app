import { TrendingUp, PieChart, BarChart3, Globe } from "lucide-react";
import { useTranslations } from "next-intl";

const FEATURES = [
  { key: "incomeTracking", Icon: TrendingUp },
  { key: "expenseControl", Icon: PieChart },
  { key: "financialReports", Icon: BarChart3 },
  { key: "multiCurrency", Icon: Globe },
] as const;

export function LeftPanel() {
  const t = useTranslations("auth.leftPanel");

  return (
    <div className="hidden lg:flex flex-col justify-between w-2/5 min-h-screen bg-[#0A0F1E] text-[#EFF6FF] p-10 relative overflow-hidden">
      {/* Grid background texture */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,99,235,1) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Subtle glow orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#2563EB] opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#1E3A5F] opacity-20 blur-2xl pointer-events-none" />

      <div className="relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-16 animate-fade-in-up">
          <div className="w-8 h-8 bg-[#2563EB] flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-mono text-xl font-bold tracking-widest text-[#EFF6FF]">
            {t("logo")}
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-mono text-3xl font-bold leading-tight text-balance mb-4 animate-fade-in-up animate-delay-100">
          {t("headline")}
        </h1>
        <p className="text-sm leading-relaxed text-[#93b4d8] mb-12 animate-fade-in-up animate-delay-200">
          {t("subtitle")}
        </p>

        {/* Feature list */}
        <ul className="space-y-6">
          {FEATURES.map(({ key, Icon }, i) => (
            <li
              key={key}
              className={`flex items-start gap-4 animate-fade-in-up animate-delay-${(i + 3) * 100}`}
            >
              <div className="w-9 h-9 bg-[#1E3A5F] border border-[#2563EB]/30 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-[#2563EB]" />
              </div>
              <div>
                <p className="font-mono text-sm font-semibold text-[#EFF6FF]">
                  {t(`features.${key}.label`)}
                </p>
                <p className="text-xs text-[#93b4d8] leading-relaxed mt-0.5">
                  {t(`features.${key}.desc`)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom badge */}
      <div className="relative z-10 animate-fade-in-up animate-delay-600">
        <div className="border border-[#1E3A5F] bg-[#0f1729] px-4 py-3">
          <p className="font-mono text-[10px] tracking-widest text-[#93b4d8] uppercase">
            {t("badge")}
          </p>
        </div>
      </div>
    </div>
  );
}
