"use client";

import { useLocale, useTranslations } from "next-intl";
import { Pencil, ArrowUpRight } from "lucide-react";
import { Link } from "@/core/lib/i18n/navigation";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { formatCurrency } from "@/features/dashboard/lib/formatters";
import { cn } from "@/core/lib/shadcn/libs/utils";
import type { Account } from "@/features/accounts/types";

// Mapa de colores por tipo de cuenta
const TYPE_COLOR: Record<string, string> = {
  bank_account: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  digital_wallet: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  cash: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  credit_card: "bg-red-500/10 text-red-500 border-red-500/20",
  savings: "bg-sky-500/10 text-sky-500 border-sky-500/20",
  investment: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  brokerage: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  prepaid_card: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  crypto_exchange: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  loan: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
}

export function AccountCard({ account, onEdit }: AccountCardProps) {
  const t = useTranslations("accounts");
  const locale = useLocale();

  const typeName = locale === "es" ? account.typeNameEs : account.typeNameEn;
  const typeColor = TYPE_COLOR[account.typeCode] ?? "bg-muted text-muted-foreground border-border";
  const isNegative = account.balance < 0;

  // Link to transactions filtered by account name
  const txHref = `/transactions?account=${encodeURIComponent(account.name)}` as "/";

  return (
    <div className="group relative flex flex-col border border-border rounded-lg p-4 gap-3 bg-card hover:border-primary/40 hover:shadow-sm transition-all duration-200">
      {/* Header: name + edit button */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="font-semibold text-sm truncate">{account.name}</p>
          <Badge
            variant="outline"
            className={cn("text-[10px] px-1.5 py-0 w-fit", typeColor)}
          >
            {typeName}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onEdit(account)}
          aria-label={`Edit ${account.name}`}
        >
          <Pencil className="size-3.5" />
        </Button>
      </div>

      {/* Balance */}
      <div className="flex flex-col gap-0.5">
        <p
          className={cn(
            "text-2xl font-bold font-mono tracking-tight",
            isNegative ? "text-red-500" : "text-foreground",
          )}
        >
          {isNegative ? "" : ""}
          {formatCurrency(Math.abs(account.balance), account.currency)}
        </p>
        <p className="text-xs text-muted-foreground">{account.currency}</p>
      </div>

      {/* Notes (if any) */}
      {account.notes && (
        <p className="text-xs text-muted-foreground italic truncate">{account.notes}</p>
      )}

      {/* Footer: view transactions link */}
      <div className="mt-auto pt-2 border-t border-border/60">
        <Link
          href={txHref}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          {t("viewTransactions")}
          <ArrowUpRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}
