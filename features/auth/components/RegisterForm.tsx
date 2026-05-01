"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/core/components/ui/button";
import { AppleIcon, GoogleIcon } from "@/core/components/icons/social";
import { Link } from "@/core/lib/i18n/navigation";
import { registerAction } from "../actions/register";
import type { AuthFormState } from "../actions/types";
import { AuthDivider } from "./AuthDivider";
import { AuthField } from "./AuthField";
import { FieldError } from "./FieldError";
import { PasswordField } from "./PasswordField";
import { SocialButton } from "./SocialButton";

const initialState: AuthFormState = {};

export function RegisterForm() {
  const t = useTranslations("auth.register");
  const tErrors = useTranslations("auth.errors");
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState,
  );

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
        action={formAction}
        className="flex flex-col gap-4 animate-fade-in-up animate-delay-300"
        noValidate
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <AuthField
              id="reg-first-name"
              name="firstName"
              label={t("firstNameLabel")}
              type="text"
              autoComplete="given-name"
              placeholder={t("firstNamePlaceholder")}
              aria-invalid={!!state.fieldErrors?.firstName}
            />
            <FieldError messageKey={state.fieldErrors?.firstName} />
          </div>
          <div>
            <AuthField
              id="reg-last-name"
              name="lastName"
              label={t("lastNameLabel")}
              type="text"
              autoComplete="family-name"
              placeholder={t("lastNamePlaceholder")}
              aria-invalid={!!state.fieldErrors?.lastName}
            />
            <FieldError messageKey={state.fieldErrors?.lastName} />
          </div>
        </div>

        <div>
          <AuthField
            id="reg-email"
            name="email"
            label={t("emailLabel")}
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            aria-invalid={!!state.fieldErrors?.email}
          />
          <FieldError messageKey={state.fieldErrors?.email} />
        </div>

        <div>
          <PasswordField
            id="reg-password"
            name="password"
            label={t("passwordLabel")}
            autoComplete="new-password"
            placeholder={t("passwordPlaceholder")}
            showLabel={t("showPassword")}
            hideLabel={t("hidePassword")}
            aria-invalid={!!state.fieldErrors?.password}
          />
          <FieldError messageKey={state.fieldErrors?.password} />
        </div>

        <div>
          <PasswordField
            id="reg-confirm-password"
            name="confirmPassword"
            label={t("confirmPasswordLabel")}
            autoComplete="new-password"
            placeholder={t("confirmPasswordPlaceholder")}
            showLabel={t("showPassword")}
            hideLabel={t("hidePassword")}
            aria-invalid={!!state.fieldErrors?.confirmPassword}
          />
          <FieldError messageKey={state.fieldErrors?.confirmPassword} />
        </div>

        {state.error ? (
          <p
            className="font-mono text-xs text-destructive text-center"
            role="alert"
          >
            {tErrors(state.error as Parameters<typeof tErrors>[0])}
          </p>
        ) : null}

        <Button
          type="submit"
          size="xl"
          disabled={isPending}
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
