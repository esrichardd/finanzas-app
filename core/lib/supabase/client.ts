import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para uso en componentes cliente (`"use client"`).
 *
 * Lee la sesión desde cookies que setea el server. No hace falta pasar
 * configuración de cookies acá: `@supabase/ssr` usa `document.cookie`
 * automáticamente.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
