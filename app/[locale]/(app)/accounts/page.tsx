import { createClient } from "@/core/lib/supabase/server";
import { AccountsContent } from "@/features/accounts/components/AccountsContent";
import { getAccounts, getAccountTypes } from "@/features/accounts/lib/queries";

export default async function AccountsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [accounts, accountTypes] = user
    ? await Promise.all([getAccounts(user.id), getAccountTypes()])
    : [[], []];

  return <AccountsContent accounts={accounts} accountTypes={accountTypes} />;
}
