"use client";

import { useTranslations } from "next-intl";
import { useCurrency } from "@/core/lib/currency-context";
import { formatCurrency } from "@/features/dashboard/lib/formatters";
import type { Transaction } from "@/features/dashboard/types";

interface TxSummaryStripProps {
  transactions: Transaction[];
}

export function TxSummaryStrip({ transactions }: TxSummaryStripProps) {
  const t = useTranslations("transactions.summary");
  const { currency } = useCurrency();

  let income = 0;
  let expenses = 0;

  for (const tx of transactions) {
    if (tx.amount > 0) income += tx.amount;
    else expenses += Math.abs(tx.amount);
  }

  const net = income - expenses;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="border border-border rounded-md px-4 py-3">
        <p className="text-xs text-muted-foreground mb-0.5">{t("income")}</p>
        <p className="text-sm font-semibold text-emerald-500">
          +{formatCurrency(income, currency)}
        </p>
      </div>
      <div className="border border-border rounded-md px-4 py-3">
        <p className="text-xs text-muted-foreground mb-0.5">{t("expenses")}</p>
        <p className="text-sm font-semibold text-red-500">
          -{formatCurrency(expenses, currency)}
        </p>
      </div>
      <div className="border border-border rounded-md px-4 py-3">
        <p className="text-xs text-muted-foreground mb-0.5">{t("net")}</p>
        <p
          className={`text-sm font-semibold ${
            net >= 0 ? "text-emerald-500" : "text-red-500"
          }`}
        >
          {net >= 0 ? "+" : ""}
          {formatCurrency(net, currency)}
        </p>
      </div>
    </div>
  );
}
