import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase para uso en server components, server actions y route
 * handlers. Lee y escribe cookies a través del store de `next/headers` para
 * que la sesión persista entre requests.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server components no pueden setear cookies; ignoramos. El
            // middleware se encarga del refresh real, así que esto solo
            // pasa cuando un server component intenta refrescar (no rompe
            // nada porque el middleware ya corrió antes).
          }
        },
      },
    },
  );
}
