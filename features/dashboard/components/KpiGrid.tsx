"use client";

import { useTranslations } from "next-intl";
import { KpiCard } from "./KpiCard";
import { useCurrency } from "@/core/lib/currency-context";
import { formatCurrency } from "@/features/dashboard/lib/formatters";
import type { KpiDataPoint } from "@/features/dashboard/types";

interface KpiGridProps {
  data: Record<"netWorth" | "monthIncome" | "monthExpenses" | "monthFees", KpiDataPoint>;
}

export function KpiGrid({ data }: KpiGridProps) {
  const t = useTranslations("dashboard.kpi");
  const { currency } = useCurrency();

  const cards = [
    { label: t("netWorth"), ...data.netWorth },
    { label: t("monthIncome"), ...data.monthIncome },
    { label: t("monthExpenses"), ...data.monthExpenses },
    { label: t("monthFees"), ...data.monthFees },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <KpiCard
          key={card.label}
          label={card.label}
          value={formatCurrency(card.value, currency)}
          delta={card.delta}
          deltaLabel={t("vsPrevMonth")}
        />
      ))}
    </div>
  );
}
