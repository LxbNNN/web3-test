"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useMarketStore } from "@/store/market-store"
import { http } from "@/lib/http"
import type { Ticker } from "@/types"

export function useTicker(symbol: string) {
  const { tickers, updateTicker } = useMarketStore()

  const { data, isLoading } = useQuery({
    queryKey: ["ticker", symbol],
    queryFn: () => http.get<Ticker>(`/api/v1/ticker/24hr`, { symbol }),
    refetchInterval: 5000,
    enabled: !!symbol,
  })

  useEffect(() => {
    if (data) updateTicker(data)
  }, [data, updateTicker])

  return {
    ticker: tickers[symbol] ?? data,
    isLoading,
  }
}

export function useAllTickers() {
  const { tickers, updateTicker } = useMarketStore()

  const { data, isLoading } = useQuery({
    queryKey: ["tickers"],
    queryFn: () => http.get<Ticker[]>("/api/v1/ticker/24hr/all"),
    refetchInterval: 5000,
  })

  useEffect(() => {
    data?.forEach((t) => updateTicker(t))
  }, [data, updateTicker])

  return { tickers: Object.values(tickers), isLoading }
}
