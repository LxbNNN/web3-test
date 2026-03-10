import { create } from "zustand"
import type { Order, AssetBalance, OrderSide, OrderType } from "@/types"

interface OrderFormState {
  side: OrderSide
  orderType: OrderType
  price: string
  quantity: string
  total: string
}

interface TradeState {
  openOrders: Order[]
  orderHistory: Order[]
  balances: Record<string, AssetBalance>
  orderForm: OrderFormState
  setOpenOrders: (orders: Order[]) => void
  addOpenOrder: (order: Order) => void
  removeOpenOrder: (orderId: string) => void
  setOrderHistory: (orders: Order[]) => void
  setBalances: (balances: AssetBalance[]) => void
  updateOrderForm: (partial: Partial<OrderFormState>) => void
  resetOrderForm: () => void
}

const defaultOrderForm: OrderFormState = {
  side: "BUY",
  orderType: "LIMIT",
  price: "",
  quantity: "",
  total: "",
}

export const useTradeStore = create<TradeState>()((set) => ({
  openOrders: [],
  orderHistory: [],
  balances: {},
  orderForm: defaultOrderForm,

  setOpenOrders: (orders) => set({ openOrders: orders }),

  addOpenOrder: (order) =>
    set((state) => ({ openOrders: [order, ...state.openOrders] })),

  removeOpenOrder: (orderId) =>
    set((state) => ({
      openOrders: state.openOrders.filter((o) => o.id !== orderId),
    })),

  setOrderHistory: (orders) => set({ orderHistory: orders }),

  setBalances: (balances) =>
    set({
      balances: Object.fromEntries(balances.map((b) => [b.asset, b])),
    }),

  updateOrderForm: (partial) =>
    set((state) => ({ orderForm: { ...state.orderForm, ...partial } })),

  resetOrderForm: () => set({ orderForm: defaultOrderForm }),
}))
