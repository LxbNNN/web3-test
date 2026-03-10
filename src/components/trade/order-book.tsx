"use client"

import { useMarketStore } from "@/store/market-store"
import { formatPrice, formatQuantity } from "@/lib/format"
import { BN, BigNumber } from "@/lib/bignumber"
import { cn } from "@/lib/utils"

interface OrderBookProps {
  symbol: string
}

export function OrderBook({ symbol: _symbol }: OrderBookProps) {
  const { orderBook } = useMarketStore()
  const { bids, asks } = orderBook

  // ── 用 BigNumber 归约出买/卖盘的最大数量，作为深度条宽度基准 ─────────────────
  const maxBidQty = bids.reduce<BigNumber>(
    (max, b) => { const q = BN(b.quantity); return q.gt(max) ? q : max },
    BN("1")
  )
  const maxAskQty = asks.reduce<BigNumber>(
    (max, a) => { const q = BN(a.quantity); return q.gt(max) ? q : max },
    BN("1")
  )

  return (
    <div className="flex h-full flex-col text-xs">
      {/* 表头 */}
      <div className="grid grid-cols-3 gap-1 border-b border-border px-2 py-1.5 text-muted-foreground">
        <span>价格(USDT)</span>
        <span className="text-right">数量</span>
        <span className="text-right">累计</span>
      </div>

      {/* 卖盘 asks — 倒序展示（最低卖价靠近中间），红色 */}
      <div className="flex flex-1 flex-col-reverse overflow-hidden">
        {asks.slice(0, 12).map((ask, i) => {
          // 深度宽度百分比：当前档位数量 / 最大数量 × 100（BigNumber 除法）
          const pct = BN(ask.quantity).dividedBy(maxAskQty).times("100").toNumber()
          return (
            <div key={i} className="relative grid grid-cols-3 gap-1 px-2 py-0.5 hover:bg-accent/30">
              <div
                className="absolute inset-y-0 right-0 bg-red-500/10"
                style={{ width: `${pct}%` }}
              />
              <span className="relative text-red-400 tabular-nums">{formatPrice(ask.price)}</span>
              <span className="relative text-right tabular-nums">{formatQuantity(ask.quantity)}</span>
              <span className="relative text-right tabular-nums text-muted-foreground">{ask.total ?? "--"}</span>
            </div>
          )
        })}
      </div>

      {/* 中间盘口价（最优买价）*/}
      <div className="border-y border-border px-2 py-1.5">
        <span className="font-semibold text-sm text-green-400 tabular-nums">
          {bids[0] ? formatPrice(bids[0].price) : "--"}
        </span>
      </div>

      {/* 买盘 bids — 从高到低，绿色 */}
      <div className="flex-1 overflow-hidden">
        {bids.slice(0, 12).map((bid, i) => {
          const pct = BN(bid.quantity).dividedBy(maxBidQty).times("100").toNumber()
          return (
            <div key={i} className="relative grid grid-cols-3 gap-1 px-2 py-0.5 hover:bg-accent/30">
              <div
                className="absolute inset-y-0 right-0 bg-green-500/10"
                style={{ width: `${pct}%` }}
              />
              <span className="relative text-green-400 tabular-nums">{formatPrice(bid.price)}</span>
              <span className="relative text-right tabular-nums">{formatQuantity(bid.quantity)}</span>
              <span className="relative text-right tabular-nums text-muted-foreground">{bid.total ?? "--"}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
