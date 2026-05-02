"use client";

import { useState, useMemo } from "react";
import { useRouter } from "@/core/lib/i18n/navigation";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { TxFiltersBar } from "./TxFiltersBar";
import { TxSummaryStrip } from "./TxSummaryStrip";
import { TxTable } from "./TxTable";
import { TxPagination } from "./TxPagination";
import { TxFormModal } from "./TxFormModal";
import type { Transaction } from "@/features/dashboard/types";
import { DEFAULT_FILTERS } from "@/features/transactions/types";
import type { TxFilters } from "@/features/transactions/types";
import type { FormAccount, FormCategory } from "@/features/transactions/lib/queries";

const PAGE_SIZE = 20;

interface TransactionsContentProps {
  transactions: Transaction[];
  accounts: string[];
  formAccounts: FormAccount[];
  formCategories: FormCategory[];
}

export function TransactionsContent({
  transactions,
  accounts,
  formAccounts,
  formCategories,
}: TransactionsContentProps) {
  const t = useTranslations("transactions");
  const router = useRouter();
  const [filters, setFilters] = useState<TxFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (
        filters.search &&
        !tx.description.toLowerCase().includes(filters.search.toLowerCase()) &&
        !tx.category.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      if (filters.type !== "all" && tx.type !== filters.type) return false;
      if (filters.account !== "all" && tx.account !== filters.account)
        return false;
      if (filters.dateFrom && tx.date < filters.dateFrom) return false;
      if (filters.dateTo && tx.date > filters.dateTo) return false;
      return true;
    });
  }, [transactions, filters]);

  const handleFiltersChange = (next: TxFilters) => {
    setFilters(next);
    setPage(1);
  };

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  const openCreate = () => {
    setEditTx(null);
    setModalOpen(true);
  };

  const openEdit = (tx: Transaction) => {
    setEditTx(tx);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-full">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <Button size="sm" className="h-8 gap-1.5" onClick={openCreate}>
          <Plus className="size-3.5" />
          {t("newTransaction")}
        </Button>
      </div>

      <TxFiltersBar
        filters={filters}
        accounts={accounts}
        onChange={handleFiltersChange}
      />

      <TxSummaryStrip transactions={filtered} />

      <TxTable transactions={paginated} onEdit={openEdit} />

      {filtered.length > PAGE_SIZE && (
        <TxPagination
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onPageChange={setPage}
        />
      )}

      <TxFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        editTx={editTx}
        formAccounts={formAccounts}
        formCategories={formCategories}
      />
    </div>
  );
}
