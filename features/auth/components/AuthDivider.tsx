export function AuthDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground font-mono">
        {children}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
