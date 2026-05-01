"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/core/components/ui/button";
import { AppleIcon, GoogleIcon } from "@/core/components/icons/social";
import { Link } from "@/core/lib/i18n/navigation";
import { AuthDivider } from "./AuthDivider";
import { AuthField } from "./AuthField";
import { PasswordField } from "./PasswordField";
import { SocialButton } from "./SocialButton";

export function RegisterForm() {
  const t = useTranslations("auth.register");

  return (
    <div className="flex flex-col justify-center w-full max-w-md mx-auto px-6 py-16 lg:py-8 gap-5">
      {/* Title */}
      <div className="animate-fade-in-up">
        <h2 className="font-mono text-2xl font-bold text-foreground">
          {t("title")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {/* Social buttons */}
      <div className="flex flex-col gap-3 animate-fade-in-up animate-delay-100">
        <SocialButton icon={<GoogleIcon />}>{t("socialGoogle")}</SocialButton>
        <SocialButton icon={<AppleIcon />}>{t("socialApple")}</SocialButton>
      </div>

      {/* Divider */}
      <div className="animate-fade-in-up animate-delay-200">
        <AuthDivider>{t("divider")}</AuthDivider>
      </div>

      {/* Form */}
      <form
        className="flex flex-col gap-4 animate-fade-in-up animate-delay-300"
        onSubmit={(e) => e.preventDefault()}
        noValidate
      >
        <div className="grid grid-cols-2 gap-3">
          <AuthField
            id="reg-first-name"
            label={t("firstNameLabel")}
            type="text"
            name="firstName"
            autoComplete="given-name"
            placeholder={t("firstNamePlaceholder")}
          />
          <AuthField
            id="reg-last-name"
            label={t("lastNameLabel")}
            type="text"
            name="lastName"
            autoComplete="family-name"
            placeholder={t("lastNamePlaceholder")}
          />
        </div>

        <AuthField
          id="reg-email"
          label={t("emailLabel")}
          type="email"
          name="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
        />

        <PasswordField
          id="reg-password"
          label={t("passwordLabel")}
          name="password"
          autoComplete="new-password"
          placeholder={t("passwordPlaceholder")}
          showLabel={t("showPassword")}
          hideLabel={t("hidePassword")}
        />

        <PasswordField
          id="reg-confirm-password"
          label={t("confirmPasswordLabel")}
          name="confirmPassword"
          autoComplete="new-password"
          placeholder={t("confirmPasswordPlaceholder")}
          showLabel={t("showPassword")}
          hideLabel={t("hidePassword")}
        />

        <Button
          type="submit"
          size="xl"
          className="w-full mt-1 font-mono text-sm font-semibold uppercase tracking-widest border border-primary hover:bg-transparent hover:text-primary"
        >
          {t("submit")}
        </Button>
      </form>

      {/* Footer link */}
      <p className="text-sm text-muted-foreground text-center animate-fade-in-up animate-delay-400">
        {t("alreadyHaveAccount")}{" "}
        <Link
          href="/login"
          className="font-mono font-semibold text-primary hover:underline"
        >
          {t("loginCta")}
        </Link>
      </p>
    </div>
  );
}
