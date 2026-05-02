import { createClient } from "@/core/lib/supabase/server";
import { TransactionsContent } from "@/features/transactions/components/TransactionsContent";
import {
  getAllTransactions,
  getAccountsForForm,
  getCategoriesForForm,
} from "@/features/transactions/lib/queries";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { account: initialAccount } = await searchParams;

  const [transactions, formAccounts, formCategories] = user
    ? await Promise.all([
        getAllTransactions(user.id),
        getAccountsForForm(user.id),
        getCategoriesForForm(user.id),
      ])
    : [[], [], []];

  const accounts = Array.from(
    new Set(transactions.map((tx) => tx.account).filter(Boolean) as string[]),
  ).sort();

  return (
    <TransactionsContent
      transactions={transactions}
      accounts={accounts}
      formAccounts={formAccounts}
      formCategories={formCategories}
      initialAccount={initialAccount}
    />
  );
}
