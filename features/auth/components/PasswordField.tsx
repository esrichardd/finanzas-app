"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { cn } from "@/core/lib/shadcn/libs/utils";

type PasswordFieldProps = Omit<
  React.ComponentProps<typeof Input>,
  "id" | "type"
> & {
  id: string;
  label: string;
  showLabel: string;
  hideLabel: string;
};

export function PasswordField({
  id,
  label,
  showLabel,
  hideLabel,
  className,
  ...inputProps
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={id}
        className="font-mono text-xs font-semibold text-foreground uppercase tracking-wider"
      >
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          aria-label={label}
          className={cn("h-11 px-3 pr-10 bg-card text-sm", className)}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? hideLabel : showLabel}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
