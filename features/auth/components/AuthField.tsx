import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { cn } from "@/core/lib/shadcn/libs/utils";

type AuthFieldProps = Omit<React.ComponentProps<typeof Input>, "id"> & {
  id: string;
  label: string;
};

export function AuthField({
  id,
  label,
  className,
  ...inputProps
}: AuthFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={id}
        className="font-mono text-xs font-semibold text-foreground uppercase tracking-wider"
      >
        {label}
      </Label>
      <Input
        id={id}
        aria-label={label}
        className={cn("h-11 px-3 bg-card text-sm", className)}
        {...inputProps}
      />
    </div>
  );
}
