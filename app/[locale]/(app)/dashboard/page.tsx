import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/core/lib/supabase/server";
import { DashboardContent } from "@/features/dashboard/components/DashboardContent";
import {
  getKpiData,
  getFiatAccounts,
  getCryptoHoldings,
  getExpenseCategories,
  getCashflowData,
  getRecentTransactions,
} from "@/features/dashboard/lib/queries";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const locale = await getLocale();
    redirect(`/${locale}/login`);
  }

  const userName = user.email?.split("@")[0] ?? "there";

  const [kpiData, fiatAccounts, cryptoHoldings, expenseCategories, cashflowData, recentTransactions] =
    await Promise.all([
      getKpiData(user.id),
      getFiatAccounts(user.id),
      getCryptoHoldings(user.id),
      getExpenseCategories(user.id),
      getCashflowData(user.id),
      getRecentTransactions(user.id),
    ]);

  return (
    <DashboardContent
      userName={userName}
      kpiData={kpiData}
      fiatAccounts={fiatAccounts}
      cryptoHoldings={cryptoHoldings}
      expenseCategories={expenseCategories}
      cashflowData={cashflowData}
      recentTransactions={recentTransactions}
    />
  );
}
