"use client"

import { useState, useMemo } from "react"
import { useConnection } from "wagmi"
import { QRCodeSVG } from "qrcode.react"
import { DEPOSIT_NETWORKS, DEPOSIT_TOKENS } from "@/config/wagmi"
import { ConnectButton } from "@/components/wallet/connect-button"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Copy,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Info,
  ShieldCheck,
} from "lucide-react"

interface DepositPanelProps {
  defaultSymbol?: string
}

// 根据地址 + 网络 + 币种生成确定性充值地址（模拟 CEX 行为）
function genDepositAddress(userAddress: string, chainId: number, symbol: string): string {
  const seed = `${userAddress}-${chainId}-${symbol}`
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0")
  return `0x${hex}${userAddress.slice(2, 34).toLowerCase()}`
}

export function DepositPanel({ defaultSymbol = "USDT" }: DepositPanelProps) {
  const { address, isConnected } = useConnection()
  const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol)
  const [selectedNetworkIdx, setSelectedNetworkIdx] = useState(0)
  const [copied, setCopied] = useState(false)
  const [showNetworkPicker, setShowNetworkPicker] = useState(false)
  const [showTokenPicker, setShowTokenPicker] = useState(false)

  const selectedToken   = DEPOSIT_TOKENS.find((t) => t.symbol === selectedSymbol) ?? DEPOSIT_TOKENS[0]
  const selectedNetwork = DEPOSIT_NETWORKS[selectedNetworkIdx]

  const depositAddress = useMemo(() => {
    if (!address) return ""
    return genDepositAddress(address, selectedNetwork.chainId, selectedSymbol)
  }, [address, selectedNetwork.chainId, selectedSymbol])

  const copyAddress = () => {
    navigator.clipboard.writeText(depositAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* 币种 + 网络选择 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 币种 */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">充值币种</label>
          <div className="relative">
            <button
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
                <span className="text-muted-foreground text-xs">{selectedToken.name}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            {showTokenPicker && (
              <div className="absolute top-full left-0 z-20 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg">
                {DEPOSIT_TOKENS.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => { setSelectedSymbol(token.symbol); setShowTokenPicker(false) }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent/50 transition-colors",
                      token.symbol === selectedSymbol && "bg-accent/30"
                    )}
                  >
                    <div
                      className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ backgroundColor: token.color }}
                    >
                      {token.symbol.slice(0, 2)}
                    </div>
                    <span>{token.symbol}</span>
                    <span className="text-xs text-muted-foreground">{token.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 网络 */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">充值网络</label>
          <div className="relative">
            <button
              onClick={() => { setShowNetworkPicker(!showNetworkPicker); setShowTokenPicker(false) }}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-sm hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{selectedNetwork.icon}</span>
                <span className="font-medium">{selectedNetwork.shortName}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            {showNetworkPicker && (
              <div className="absolute top-full left-0 z-20 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg">
                {DEPOSIT_NETWORKS.map((net, idx) => (
                  <button
                    key={net.chainId}
                    onClick={() => { setSelectedNetworkIdx(idx); setShowNetworkPicker(false) }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent/50 transition-colors",
                      idx === selectedNetworkIdx && "bg-accent/30"
                    )}
                  >
                    <span>{net.icon}</span>
                    <div className="text-left">
                      <p className="text-sm">{net.shortName}</p>
                      <p className="text-xs text-muted-foreground">{net.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 充值地址区域 */}
      {!isConnected ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
          <Wallet2Icon />
          <p className="mt-3 font-medium">请先连接钱包</p>
          <p className="mt-1 text-sm text-muted-foreground">连接钱包后即可获取专属充值地址</p>
          <div className="mt-4 flex justify-center">
            <ConnectButton />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col items-center gap-5">
            {/* QR Code */}
            <div className="rounded-xl border border-border bg-white p-3">
              <QRCodeSVG
                value={depositAddress}
                size={160}
                bgColor="#ffffff"
                fgColor="#09090b"
                level="M"
              />
            </div>

            {/* 地址 */}
            <div className="w-full space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                {selectedToken.symbol} 充值地址（{selectedNetwork.shortName}）
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                <code className="flex-1 break-all font-mono text-xs">{depositAddress}</code>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 shrink-0"
                  onClick={copyAddress}
                >
                  {copied
                    ? <CheckCircle2 className="h-4 w-4 text-green-400" />
                    : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* 充值信息 */}
            <div className="w-full grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-muted-foreground">最小充值</p>
                <p className="font-medium mt-0.5">{selectedNetwork.minDeposit} {selectedToken.symbol}</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-muted-foreground">到账确认</p>
                <p className="font-medium mt-0.5">{selectedNetwork.confirmations} 个区块</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-muted-foreground">充值手续费</p>
                <p className="font-medium mt-0.5 text-green-400">免费</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-muted-foreground">预计到账</p>
                <p className="font-medium mt-0.5">5-30 分钟</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 安全提示 */}
      <div className="space-y-2">
        <div className="flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
          <p className="text-xs text-yellow-200 leading-relaxed">
            请确保充值网络为 <span className="font-semibold">{selectedNetwork.name}</span>，
            向错误网络充值将导致资产永久丢失。
          </p>
        </div>
        <div className="flex items-start gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
          <p className="text-xs text-blue-200 leading-relaxed">
            该地址仅用于接收 {selectedToken.symbol}，请勿向此地址发送其他代币。
            每次充值地址固定不变。
          </p>
        </div>
        <div className="flex items-start gap-2 rounded-lg bg-muted/30 border border-border px-3 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            区块链充值需要 {selectedNetwork.confirmations} 个区块确认后到账，
            低于最小充值金额 {selectedNetwork.minDeposit} {selectedToken.symbol} 的充值将不被处理。
          </p>
        </div>
      </div>
    </div>
  )
}

function Wallet2Icon() {
  return (
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
      <svg className="h-7 w-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18-3H3m9-3h.008v.008H12V3z" />
      </svg>
    </div>
  )
}
