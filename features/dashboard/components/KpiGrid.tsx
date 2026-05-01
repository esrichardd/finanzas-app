"use client";

import { useTranslations } from "next-intl";
import { KpiCard } from "./KpiCard";
import { useCurrency } from "@/core/lib/currency-context";
import { formatCurrency } from "@/features/dashboard/lib/formatters";
import { KPI_DATA } from "@/features/dashboard/lib/mock-data";

interface KpiGridProps {
  loading?: boolean;
}

export function KpiGrid({ loading }: KpiGridProps) {
  const t = useTranslations("dashboard.kpi");
  const { currency } = useCurrency();

  const cards = [
    { label: t("netWorth"), ...KPI_DATA.netWorth },
    { label: t("monthIncome"), ...KPI_DATA.monthIncome },
    { label: t("monthExpenses"), ...KPI_DATA.monthExpenses },
    { label: t("monthFees"), ...KPI_DATA.monthFees },
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
          loading={loading}
        />
      ))}
    </div>
  );
}
