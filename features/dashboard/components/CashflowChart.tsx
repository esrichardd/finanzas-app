"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/core/components/ui/skeleton";
import { CASHFLOW_DATA } from "@/features/dashboard/lib/mock-data";

interface CashflowChartProps {
  loading?: boolean;
}

const AXIS_TICK_STYLE = {
  fontSize: 10,
  fontFamily: "var(--font-ibm-plex-mono)",
  fill: "var(--muted-foreground)",
};

const TOOLTIP_STYLE = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 0,
  fontSize: 11,
  fontFamily: "var(--font-ibm-plex-mono)",
};

export function CashflowChart({ loading }: CashflowChartProps) {
  const t = useTranslations("dashboard.cashflow");

  if (loading) {
    return (
      <div className="bg-card border border-border p-4 flex flex-col gap-3">
        <Skeleton className="h-3 w-44" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border p-4 flex flex-col gap-3">
      <p className="text-xs font-mono font-semibold tracking-widest uppercase text-muted-foreground">
        {t("title")}
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={CASHFLOW_DATA} barCategoryGap="30%" barGap={2}>
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="month"
            tick={AXIS_TICK_STYLE}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={AXIS_TICK_STYLE}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            width={38}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value, name) => [
              typeof value === "number" ? `$${value.toLocaleString()}` : "",
              name === "income" ? t("income") : t("expenses"),
            ]}
          />
          <Legend
            formatter={(value) => (
              <span
                style={{ ...AXIS_TICK_STYLE, color: "var(--muted-foreground)" }}
              >
                {value === "income" ? t("income") : t("expenses")}
              </span>
            )}
            iconSize={8}
          />
          <Bar dataKey="income" fill="#2563EB" radius={0} />
          <Bar dataKey="expenses" fill="#1E3A5F" radius={0} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
