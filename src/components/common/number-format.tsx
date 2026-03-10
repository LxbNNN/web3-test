import { cn } from "@/lib/utils"
import { formatPrice, formatQuantity, formatVolume } from "@/lib/format"

interface NumberFormatProps {
  value: string | number
  type?: "price" | "quantity" | "volume"
  decimals?: number
  className?: string
  prefix?: string
  suffix?: string
}

export function NumberFormat({
  value,
  type = "price",
  decimals,
  className,
  prefix,
  suffix,
}: NumberFormatProps) {
  const formatted =
    type === "price"
      ? formatPrice(value, decimals)
      : type === "quantity"
        ? formatQuantity(value, decimals)
        : formatVolume(value)

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {formatted}
      {suffix && <span className="ml-0.5 text-muted-foreground text-xs">{suffix}</span>}
    </span>
  )
}
