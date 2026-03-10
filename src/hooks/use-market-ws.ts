"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useMarketStore } from "@/store/market-store";
import type { KlineData, Ticker, OrderBook, TradeRecord } from "@/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000";

type WsStatus = "connecting" | "connected" | "disconnected" | "error";

interface ServerMessage {
  type: "kline_history" | "kline" | "orderbook" | "ticker" | "trade";
  symbol: string;
  data: unknown;
}

export function useMarketWs(symbol: string) {
  const { updateTicker, setOrderBook, addTrade } = useMarketStore();

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentSymbol = useRef<string>("");

  const [status, setStatus] = useState<WsStatus>("disconnected");
  const [klineHistory, setKlineHistory] = useState<KlineData[]>([]);
  const [liveBar, setLiveBar] = useState<KlineData | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // 切换订阅币对
      if (currentSymbol.current !== symbol) {
        wsRef.current.send(
          JSON.stringify({ type: "unsubscribe", symbol: currentSymbol.current })
        );
        wsRef.current.send(JSON.stringify({ type: "subscribe", symbol }));
        currentSymbol.current = symbol;
        setKlineHistory([]);
        setLiveBar(null);
      }
      return;
    }

    setStatus("connecting");
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      currentSymbol.current = symbol;
      ws.send(JSON.stringify({ type: "subscribe", symbol }));
      console.log(`[WS] 已连接，订阅 ${symbol}`);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as ServerMessage;

        // 只处理当前订阅币对的消息
        if (msg.symbol !== currentSymbol.current) return;

        switch (msg.type) {
          case "kline_history":
            setKlineHistory(msg.data as KlineData[]);
            break;

          case "kline":
            setLiveBar(msg.data as KlineData);
            break;

          case "ticker":
            updateTicker(msg.data as Ticker);
            break;

          case "orderbook":
            setOrderBook(msg.data as OrderBook);
            break;

          case "trade":
            addTrade(msg.data as TradeRecord);
            break;
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      setStatus("disconnected");
      console.log("[WS] 连接断开，3s 后重连...");
      reconnectTimer.current = setTimeout(() => connect(), 3000);
    };

    ws.onerror = () => {
      setStatus("error");
      ws.close();
    };
  }, [symbol, updateTicker, setOrderBook, addTrade]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // 阻止重连
        wsRef.current.close();
        wsRef.current = null;
      }
      setStatus("disconnected");
    };
  }, [connect]);

  return { status, klineHistory, liveBar };
}
