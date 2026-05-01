import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/core/lib/supabase/server";

/**
 * Endpoint al que llega el usuario cuando hace click en el link del email de
 * confirmación. Supabase agrega `?code=xxx` al callback; lo intercambiamos por
 * una sesión (que queda en cookies) y redirigimos al dashboard.
 *
 * Este handler vive bajo /[locale]/auth/callback en lugar de bajo (auth)/
 * porque es un endpoint HTTP, no una página visual: no necesita el layout que
 * pinta LeftPanel + ThemeLangToggle.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? `/${locale}/dashboard`;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Algo falló (código inválido, expirado, etc.). Mandamos a login —
  // el usuario puede reintentar o pedir un nuevo correo desde ahí.
  return NextResponse.redirect(`${origin}/${locale}/login`);
}
