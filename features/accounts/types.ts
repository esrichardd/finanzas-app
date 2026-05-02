export interface Account {
  id: string;
  name: string;
  typeCode: string;
  typeNameEn: string;
  typeNameEs: string;
  currency: string;
  initialBalance: number;
  balance: number; // saldo computado desde v_account_balances
  notes: string | null;
  isArchived: boolean;
}

export interface AccountType {
  code: string;
  nameEn: string;
  nameEs: string;
  isCredit: boolean;
}

// Cuentas agrupadas por moneda para la UI
export interface AccountGroup {
  currency: string;
  total: number;
  accounts: Account[];
}
