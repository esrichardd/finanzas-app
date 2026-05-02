"use client";

import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { Input } from "@/core/components/ui/input";
import { Button } from "@/core/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import type { TxFilters } from "@/features/transactions/types";

interface TxFiltersBarProps {
  filters: TxFilters;
  accounts: string[];
  onChange: (filters: TxFilters) => void;
}

export function TxFiltersBar({
  filters,
  accounts,
  onChange,
}: TxFiltersBarProps) {
  const t = useTranslations("transactions");

  const set = <K extends keyof TxFilters>(key: K, value: TxFilters[K]) =>
    onChange({ ...filters, [key]: value });

  const hasActiveFilters =
    filters.search !== "" ||
    filters.type !== "all" ||
    filters.account !== "all" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== "";

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-8 h-8 text-sm"
          placeholder={t("filters.search")}
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
        />
      </div>

      {/* Type */}
      <Select
        value={filters.type}
        onValueChange={(v) => set("type", v as TxFilters["type"])}
      >
        <SelectTrigger className="h-8 text-sm w-36">
          <SelectValue placeholder={t("filters.allTypes")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
          <SelectItem value="income">{t("types.income")}</SelectItem>
          <SelectItem value="expense">{t("types.expense")}</SelectItem>
          <SelectItem value="transfer">{t("types.transfer")}</SelectItem>
          <SelectItem value="crypto">{t("types.crypto")}</SelectItem>
        </SelectContent>
      </Select>

      {/* Account */}
      <Select value={filters.account} onValueChange={(v) => set("account", v)}>
        <SelectTrigger className="h-8 text-sm w-44">
          <SelectValue placeholder={t("filters.allAccounts")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filters.allAccounts")}</SelectItem>
          {accounts.map((acc) => (
            <SelectItem key={acc} value={acc}>
              {acc}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date from */}
      <Input
        type="date"
        className="h-8 text-sm w-36"
        value={filters.dateFrom}
        onChange={(e) => set("dateFrom", e.target.value)}
        aria-label={t("filters.from")}
      />

      {/* Date to */}
      <Input
        type="date"
        className="h-8 text-sm w-36"
        value={filters.dateTo}
        onChange={(e) => set("dateTo", e.target.value)}
        aria-label={t("filters.to")}
      />

      {/* Clear */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-muted-foreground"
          onClick={() =>
            onChange({
              search: "",
              type: "all",
              account: "all",
              dateFrom: "",
              dateTo: "",
            })
          }
        >
          <X className="size-3.5 mr-1" />
          {t("filters.clearFilters")}
        </Button>
      )}
    </div>
  );
}
