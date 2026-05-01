"use client";

import { Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/core/components/ui/skeleton";
import {
  FIAT_ACCOUNTS,
  type FiatAccount,
} from "@/features/dashboard/lib/mock-data";

interface FiatAccountsProps {
  loading?: boolean;
}

function groupByCurrency(
  accounts: FiatAccount[],
): Record<string, FiatAccount[]> {
  return accounts.reduce<Record<string, FiatAccount[]>>((acc, account) => {
    if (!acc[account.currency]) acc[account.currency] = [];
    acc[account.currency].push(account);
    return acc;
  }, {});
}

export function FiatAccounts({ loading }: FiatAccountsProps) {
  const t = useTranslations("dashboard.fiatAccounts");

  if (loading) {
    return (
      <div className="bg-card border border-border p-4 flex flex-col gap-3">
        <Skeleton className="h-3 w-28" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }

  const grouped = groupByCurrency(FIAT_ACCOUNTS);

  return (
    <div className="bg-card border border-border p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Wallet className="size-3.5 text-primary" />
        <p className="text-xs font-mono font-semibold tracking-widest uppercase text-muted-foreground">
          {t("title")}
        </p>
      </div>
      {Object.entries(grouped).map(([currency, accounts]) => (
        <div key={currency} className="flex flex-col gap-1">
          <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground/60 border-b border-border pb-1">
            {currency}
          </p>
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between py-0.5"
            >
              <span className="text-xs text-foreground truncate pr-2">
                {account.name}
              </span>
              <span className="font-mono text-xs text-foreground tabular-nums shrink-0">
                {account.balance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
