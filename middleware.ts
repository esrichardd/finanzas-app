import createIntlMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./core/lib/i18n/routing";
import { updateSession } from "./core/lib/supabase/middleware";

const handleI18n = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. next-intl resuelve el locale (puede emitir redirect a /es, /en, etc.).
  const response = handleI18n(request);

  // 2. Sobre ese mismo response, supabase escribe cookies de sesión refrescadas.
  return updateSession(request, response);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
