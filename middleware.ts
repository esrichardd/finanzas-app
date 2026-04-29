import createMiddleware from "next-intl/middleware";
import { routing } from "./core/lib/i18n/routing";

export default createMiddleware(routing); // ← le pasas el routing object

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
