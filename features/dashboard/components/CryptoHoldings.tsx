"use client";

import { Bitcoin } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CryptoHolding } from "@/features/dashboard/types";

interface CryptoHoldingsProps {
  holdings: CryptoHolding[];
}

export function CryptoHoldings({ holdings }: CryptoHoldingsProps) {
  const t = useTranslations("dashboard.cryptoHoldings");

  return (
    <div className="bg-card border border-border p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Bitcoin className="size-3.5 text-primary" />
        <p className="text-xs font-mono font-semibold tracking-widest uppercase text-muted-foreground">
          {t("title")}
        </p>
      </div>
      {holdings.map((holding) => (
        <div key={holding.id} className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-xs font-bold text-foreground w-12 shrink-0">
              {holding.symbol}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {holding.name}
            </span>
          </div>
          <div className="flex flex-col items-end shrink-0 pl-2">
            <span className="font-mono text-xs text-foreground tabular-nums">
              {holding.valueUsd != null
                ? `$${holding.valueUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                : "—"}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
              {holding.amount} {holding.symbol}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
