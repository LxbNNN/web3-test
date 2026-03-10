"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BN } from "@/lib/bignumber"
import { formatPrice, formatQuantity } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { WalletAsset } from "@/types"
import { TrendingUp, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface AssetTableProps {
  assets: WalletAsset[]
  onDeposit:  (symbol: string) => void
  onWithdraw: (symbol: string) => void
  hideSmall?: boolean
}

export function AssetTable({ assets, onDeposit, onWithdraw, hideSmall = false }: AssetTableProps) {
  const [search, setSearch] = useState("")
  const [hideZero, setHideZero] = useState(hideSmall)

  const filtered = assets.filter((a) => {
    if (hideZero && BN(a.free).isZero() && BN(a.locked).isZero()) return false
    if (search && !a.symbol.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalUsdt = assets.reduce((sum, a) => sum.plus(BN(a.usdtValue)), BN("0"))

  return (
    <div className="space-y-4">
      {/* 总资产展示 */}
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">预估总资产</p>
        <p className="mt-1 text-3xl font-bold tabular-nums">
          {totalUsdt.toFormat(2, 1)}{" "}
          <span className="text-lg font-normal text-muted-foreground">USDT</span>
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          ≈ ${totalUsdt.toFormat(2, 1)} USD
        </p>
      </div>

      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <div className="relative w-52">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索币种"
            className="h-7 pl-7 text-xs"
          />
        </div>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hideZero}
            onChange={(e) => setHideZero(e.target.checked)}
            className="h-3 w-3"
          />
          隐藏小额资产
        </label>
      </div>

      {/* 资产列表 */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
              <th className="py-3 pl-4 text-left font-normal">币种</th>
              <th className="py-3 text-right font-normal">可用</th>
              <th className="py-3 text-right font-normal">冻结</th>
              <th className="py-3 text-right font-normal">折合 USDT</th>
              <th className="py-3 pr-4 text-right font-normal">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted-foreground text-sm">
                  暂无资产
                </td>
              </tr>
            ) : (
              filtered.map((asset) => (
                <AssetRow
                  key={asset.symbol}
                  asset={asset}
                  onDeposit={onDeposit}
                  onWithdraw={onWithdraw}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AssetRow({
  asset,
  onDeposit,
  onWithdraw,
}: {
  asset: WalletAsset
  onDeposit:  (symbol: string) => void
  onWithdraw: (symbol: string) => void
}) {
  const hasBalance = !BN(asset.free).isZero() || !BN(asset.locked).isZero()
  const tradeSymbol = asset.symbol === "USDT" ? null : `${asset.symbol}USDT`

  return (
    <tr className="border-b border-border/50 transition-colors hover:bg-accent/20">
      <td className="py-3 pl-4">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: asset.color ?? "#6366f1" }}
          >
            {asset.symbol.slice(0, 2)}
          </div>
          <div>
            <p className="font-medium">{asset.symbol}</p>
            <p className="text-xs text-muted-foreground">{asset.name}</p>
          </div>
        </div>
      </td>
      <td className="py-3 text-right tabular-nums">
        {formatQuantity(asset.free, 6)}
      </td>
      <td className="py-3 text-right tabular-nums text-muted-foreground">
        {formatQuantity(asset.locked, 6)}
      </td>
      <td className="py-3 text-right tabular-nums font-medium">
        {formatPrice(asset.usdtValue, 2)}
      </td>
      <td className="py-3 pr-4">
        <div className="flex items-center justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs text-green-400 hover:text-green-300 hover:bg-green-400/10"
            onClick={() => onDeposit(asset.symbol)}
          >
            充值
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onWithdraw(asset.symbol)}
            disabled={!hasBalance}
          >
            提现
          </Button>
          {tradeSymbol && (
            <Link href={`/trade/${tradeSymbol}`}>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <TrendingUp className="h-3 w-3 mr-0.5" />
                交易
              </Button>
            </Link>
          )}
        </div>
      </td>
    </tr>
  )
}
