"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Bitcoin,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/core/components/ui/skeleton";
import { Badge } from "@/core/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/core/components/ui/table";
import { cn } from "@/core/lib/shadcn/libs/utils";
import { formatShortDate } from "@/features/dashboard/lib/formatters";
import {
  RECENT_TRANSACTIONS,
  type TxType,
} from "@/features/dashboard/lib/mock-data";

interface TransactionsTableProps {
  loading?: boolean;
}

const TX_ICON: Record<TxType, React.ElementType> = {
  income: ArrowDownLeft,
  expense: ArrowUpRight,
  transfer: ArrowLeftRight,
  crypto: Bitcoin,
};

const TX_COLOR: Record<TxType, string> = {
  income: "text-emerald-500",
  expense: "text-red-500",
  transfer: "text-blue-400",
  crypto: "text-amber-400",
};

export function TransactionsTable({ loading }: TransactionsTableProps) {
  const t = useTranslations("dashboard.transactions");

  if (loading) {
    return (
      <div className="bg-card border border-border p-4 flex flex-col gap-3">
        <Skeleton className="h-3 w-40" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between gap-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border flex flex-col">
      <div className="px-4 pt-4 pb-2">
        <p className="text-xs font-mono font-semibold tracking-widest uppercase text-muted-foreground">
          {t("title")}
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 font-mono text-[10px] tracking-wider uppercase text-muted-foreground w-24">
              {t("date")}
            </TableHead>
            <TableHead className="px-4 font-mono text-[10px] tracking-wider uppercase text-muted-foreground">
              {t("description")}
            </TableHead>
            <TableHead className="px-4 font-mono text-[10px] tracking-wider uppercase text-muted-foreground hidden sm:table-cell">
              {t("category")}
            </TableHead>
            <TableHead className="px-4 font-mono text-[10px] tracking-wider uppercase text-muted-foreground text-right">
              {t("amount")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {RECENT_TRANSACTIONS.map((tx) => {
            const Icon = TX_ICON[tx.type];
            const isPositive = tx.amount > 0;

            return (
              <TableRow key={tx.id}>
                <TableCell className="px-4 font-mono text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                  {formatShortDate(tx.date)}
                </TableCell>
                <TableCell className="px-4">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={cn("size-3 shrink-0", TX_COLOR[tx.type])}
                    />
                    <span className="text-xs text-foreground truncate max-w-[160px]">
                      {tx.description}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-4 hidden sm:table-cell">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] rounded-none"
                  >
                    {tx.category}
                  </Badge>
                </TableCell>
                <TableCell
                  className={cn(
                    "px-4 font-mono text-xs tabular-nums text-right",
                    isPositive ? "text-emerald-500" : "text-red-500",
                  )}
                >
                  {isPositive ? "+" : ""}
                  {tx.currency === "USD" ? "$" : ""}
                  {Math.abs(tx.amount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
