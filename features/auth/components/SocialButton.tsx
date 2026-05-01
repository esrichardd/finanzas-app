import { Button } from "@/core/components/ui/button";
import { cn } from "@/core/lib/shadcn/libs/utils";

type SocialButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "variant" | "size"
> & {
  icon: React.ReactNode;
};

export function SocialButton({
  icon,
  children,
  className,
  type = "button",
  ...props
}: SocialButtonProps) {
  return (
    <Button
      type={type}
      variant="outline"
      size="xl"
      className={cn(
        "w-full gap-3 bg-card text-card-foreground font-sans text-sm font-medium hover:bg-card hover:border-primary hover:text-primary hover:scale-[1.01]",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </Button>
  );
}
