// Esto se puede generar automáticamente con next-intl si configuras
// el plugin de TypeScript, pero la forma manual también funciona
import type es_common from "../../messages/es/common.json";
import type es_auth from "../../messages/es/auth.json";

export type Messages = {
  common: typeof es_common;
  auth: typeof es_auth;
  // ... resto de namespaces
};

// En global.d.ts en la raíz del proyecto:
declare module "next-intl" {
  interface AppConfig {
    Messages: Messages;
  }
}
