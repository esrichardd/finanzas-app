import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { VerifyEmailMessage } from "@/features/auth/components/VerifyEmailMessage";

type Props = {
  searchParams: Promise<{ email?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { email } = await searchParams;

  // Si llegan acá sin email en el query, no tiene sentido mostrar la pantalla.
  // Volvemos a register para que el usuario complete el flow desde el inicio.
  if (!email) {
    const locale = await getLocale();
    redirect(`/${locale}/register`);
  }

  return <VerifyEmailMessage email={email} />;
}
