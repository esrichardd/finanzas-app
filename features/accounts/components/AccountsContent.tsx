"use client";

import { useState, useMemo } from "react";
import { useRouter } from "@/core/lib/i18n/navigation";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { AccountCard } from "./AccountCard";
import { AccountFormModal } from "./AccountFormModal";
import { formatCurrency } from "@/features/dashboard/lib/formatters";
import type {
  Account,
  AccountGroup,
  AccountType,
} from "@/features/accounts/types";

interface AccountsContentProps {
  accounts: Account[];
  accountTypes: AccountType[];
}

export function AccountsContent({
  accounts,
  accountTypes,
}: AccountsContentProps) {
  const t = useTranslations("accounts");
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);

  // Agrupar por moneda, ordenar currencies con más cuentas primero
  const groups = useMemo<AccountGroup[]>(() => {
    const map = new Map<string, Account[]>();
    for (const acc of accounts) {
      const list = map.get(acc.currency) ?? [];
      list.push(acc);
      map.set(acc.currency, list);
    }
    return Array.from(map.entries())
      .map(([currency, accs]) => ({
        currency,
        total: accs.reduce((s, a) => s + a.balance, 0),
        accounts: accs,
      }))
      .sort((a, b) => b.accounts.length - a.accounts.length);
  }, [accounts]);

  const openCreate = () => {
    setEditAccount(null);
    setModalOpen(true);
  };

  const openEdit = (account: Account) => {
    setEditAccount(account);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-full">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <Button size="sm" className="h-8 gap-1.5" onClick={openCreate}>
          <Plus className="size-3.5" />
          {t("newAccount")}
        </Button>
      </div>

      {/* Empty state */}
      {accounts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-lg gap-3">
          <p className="text-sm text-muted-foreground">{t("noAccounts")}</p>
          <p className="text-xs text-muted-foreground">{t("noAccountsHint")}</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-2 gap-1.5"
            onClick={openCreate}
          >
            <Plus className="size-3.5" />
            {t("newAccount")}
          </Button>
        </div>
      )}

      {/* Currency groups */}
      {groups.map((group) => (
        <section key={group.currency} className="flex flex-col gap-3">
          {/* Section header */}
          <div className="flex items-baseline gap-3">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground">
              {group.currency}
            </h2>
            <span className="text-sm font-semibold">
              {formatCurrency(group.total, group.currency)}
            </span>
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">
              {group.accounts.length}{" "}
              {group.accounts.length === 1 ? "account" : "accounts"}
            </span>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {group.accounts.map((acc) => (
              <AccountCard key={acc.id} account={acc} onEdit={openEdit} />
            ))}
          </div>
        </section>
      ))}

      <AccountFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => router.refresh()}
        editAccount={editAccount}
        accountTypes={accountTypes}
      />
    </div>
  );
}
