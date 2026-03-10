import type { TradingPair } from "@/types"

export const TRADING_PAIRS: TradingPair[] = [
  { symbol: "BTCUSDT", baseAsset: "BTC", quoteAsset: "USDT", displayName: "BTC/USDT" },
  { symbol: "ETHUSDT", baseAsset: "ETH", quoteAsset: "USDT", displayName: "ETH/USDT" },
  { symbol: "BNBUSDT", baseAsset: "BNB", quoteAsset: "USDT", displayName: "BNB/USDT" },
  { symbol: "SOLUSDT", baseAsset: "SOL", quoteAsset: "USDT", displayName: "SOL/USDT" },
  { symbol: "XRPUSDT", baseAsset: "XRP", quoteAsset: "USDT", displayName: "XRP/USDT" },
  { symbol: "DOGEUSDT", baseAsset: "DOGE", quoteAsset: "USDT", displayName: "DOGE/USDT" },
  { symbol: "ADAUSDT", baseAsset: "ADA", quoteAsset: "USDT", displayName: "ADA/USDT" },
  { symbol: "TRXUSDT", baseAsset: "TRX", quoteAsset: "USDT", displayName: "TRX/USDT" },
]

export const DEFAULT_PAIR = "BTCUSDT"

export function getPairBySymbol(symbol: string): TradingPair | undefined {
  return TRADING_PAIRS.find((p) => p.symbol === symbol.toUpperCase())
}
