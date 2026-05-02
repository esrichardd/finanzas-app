"use client";

import { QuickActions } from "./QuickActions";
import { KpiGrid } from "./KpiGrid";
import { FiatAccounts } from "./FiatAccounts";
import { CryptoHoldings } from "./CryptoHoldings";
import { ExpenseDonut } from "./ExpenseDonut";
import { CashflowChart } from "./CashflowChart";
import { TransactionsTable } from "./TransactionsTable";
import { OnboardingBanner } from "./OnboardingBanner";
import type {
  KpiDataPoint,
  FiatAccount,
  CryptoHolding,
  ExpenseCategory,
  CashflowEntry,
  Transaction,
} from "@/features/dashboard/types";

interface DashboardContentProps {
  userName: string;
  showOnboarding?: boolean;
  kpiData: Record<
    "netWorth" | "monthIncome" | "monthExpenses" | "monthFees",
    KpiDataPoint
  >;
  fiatAccounts: FiatAccount[];
  cryptoHoldings: CryptoHolding[];
  expenseCategories: ExpenseCategory[];
  cashflowData: CashflowEntry[];
  recentTransactions: Transaction[];
}

export function DashboardContent({
  userName,
  showOnboarding = false,
  kpiData,
  fiatAccounts,
  cryptoHoldings,
  expenseCategories,
  cashflowData,
  recentTransactions,
}: DashboardContentProps) {
  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-full">
      <OnboardingBanner show={showOnboarding} />

      <QuickActions userName={userName} />

      <KpiGrid data={kpiData} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FiatAccounts accounts={fiatAccounts} />
        <CryptoHoldings holdings={cryptoHoldings} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ExpenseDonut categories={expenseCategories} />
        <CashflowChart data={cashflowData} />
      </div>

      <TransactionsTable transactions={recentTransactions} />
    </div>
  );
}
