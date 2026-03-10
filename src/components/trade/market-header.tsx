"use client"

import { useTicker } from "@/hooks/use-ticker"
import { getPairBySymbol } from "@/config/trading-pairs"
import { PriceChange } from "@/components/common/price-change"
import { NumberFormat } from "@/components/common/number-format"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/format"
import { BN } from "@/lib/bignumber"

interface MarketHeaderProps {
  symbol: string
}

export function MarketHeader({ symbol }: MarketHeaderProps) {
  const { ticker } = useTicker(symbol)
  const pair = getPairBySymbol(symbol)
  // BigNumber 比较：涨跌幅 >= 0 则为上涨色
  const isUp = BN(ticker?.priceChangePercent ?? "0").gte("0")

  return (
    <div className="flex items-center gap-6 border-b border-border px-4 py-2.5 overflow-x-auto">
      {/* 币对名称 */}
      <div className="flex shrink-0 flex-col">
        <span className="text-base font-bold">{pair?.displayName ?? symbol}</span>
        <span className="text-xs text-muted-foreground">{pair?.baseAsset} 现货</span>
      </div>

      {/* 最新价 */}
      <div className="flex shrink-0 flex-col">
        <span className={cn("text-xl font-bold tabular-nums", isUp ? "text-green-400" : "text-red-400")}>
          {ticker ? formatPrice(ticker.lastPrice) : "--"}
        </span>
        <PriceChange value={ticker?.priceChangePercent ?? 0} className="text-xs" />
      </div>

      {/* 统计数据 */}
      {ticker && (
        <div className="flex items-center gap-6">
          <StatItem label="24h 高" value={<NumberFormat value={ticker.highPrice} className="text-green-400" />} />
          <StatItem label="24h 低" value={<NumberFormat value={ticker.lowPrice} className="text-red-400" />} />
          <StatItem label="24h 量" value={<NumberFormat value={ticker.volume} type="volume" suffix={pair?.baseAsset} />} />
          <StatItem label="24h 额" value={<NumberFormat value={ticker.quoteVolume} type="volume" suffix="USDT" />} />
        </div>
      )}
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex shrink-0 flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
