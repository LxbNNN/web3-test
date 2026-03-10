"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTradeStore } from "@/store/trade-store"
import { useCancelOrder } from "@/hooks/use-orders"
import { formatPrice, formatQuantity, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Order } from "@/types"

interface UserOrdersProps {
  symbol: string
}

export function UserOrders({ symbol }: UserOrdersProps) {
  const { openOrders, orderHistory } = useTradeStore()
  const { mutate: cancelOrder } = useCancelOrder()

  return (
    <Tabs defaultValue="open" className="h-full">
      <TabsList className="h-8 px-2">
        <TabsTrigger value="open" className="text-xs">
          当前委托
          {openOrders.length > 0 && (
            <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
              {openOrders.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="history" className="text-xs">历史订单</TabsTrigger>
      </TabsList>

      <TabsContent value="open" className="mt-0 h-[calc(100%-32px)] overflow-y-auto">
        <OrderTable
          orders={openOrders}
          showCancel
          onCancel={(id) => cancelOrder({ orderId: id, symbol })}
          emptyText="暂无当前委托"
        />
      </TabsContent>

      <TabsContent value="history" className="mt-0 h-[calc(100%-32px)] overflow-y-auto">
        <OrderTable orders={orderHistory} emptyText="暂无历史订单" />
      </TabsContent>
    </Tabs>
  )
}

function OrderTable({
  orders,
  showCancel,
  onCancel,
  emptyText,
}: {
  orders: Order[]
  showCancel?: boolean
  onCancel?: (id: string) => void
  emptyText: string
}) {
  if (orders.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-xs text-muted-foreground">
        {emptyText}
      </div>
    )
  }

  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-border text-muted-foreground">
          <th className="py-2 pl-2 text-left font-normal">时间</th>
          <th className="py-2 text-left font-normal">方向</th>
          <th className="py-2 text-left font-normal">类型</th>
          <th className="py-2 text-right font-normal">价格</th>
          <th className="py-2 text-right font-normal">数量</th>
          <th className="py-2 text-right font-normal">成交</th>
          <th className="py-2 pr-2 text-right font-normal">状态</th>
          {showCancel && <th className="py-2 pr-2 text-right font-normal">操作</th>}
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id} className="border-b border-border/50 hover:bg-accent/20">
            <td className="py-1.5 pl-2 text-muted-foreground">{formatDate(order.time)}</td>
            <td className={cn("py-1.5", order.side === "BUY" ? "text-green-400" : "text-red-400")}>
              {order.side === "BUY" ? "买入" : "卖出"}
            </td>
            <td className="py-1.5">{order.type === "LIMIT" ? "限价" : "市价"}</td>
            <td className="py-1.5 text-right tabular-nums">{formatPrice(order.price)}</td>
            <td className="py-1.5 text-right tabular-nums">{formatQuantity(order.origQty)}</td>
            <td className="py-1.5 text-right tabular-nums">{formatQuantity(order.executedQty)}</td>
            <td className="py-1.5 pr-2 text-right">
              <StatusBadge status={order.status} />
            </td>
            {showCancel && (
              <td className="py-1.5 pr-2 text-right">
                <button
                  onClick={() => onCancel?.(order.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  撤销
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const map: Record<Order["status"], { label: string; className: string }> = {
    NEW: { label: "挂单中", className: "text-blue-400" },
    PARTIALLY_FILLED: { label: "部分成交", className: "text-yellow-400" },
    FILLED: { label: "已成交", className: "text-green-400" },
    CANCELED: { label: "已撤销", className: "text-muted-foreground" },
    REJECTED: { label: "已拒绝", className: "text-destructive" },
  }
  const { label, className } = map[status]
  return <span className={className}>{label}</span>
}
