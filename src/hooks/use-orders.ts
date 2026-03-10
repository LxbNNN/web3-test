"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTradeStore } from "@/store/trade-store"
import { http } from "@/lib/http"
import type { Order, PlaceOrderPayload } from "@/types"

export function useOpenOrders(symbol: string) {
  const { setOpenOrders } = useTradeStore()

  return useQuery({
    queryKey: ["openOrders", symbol],
    queryFn: async () => {
      const orders = await http.get<Order[]>("/api/v1/orders/open", { symbol })
      setOpenOrders(orders)
      return orders
    },
    enabled: !!symbol,
  })
}

export function useOrderHistory(symbol: string) {
  return useQuery({
    queryKey: ["orderHistory", symbol],
    queryFn: () => http.get<Order[]>("/api/v1/orders/history", { symbol }),
    enabled: !!symbol,
  })
}

export function usePlaceOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: PlaceOrderPayload) =>
      http.post<Order>("/api/v1/orders", payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["openOrders", variables.symbol] })
      queryClient.invalidateQueries({ queryKey: ["balances"] })
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()
  const { removeOpenOrder } = useTradeStore()

  return useMutation({
    mutationFn: ({ orderId, symbol }: { orderId: string; symbol: string }) =>
      http.delete<Order>(`/api/v1/orders/${orderId}`).then((res) => ({ ...res, symbol })),
    onSuccess: (data) => {
      removeOpenOrder(data.id)
      queryClient.invalidateQueries({ queryKey: ["openOrders", data.symbol] })
    },
  })
}
