"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslations } from "next-intl";
import type { ExpenseCategory } from "@/features/dashboard/types";

interface ExpenseDonutProps {
  categories: ExpenseCategory[];
}

const TOOLTIP_STYLE = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 0,
  fontSize: 11,
  fontFamily: "var(--font-ibm-plex-mono)",
};

export function ExpenseDonut({ categories }: ExpenseDonutProps) {
  const t = useTranslations("dashboard.expenseDonut");

  const total = categories.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="bg-card border border-border p-4 flex flex-col gap-3">
      <p className="text-xs font-mono font-semibold tracking-widest uppercase text-muted-foreground">
        {t("title")}
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={categories}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {categories.map((entry, index) => (
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
        {categories.map((category) => (
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
