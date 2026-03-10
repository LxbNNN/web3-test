import { cn } from "@/lib/utils"
import { formatPercent, getPriceDirection } from "@/lib/format"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface PriceChangeProps {
  value: string | number
  showIcon?: boolean
  className?: string
}

export function PriceChange({ value, showIcon = false, className }: PriceChangeProps) {
  const direction = getPriceDirection(value)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium tabular-nums",
        direction === "up" && "text-green-400",
        direction === "down" && "text-red-400",
        direction === "neutral" && "text-muted-foreground",
        className
      )}
    >
      {showIcon && (
        <>
          {direction === "up" && <TrendingUp className="h-3.5 w-3.5" />}
          {direction === "down" && <TrendingDown className="h-3.5 w-3.5" />}
          {direction === "neutral" && <Minus className="h-3.5 w-3.5" />}
        </>
      )}
      {formatPercent(value)}
    </span>
  )
}
