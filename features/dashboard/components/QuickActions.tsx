"use client";

import { PlusCircle, MinusCircle, ArrowLeftRight, Bitcoin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/core/components/ui/button";

interface QuickActionsProps {
  userName: string;
}

export function QuickActions({ userName }: QuickActionsProps) {
  const t = useTranslations("dashboard.quickActions");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 className="text-xl font-semibold text-foreground">
        {t("greeting", { name: userName })}
      </h1>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          className="font-mono text-xs tracking-widest uppercase gap-1.5 h-8"
        >
          <PlusCircle className="size-3.5" />
          {t("income")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="font-mono text-xs tracking-widest uppercase gap-1.5 h-8 border-destructive text-destructive hover:bg-destructive/10"
        >
          <MinusCircle className="size-3.5" />
          {t("expense")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="font-mono text-xs tracking-widest uppercase gap-1.5 h-8"
        >
          <ArrowLeftRight className="size-3.5" />
          {t("transfer")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="font-mono text-xs tracking-widest uppercase gap-1.5 h-8"
        >
          <Bitcoin className="size-3.5" />
          {t("crypto")}
        </Button>
      </div>
    </div>
  );
}
