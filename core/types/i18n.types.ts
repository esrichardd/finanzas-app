// Esto se puede generar automáticamente con next-intl si configuras
// el plugin de TypeScript, pero la forma manual también funciona
import type es_common from "../../messages/es/common.json";
import type es_auth from "../../messages/es/auth.json";
import type es_landing from "../../messages/es/landing.json";
import type es_dashboard from "../../messages/es/dashboard.json";
import type es_transactions from "../../messages/es/transactions.json";
import type es_accounts from "../../messages/es/accounts.json";

export type Messages = {
  common: typeof es_common;
  auth: typeof es_auth;
  landing: typeof es_landing;
  dashboard: typeof es_dashboard;
  transactions: typeof es_transactions;
  accounts: typeof es_accounts;
};

// En global.d.ts en la raíz del proyecto:
declare module "next-intl" {
  interface AppConfig {
    Messages: Messages;
  }
}
