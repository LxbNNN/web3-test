"use client"

import { useEffect, useRef } from "react"
import { useMarketWs } from "@/hooks/use-market-ws"
import { KlineChart, type KlineChartHandle } from "@/components/trade/kline-chart"
import { OrderBook } from "@/components/trade/order-book"
import { OrderForm } from "@/components/trade/order-form"
import { TradeHistory } from "@/components/trade/trade-history"
import { UserOrders } from "@/components/trade/user-orders"
import { MarketHeader } from "@/components/trade/market-header"
import { cn } from "@/lib/utils"
import { Wifi, WifiOff, Loader2 } from "lucide-react"

interface TradeLayoutProps {
  symbol: string
}

export function TradeLayout({ symbol }: TradeLayoutProps) {
  const { status, klineHistory, liveBar } = useMarketWs(symbol)
  const chartRef = useRef<KlineChartHandle>(null)

  // 将实时 bar 推送给图表（避免 re-render 图表组件）
  useEffect(() => {
    if (liveBar) {
      chartRef.current?.updateBar(liveBar)
    }
  }, [liveBar])

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col overflow-hidden">
      {/* 行情头部 */}
      <MarketHeader symbol={symbol} />

      {/* 连接状态栏 */}
      <WsStatusBar status={status} />

      {/* 主体区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧：订单簿 */}
        <aside className="hidden w-52 shrink-0 flex-col border-r border-border lg:flex">
          <div className="border-b border-border px-2 py-1.5 text-xs font-medium text-muted-foreground">
            订单簿
          </div>
          <div className="flex-1 overflow-hidden">
            <OrderBook symbol={symbol} />
          </div>
        </aside>

        {/* 中间：K 线图 + 委托列表 */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* K 线图 */}
          <div className="relative border-b border-border" style={{ height: 420 }}>
            {klineHistory.length === 0 && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">加载 K 线数据...</span>
              </div>
            )}
            <KlineChart
              ref={chartRef}
              symbol={symbol}
              initialData={klineHistory}
              className="h-full w-full"
            />
          </div>

          {/* 当前委托 & 历史订单 */}
          <div className="flex-1 overflow-hidden">
            <UserOrders symbol={symbol} />
          </div>
        </main>

        {/* 右侧：下单区 + 成交记录 */}
        <aside className="flex w-64 shrink-0 flex-col border-l border-border">
          <div className="border-b border-border">
            <OrderForm symbol={symbol} />
          </div>
          <div className="border-b border-border px-2 py-1.5 text-xs font-medium text-muted-foreground">
            最新成交
          </div>
          <div className="flex-1 overflow-hidden">
            <TradeHistory />
          </div>
        </aside>
      </div>
    </div>
  )
}

// ─── WS 连接状态指示条 ───────────────────────────────────────────────────────────
function WsStatusBar({ status }: { status: "connecting" | "connected" | "disconnected" | "error" }) {
  if (status === "connected") return null

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 py-1 text-xs",
        status === "connecting" && "bg-yellow-500/10 text-yellow-400",
        status === "disconnected" && "bg-muted text-muted-foreground",
        status === "error" && "bg-destructive/10 text-destructive"
      )}
    >
      {status === "connecting" ? (
        <><Loader2 className="h-3 w-3 animate-spin" /> 正在连接行情服务器...</>
      ) : status === "disconnected" ? (
        <><WifiOff className="h-3 w-3" /> 已断开，正在重连...</>
      ) : (
        <><WifiOff className="h-3 w-3" /> 连接失败，请检查行情服务器</>
      )}
    </div>
  )
}
