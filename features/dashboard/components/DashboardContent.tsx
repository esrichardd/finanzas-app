"use client";

import { useState, useEffect } from "react";
import { QuickActions } from "./QuickActions";
import { KpiGrid } from "./KpiGrid";
import { FiatAccounts } from "./FiatAccounts";
import { CryptoHoldings } from "./CryptoHoldings";
import { ExpenseDonut } from "./ExpenseDonut";
import { CashflowChart } from "./CashflowChart";
import { TransactionsTable } from "./TransactionsTable";
import { OnboardingBanner } from "./OnboardingBanner";

interface DashboardContentProps {
  userName: string;
  showOnboarding?: boolean;
}

export function DashboardContent({
  userName,
  showOnboarding = false,
}: DashboardContentProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-full">
      <OnboardingBanner show={showOnboarding} />

      <QuickActions userName={userName} />

      <KpiGrid loading={loading} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FiatAccounts loading={loading} />
        <CryptoHoldings loading={loading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ExpenseDonut loading={loading} />
        <CashflowChart loading={loading} />
      </div>

      <TransactionsTable loading={loading} />
    </div>
  );
}
