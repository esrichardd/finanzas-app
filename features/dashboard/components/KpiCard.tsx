import { TrendingUp, TrendingDown } from 'lucide-react'
import { Skeleton } from '@/core/components/ui/skeleton'
import { cn } from '@/core/lib/shadcn/libs/utils'

interface KpiCardProps {
  label: string
  value: string
  delta: number
  deltaLabel: string
  loading?: boolean
}

export function KpiCard({ label, value, delta, deltaLabel, loading }: KpiCardProps) {
  if (loading) {
    return (
      <div className="bg-card border border-border p-4 flex flex-col gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-3 w-20" />
      </div>
    )
  }

  const isPositive = delta >= 0

  return (
    <div className="bg-card border border-border p-4 flex flex-col gap-1.5">
      <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
        {label}
      </p>
      <p className="font-mono text-2xl font-bold text-foreground tabular-nums leading-tight">
        {value}
      </p>
      <div className={cn(
        'flex items-center gap-1 text-xs font-mono',
        isPositive ? 'text-emerald-500' : 'text-red-500',
      )}>
        {isPositive
          ? <TrendingUp className="size-3 shrink-0" />
          : <TrendingDown className="size-3 shrink-0" />
        }
        <span>
          {isPositive ? '+' : ''}{delta.toFixed(1)}% {deltaLabel}
        </span>
      </div>
    </div>
  )
}
