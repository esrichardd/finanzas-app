import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/core/lib/i18n/navigation";

export function VerifyEmailMessage({ email }: { email: string }) {
  const t = useTranslations("auth.verifyEmail");

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-6 py-16 lg:py-0 gap-6 text-center">
      <div className="w-12 h-12 bg-[#1E3A5F] border border-[#2563EB]/30 flex items-center justify-center animate-fade-in-up">
        <Mail className="w-6 h-6 text-primary" />
      </div>

      <div className="animate-fade-in-up animate-delay-100">
        <h2 className="font-mono text-2xl font-bold text-foreground">
          {t("title")}
        </h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          {t("body", { email })}
        </p>
        <p className="text-xs text-muted-foreground mt-3">{t("hint")}</p>
      </div>

      <div className="flex flex-col gap-3 w-full animate-fade-in-up animate-delay-200">
        <Link
          href="/login"
          className="w-full h-11 inline-flex items-center justify-center bg-primary text-primary-foreground font-mono text-sm font-semibold uppercase tracking-widest border border-primary hover:bg-transparent hover:text-primary transition-all duration-200"
        >
          {t("goToLogin")}
        </Link>
        <Link
          href="/register"
          className="font-mono text-xs text-muted-foreground hover:text-primary hover:underline"
        >
          {t("wrongEmail")}
        </Link>
      </div>
    </div>
  );
}
