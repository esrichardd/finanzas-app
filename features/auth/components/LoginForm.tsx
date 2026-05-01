"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/core/components/ui/button";
import { AppleIcon, GoogleIcon } from "@/core/components/icons/social";
import { Link } from "@/core/lib/i18n/navigation";
import { loginAction } from "../actions/login";
import type { AuthFormState } from "../actions/types";
import { AuthDivider } from "./AuthDivider";
import { AuthField } from "./AuthField";
import { FieldError } from "./FieldError";
import { PasswordField } from "./PasswordField";
import { SocialButton } from "./SocialButton";

const initialState: AuthFormState = {};

export function LoginForm() {
  const t = useTranslations("auth.login");
  const tErrors = useTranslations("auth.errors");
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <div className="flex flex-col justify-center w-full max-w-md mx-auto px-6 py-16 lg:py-0 gap-6">
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
        <div>
          <AuthField
            id="login-email"
            name="email"
            label={t("emailLabel")}
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            aria-invalid={!!state.fieldErrors?.email}
          />
          <FieldError messageKey={state.fieldErrors?.email} />
        </div>

        <div className="flex flex-col gap-1">
          <PasswordField
            id="login-password"
            name="password"
            label={t("passwordLabel")}
            autoComplete="current-password"
            placeholder={t("passwordPlaceholder")}
            showLabel={t("showPassword")}
            hideLabel={t("hidePassword")}
            aria-invalid={!!state.fieldErrors?.password}
          />
          <FieldError messageKey={state.fieldErrors?.password} />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="font-mono text-xs text-primary hover:underline"
            >
              {t("forgotPassword")}
            </Link>
          </div>
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
        {t("noAccount")}{" "}
        <Link
          href="/register"
          className="font-mono font-semibold text-primary hover:underline"
        >
          {t("registerCta")}
        </Link>
      </p>
    </div>
  );
}
