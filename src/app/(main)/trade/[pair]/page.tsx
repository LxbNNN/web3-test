import { getPairBySymbol } from "@/config/trading-pairs"
import { TradeLayout } from "@/components/trade/trade-layout"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

interface TradePageProps {
  params: Promise<{ pair: string }>
}

export async function generateMetadata({ params }: TradePageProps): Promise<Metadata> {
  const { pair } = await params
  const tradingPair = getPairBySymbol(pair)
  return {
    title: tradingPair ? `${tradingPair.displayName} 交易` : "交易",
  }
}

export default async function TradePage({ params }: TradePageProps) {
  const { pair } = await params
  const tradingPair = getPairBySymbol(pair)

  if (!tradingPair) notFound()

  return <TradeLayout symbol={tradingPair.symbol} />
}
