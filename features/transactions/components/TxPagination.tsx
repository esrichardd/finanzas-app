"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/core/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TxPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function TxPagination({
  page,
  pageSize,
  total,
  onPageChange,
}: TxPaginationProps) {
  const t = useTranslations("transactions.pagination");

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-muted-foreground">
        {t("showing", { from, to, total })}
      </p>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label={t("prev")}
        >
          <ChevronLeft className="size-3.5" />
          <span className="ml-1 text-xs hidden sm:inline">{t("prev")}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label={t("next")}
        >
          <span className="mr-1 text-xs hidden sm:inline">{t("next")}</span>
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
