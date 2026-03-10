export type OrderSide = "BUY" | "SELL"
export type OrderType = "LIMIT" | "MARKET" | "STOP_LIMIT"
export type OrderStatus =
  | "NEW"
  | "PARTIALLY_FILLED"
  | "FILLED"
  | "CANCELED"
  | "REJECTED"

export interface Order {
  id: string
  symbol: string
  side: OrderSide
  type: OrderType
  status: OrderStatus
  price: string
  origQty: string
  executedQty: string
  cummulativeQuoteQty: string
  time: number
  updateTime: number
}

export interface PlaceOrderPayload {
  symbol: string
  side: OrderSide
  type: OrderType
  price?: string
  quantity: string
  stopPrice?: string
}

export interface AssetBalance {
  asset: string
  free: string
  locked: string
}
