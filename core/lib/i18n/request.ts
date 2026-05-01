import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // En la nueva API es requestLocale, no locale directamente
  let locale = await requestLocale;

  // Fallback al default si no es válido
  if (
    !locale ||
    !routing.locales.includes(locale as (typeof routing.locales)[number])
  ) {
    locale = routing.defaultLocale;
  }

  // Carga cada archivo de mensajes del locale activo
  const [common, auth, landing, dashboard] = await Promise.all([
    import(`../../../messages/${locale}/common.json`),
    import(`../../../messages/${locale}/auth.json`),
    import(`../../../messages/${locale}/landing.json`),
    import(`../../../messages/${locale}/dashboard.json`),
  ]);

  return {
    locale,
    messages: {
      common: common.default,
      auth: auth.default,
      landing: landing.default,
      dashboard: dashboard.default,
    },
  };
});
