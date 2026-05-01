import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresca la sesión de Supabase en cada request.
 *
 * Toma un response base (típicamente el que devuelve `next-intl/middleware`)
 * y le copia las cookies actualizadas que Supabase haya generado durante el
 * refresh. Mutar el response en lugar de crear uno nuevo evita pisar headers
 * que puso el middleware de i18n (locale resolution, redirects, etc.).
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse,
) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Llamar getUser dispara el refresh del access token si está vencido.
  // El resultado lo descartamos: solo nos interesa el side effect en cookies.
  await supabase.auth.getUser();

  return response;
}
