"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { DEPOSIT_NETWORKS, DEPOSIT_TOKENS } from "@/config/wagmi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BN } from "@/lib/bignumber"
import { formatPrice, formatQuantity, calcFee } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
} from "lucide-react"
import type { WalletAsset } from "@/types"

const FEE_RATE: Record<string, string> = {
  USDT: "1.00",
  USDC: "1.00",
  ETH:  "0.001",
  BNB:  "0.005",
  BTC:  "0.0001",
  SOL:  "0.01",
}

interface WithdrawPanelProps {
  assets:         WalletAsset[]
  defaultSymbol?: string
}

const schema = z.object({
  address:  z.string().min(10, "请输入有效地址"),
  amount:   z.string().min(1, "请输入提现金额"),
})
type FormValues = z.infer<typeof schema>

export function WithdrawPanel({ assets, defaultSymbol = "USDT" }: WithdrawPanelProps) {
  const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol)
  const [selectedNetworkIdx, setSelectedNetworkIdx] = useState(0)
  const [showTokenPicker, setShowTokenPicker]     = useState(false)
  const [showNetworkPicker, setShowNetworkPicker] = useState(false)

  const selectedToken   = DEPOSIT_TOKENS.find((t) => t.symbol === selectedSymbol) ?? DEPOSIT_TOKENS[0]
  const selectedNetwork = DEPOSIT_NETWORKS[selectedNetworkIdx]
  const selectedAsset   = assets.find((a) => a.symbol === selectedSymbol)
  const available       = selectedAsset?.free ?? "0"
  const fee             = FEE_RATE[selectedSymbol] ?? "1"

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const watchAmount = watch("amount") ?? "0"
  const actualAmount = BN(watchAmount).minus(BN(fee))
  const isValidAmount = actualAmount.gt("0") && BN(watchAmount).lte(BN(available))

  const setMax = () => setValue("amount", available)

  const onSubmit = (values: FormValues) => {
    alert(`提现申请已提交（模拟）\n地址: ${values.address}\n金额: ${values.amount} ${selectedSymbol}\n手续费: ${fee} ${selectedSymbol}`)
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      {/* 币种 + 网络 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">提现币种</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => { setShowTokenPicker(!showTokenPicker); setShowNetworkPicker(false) }}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-sm hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: selectedToken.color }}
                >
                  {selectedToken.symbol.slice(0, 2)}
                </div>
                <span className="font-medium">{selectedToken.symbol}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            {showTokenPicker && (
              <div className="absolute top-full left-0 z-20 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg">
                {DEPOSIT_TOKENS.map((token) => (
                  <button
                    key={token.symbol}
                    type="button"
                    onClick={() => { setSelectedSymbol(token.symbol); setShowTokenPicker(false) }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent/50",
                      token.symbol === selectedSymbol && "bg-accent/30"
                    )}
                  >
                    <div className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ backgroundColor: token.color }}>
                      {token.symbol.slice(0, 2)}
                    </div>
                    {token.symbol}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">提现网络</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => { setShowNetworkPicker(!showNetworkPicker); setShowTokenPicker(false) }}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-sm hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>{selectedNetwork.icon}</span>
                <span className="font-medium">{selectedNetwork.shortName}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            {showNetworkPicker && (
              <div className="absolute top-full left-0 z-20 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg">
                {DEPOSIT_NETWORKS.map((net, idx) => (
                  <button
                    key={net.chainId}
                    type="button"
                    onClick={() => { setSelectedNetworkIdx(idx); setShowNetworkPicker(false) }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent/50",
                      idx === selectedNetworkIdx && "bg-accent/30"
                    )}
                  >
                    <span>{net.icon}</span>
                    <span>{net.shortName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* 提现地址 */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">提现地址</label>
          <Input
            {...register("address")}
            placeholder={`输入 ${selectedNetwork.shortName} 网络地址`}
            className="font-mono text-sm"
          />
          {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
        </div>

        {/* 提现金额 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">提现金额</label>
            <span className="text-xs text-muted-foreground">
              可用: <button type="button" onClick={setMax} className="text-primary hover:underline tabular-nums">
                {formatQuantity(available, 6)} {selectedSymbol}
              </button>
            </span>
          </div>
          <div className="relative">
            <Input
              {...register("amount")}
              placeholder="0.00"
              type="number"
              step="any"
              min="0"
              className="pr-20 tabular-nums"
            />
            <span className="absolute right-3 top-2 text-sm font-medium text-muted-foreground">
              {selectedSymbol}
            </span>
          </div>
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          {BN(watchAmount).gt("0") && BN(watchAmount).gt(BN(available)) && (
            <p className="text-xs text-destructive">余额不足</p>
          )}
        </div>

        {/* 费用明细 */}
        {BN(watchAmount).gt("0") && (
          <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>提现金额</span>
              <span className="tabular-nums">{formatQuantity(watchAmount, 6)} {selectedSymbol}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>手续费</span>
              <span className="tabular-nums text-yellow-400">- {fee} {selectedSymbol}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-medium">
              <span>实际到账</span>
              <span className={cn("tabular-nums", isValidAmount ? "text-green-400" : "text-destructive")}>
                {isValidAmount ? formatQuantity(actualAmount.toFixed(8), 8) : "0"} {selectedSymbol}
              </span>
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full gap-2"
          disabled={!isValidAmount}
        >
          提交提现申请 <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      {/* 安全提示 */}
      <div className="flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
        <p className="text-xs text-yellow-200 leading-relaxed">
          请仔细核对提现地址。提现申请提交后无法撤销，向错误地址转账的资产将无法找回。
        </p>
      </div>
      <div className="flex items-start gap-2 rounded-lg bg-muted/30 border border-border px-3 py-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          大额提现可能需要人工审核（1-2 小时），审核通过后自动发送到账。
        </p>
      </div>
    </div>
  )
}
