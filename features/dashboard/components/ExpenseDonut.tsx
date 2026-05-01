"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/core/components/ui/skeleton";
import { EXPENSE_CATEGORIES } from "@/features/dashboard/lib/mock-data";

interface ExpenseDonutProps {
  loading?: boolean;
}

const TOOLTIP_STYLE = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 0,
  fontSize: 11,
  fontFamily: "var(--font-ibm-plex-mono)",
};

export function ExpenseDonut({ loading }: ExpenseDonutProps) {
  const t = useTranslations("dashboard.expenseDonut");

  if (loading) {
    return (
      <div className="bg-card border border-border p-4 flex flex-col gap-3">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const total = EXPENSE_CATEGORIES.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="bg-card border border-border p-4 flex flex-col gap-3">
      <p className="text-xs font-mono font-semibold tracking-widest uppercase text-muted-foreground">
        {t("title")}
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={EXPENSE_CATEGORIES}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {EXPENSE_CATEGORIES.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value) => [
              typeof value === "number" ? `$${value.toLocaleString()}` : "",
              "",
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {EXPENSE_CATEGORIES.map((category) => (
          <div key={category.name} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 shrink-0"
              style={{ background: category.fill }}
            />
            <span className="text-[10px] text-muted-foreground truncate">
              {category.name}
            </span>
            <span className="font-mono text-[10px] text-foreground ml-auto tabular-nums">
              {((category.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
