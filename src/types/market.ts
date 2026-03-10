export interface TradingPair {
  symbol: string       // e.g. "BTCUSDT"
  baseAsset: string    // e.g. "BTC"
  quoteAsset: string   // e.g. "USDT"
  displayName: string  // e.g. "BTC/USDT"
}

export interface Ticker {
  symbol: string
  lastPrice: string
  priceChange: string
  priceChangePercent: string
  highPrice: string
  lowPrice: string
  volume: string
  quoteVolume: string
  openPrice: string
}

export interface KlineData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface OrderBookEntry {
  price: string
  quantity: string
  total?: string
}

export interface OrderBook {
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
  lastUpdateId: number
}

export interface TradeRecord {
  id: string
  price: string
  quantity: string
  time: number
  isBuyerMaker: boolean
}
