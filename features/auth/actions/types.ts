import type { ZodError } from "zod";

/**
 * Estado que devuelven las server actions de auth, consumido por
 * `useActionState` en los forms.
 *
 * - `error`       → mensaje global (ej. credenciales inválidas, email duplicado).
 *                   Es una key dentro de `auth.errors` del i18n.
 * - `fieldErrors` → primer error por campo (key i18n).
 */
export type AuthFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Aplana los errores de un Zod parse al shape `{ campo: keyI18n }`.
 * Solo guardamos el primer error por campo: es lo que mostramos en UI.
 *
 * Iteramos `issues` directamente (en lugar de `flatten()`) para no depender
 * de detalles que cambiaron entre Zod 3 y 4.
 */
export function flattenZodErrors(zodError: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of zodError.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) {
      out[key] = issue.message;
    }
  }
  return out;
}
