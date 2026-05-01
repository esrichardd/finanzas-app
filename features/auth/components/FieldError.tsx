/**
 * Mensaje de error debajo de un AuthField/PasswordField.
 *
 * `messageKey` es una key dentro de `auth.errors` (ej. "fieldRequired"). Si es
 * undefined, no renderiza nada — el caller puede pasarlo sin condicionar.
 */
import { useTranslations } from "next-intl";

export function FieldError({ messageKey }: { messageKey?: string }) {
  const t = useTranslations("auth.errors");
  if (!messageKey) return null;
  return (
    <p className="font-mono text-xs text-destructive mt-1" role="alert">
      {/* messageKey es runtime (viene de Zod), por eso se castea: la lista */}
      {/* de keys válidas vive en messages/{locale}/auth.json#errors. */}
      {t(messageKey as Parameters<typeof t>[0])}
    </p>
  );
}
