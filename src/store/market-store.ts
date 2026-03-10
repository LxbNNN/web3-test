import { create } from "zustand"
import type { Ticker, OrderBook, TradeRecord } from "@/types"
import { DEFAULT_PAIR } from "@/config/trading-pairs"

interface MarketState {
  currentSymbol: string
  tickers: Record<string, Ticker>
  orderBook: OrderBook
  recentTrades: TradeRecord[]
  setCurrentSymbol: (symbol: string) => void
  updateTicker: (ticker: Ticker) => void
  setOrderBook: (orderBook: OrderBook) => void
  addTrade: (trade: TradeRecord) => void
}

export const useMarketStore = create<MarketState>()((set) => ({
  currentSymbol: DEFAULT_PAIR,
  tickers: {},
  orderBook: { bids: [], asks: [], lastUpdateId: 0 },
  recentTrades: [],

  setCurrentSymbol: (symbol) => set({ currentSymbol: symbol }),

  updateTicker: (ticker) =>
    set((state) => ({
      tickers: { ...state.tickers, [ticker.symbol]: ticker },
    })),

  setOrderBook: (orderBook) => set({ orderBook }),

  addTrade: (trade) =>
    set((state) => ({
      recentTrades: [trade, ...state.recentTrades].slice(0, 50),
    })),
}))
