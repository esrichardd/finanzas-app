import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
};

const withNextIntl = createNextIntlPlugin(
  "./core/lib/i18n/request.ts", // ruta explícita al archivo de config
);

export default withNextIntl(nextConfig);
