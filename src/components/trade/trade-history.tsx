"use client"

import { useMarketStore } from "@/store/market-store"
import { formatPrice, formatQuantity, formatTime } from "@/lib/format"
import { cn } from "@/lib/utils"

export function TradeHistory() {
  const { recentTrades } = useMarketStore()

  return (
    <div className="flex h-full flex-col text-xs">
      <div className="grid grid-cols-3 gap-1 border-b border-border px-2 py-1.5 text-muted-foreground">
        <span>价格(USDT)</span>
        <span className="text-right">数量</span>
        <span className="text-right">时间</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {recentTrades.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-muted-foreground">暂无成交记录</div>
        ) : (
          recentTrades.map((trade) => (
            <div
              key={trade.id}
              className="grid grid-cols-3 gap-1 px-2 py-0.5 hover:bg-accent/30"
            >
              <span
                className={cn(
                  "tabular-nums",
                  trade.isBuyerMaker ? "text-red-400" : "text-green-400"
                )}
              >
                {formatPrice(trade.price)}
              </span>
              <span className="text-right tabular-nums">{formatQuantity(trade.quantity)}</span>
              <span className="text-right text-muted-foreground">{formatTime(trade.time)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
