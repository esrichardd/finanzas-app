"use client";

import { Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import type { FiatAccount } from "@/features/dashboard/types";

interface FiatAccountsProps {
  accounts: FiatAccount[];
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

export function FiatAccounts({ accounts }: FiatAccountsProps) {
  const t = useTranslations("dashboard.fiatAccounts");

  const grouped = groupByCurrency(accounts);

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
