"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
} from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";

interface OnboardingBannerProps {
  show: boolean;
}

export function OnboardingBanner({ show }: OnboardingBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const t = useTranslations("dashboard.onboarding");

  if (!show || dismissed) return null;

  return (
    <Alert className="border-primary/40 bg-primary/5">
      <Sparkles className="size-4 text-primary" />
      <AlertTitle className="text-sm font-semibold text-foreground">
        {t("title")}
      </AlertTitle>
      <AlertDescription>{t("body")}</AlertDescription>
      <AlertAction className="flex items-center gap-2">
        <Button
          size="sm"
          className="font-mono text-xs tracking-widest uppercase h-7 px-3"
        >
          {t("cta")}
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
        >
          <X className="size-3.5" />
        </Button>
      </AlertAction>
    </Alert>
  );
}
