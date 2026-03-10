"use client"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTradeStore } from "@/store/trade-store"
import { useAuthStore } from "@/store/auth-store"
import { useMarketStore } from "@/store/market-store"
import { usePlaceOrder } from "@/hooks/use-orders"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { calcOrderTotal, formatPrice } from "@/lib/format"
import { BN } from "@/lib/bignumber"
import type { OrderSide } from "@/types"

const schema = z.object({
  price:    z.string().optional(),
  quantity: z.string().min(1, "请输入数量"),
})

type FormValues = z.infer<typeof schema>

interface OrderFormProps {
  symbol: string
}

export function OrderForm({ symbol }: OrderFormProps) {
  const { orderForm, updateOrderForm } = useTradeStore()
  const { isAuthenticated } = useAuthStore()
  const { tickers } = useMarketStore()
  const { mutate: placeOrder, isPending } = usePlaceOrder()

  const { side, orderType } = orderForm

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  // 实时监听价格和数量，用 BigNumber 精确计算总价
  const watchedPrice    = useWatch({ control, name: "price" })
  const watchedQuantity = useWatch({ control, name: "quantity" })
  const lastPrice = tickers[symbol]?.lastPrice ?? "0"

  // 限价单：total = price × quantity；市价单：total = lastPrice × quantity
  const effectivePrice = orderType === "LIMIT" ? (watchedPrice ?? "") : lastPrice
  const total = calcOrderTotal(effectivePrice, watchedQuantity ?? "")
  const showTotal = BN(total).gt("0")

  const setSide = (s: OrderSide) => updateOrderForm({ side: s })

  // 点击"最新价"快速填入当前价格
  const fillLastPrice = () => {
    if (orderType === "LIMIT") setValue("price", lastPrice)
  }

  const onSubmit = (values: FormValues) => {
    placeOrder(
      {
        symbol,
        side,
        type: orderType,
        price:    orderType === "LIMIT" ? values.price : undefined,
        quantity: values.quantity,
      },
      { onSuccess: () => reset() }
    )
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* 买/卖 切换 */}
      <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
        <button
          type="button"
          onClick={() => setSide("BUY")}
          className={cn(
            "rounded py-1 text-sm font-medium transition-colors",
            side === "BUY" ? "bg-green-500 text-white" : "text-muted-foreground hover:text-foreground"
          )}
        >
          买入
        </button>
        <button
          type="button"
          onClick={() => setSide("SELL")}
          className={cn(
            "rounded py-1 text-sm font-medium transition-colors",
            side === "SELL" ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground"
          )}
        >
          卖出
        </button>
      </div>

      {/* 订单类型 */}
      <Tabs value={orderType} onValueChange={(v) => updateOrderForm({ orderType: v as "LIMIT" | "MARKET" })}>
        <TabsList className="h-7 w-full">
          <TabsTrigger value="LIMIT"  className="flex-1 text-xs">限价</TabsTrigger>
          <TabsTrigger value="MARKET" className="flex-1 text-xs">市价</TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2.5">
        {/* 价格输入（市价单隐藏）*/}
        {orderType === "LIMIT" ? (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs text-muted-foreground">价格 (USDT)</label>
              {lastPrice !== "0" && (
                <button
                  type="button"
                  onClick={fillLastPrice}
                  className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                  最新 {formatPrice(lastPrice)}
                </button>
              )}
            </div>
            <Input
              {...register("price")}
              placeholder="输入价格"
              className="h-8 text-sm tabular-nums"
              type="number"
              step="any"
              min="0"
            />
          </div>
        ) : (
          <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            以市场最优价成交 ≈ <span className="font-medium text-foreground">{formatPrice(lastPrice)}</span> USDT
          </div>
        )}

        {/* 数量 */}
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">数量</label>
          <Input
            {...register("quantity")}
            placeholder="输入数量"
            className="h-8 text-sm tabular-nums"
            type="number"
            step="any"
            min="0"
          />
          {errors.quantity && (
            <p className="mt-1 text-xs text-destructive">{errors.quantity.message}</p>
          )}
        </div>

        {/* 预估总价（BigNumber 精确计算：price × quantity）*/}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>预估总价</span>
          <span className={cn("tabular-nums font-medium", showTotal && "text-foreground")}>
            {showTotal ? `${total} USDT` : "--"}
          </span>
        </div>

        {/* 提交按钮 */}
        {isAuthenticated ? (
          <Button
            type="submit"
            disabled={isPending}
            className={cn(
              "mt-1 h-9 w-full font-medium",
              side === "BUY"
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-red-500 text-white hover:bg-red-600"
            )}
          >
            {isPending ? "提交中..." : side === "BUY" ? "买入" : "卖出"}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="mt-1 h-9 w-full"
            onClick={() => { window.location.href = "/login" }}
          >
            登录后交易
          </Button>
        )}
      </form>
    </div>
  )
}
