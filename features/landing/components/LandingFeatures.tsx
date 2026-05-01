import { BarChart3, Globe, PieChart, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

const FEATURES = [
  { key: "incomeTracking", Icon: TrendingUp },
  { key: "expenseControl", Icon: PieChart },
  { key: "financialReports", Icon: BarChart3 },
  { key: "multiCurrency", Icon: Globe },
] as const;

export function LandingFeatures() {
  const t = useTranslations("landing");

  return (
    <section className="bg-background py-20 px-6 lg:px-16">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="font-mono text-3xl lg:text-4xl font-bold text-foreground mb-4 animate-fade-in-up">
            {t("features.headline")}
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto animate-fade-in-up animate-delay-100">
            {t("features.subtitle")}
          </p>
        </div>

        {/* Grid */}
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map(({ key, Icon }, i) => (
            <li
              key={key}
              className={`flex items-start gap-4 p-6 bg-card border border-border animate-fade-in-up animate-delay-${(i + 2) * 100}`}
            >
              <div className="w-10 h-10 bg-secondary border border-primary/30 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-mono text-sm font-semibold text-foreground">
                  {t(`features.${key}.label`)}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                  {t(`features.${key}.desc`)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
