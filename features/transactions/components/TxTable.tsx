"use client";

import { useTranslations } from "next-intl";
import { Pencil } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { useCurrency } from "@/core/lib/currency-context";
import {
  formatCurrency,
  formatShortDate,
} from "@/features/dashboard/lib/formatters";
import { cn } from "@/core/lib/shadcn/libs/utils";
import type { Transaction, TxType } from "@/features/dashboard/types";

interface TxTableProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
}

const TYPE_BADGE: Record<TxType, string> = {
  income: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  expense: "bg-red-500/10 text-red-500 border-red-500/20",
  transfer: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  crypto: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

export function TxTable({ transactions, onEdit }: TxTableProps) {
  const t = useTranslations("transactions");
  const { currency } = useCurrency();

  if (transactions.length === 0) {
    return (
      <div className="border border-border rounded-md py-16 text-center">
        <p className="text-sm text-muted-foreground">{t("table.noResults")}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {t("table.noResultsHint")}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-md overflow-x-auto">
      <table className="w-full min-w-[700px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground w-20">
              {t("table.date")}
            </th>
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground w-28">
              {t("form.type")}
            </th>
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
              {t("table.description")}
            </th>
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden sm:table-cell">
              {t("table.category")}
            </th>
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden md:table-cell">
              {t("table.account")}
            </th>
            <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-12">
              {t("form.currency")}
            </th>
            <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">
              {t("table.amount")}
            </th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, i) => (
            <tr
              key={tx.id}
              className={cn(
                "border-b border-border last:border-0 hover:bg-muted/30 transition-colors group",
                i % 2 === 1 && "bg-muted/10",
              )}
            >
              <td className="px-4 py-3 text-xs text-muted-foreground font-mono whitespace-nowrap">
                {formatShortDate(tx.date)}
              </td>
              <td className="px-4 py-3">
                <Badge
                  variant="outline"
                  className={cn("text-[10px] px-1.5 py-0", TYPE_BADGE[tx.type])}
                >
                  {t(`types.${tx.type}`)}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <span className="font-medium truncate max-w-48 block">
                  {tx.description}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                {tx.category}
              </td>
              <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                {tx.account ?? "—"}
              </td>
              <td className="px-4 py-3 text-right text-xs text-muted-foreground font-mono">
                {tx.currency}
              </td>
              <td
                className={cn(
                  "px-4 py-3 text-right font-semibold font-mono whitespace-nowrap",
                  tx.amount >= 0 ? "text-emerald-500" : "text-foreground",
                )}
              >
                {tx.amount >= 0 ? "+" : ""}
                {formatCurrency(Math.abs(tx.amount), currency)}
              </td>
              <td className="px-2 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onEdit(tx)}
                  aria-label="Edit transaction"
                >
                  <Pencil className="size-3.5" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
