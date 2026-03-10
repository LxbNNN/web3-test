type MessageHandler = (data: unknown) => void
type EventType = "ticker" | "orderbook" | "trade" | "kline" | "order"

class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private handlers: Map<EventType, Set<MessageHandler>> = new Map()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectDelay = 3000
  private isManualClose = false

  constructor(url: string) {
    this.url = url
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return
    this.isManualClose = false

    this.ws = new WebSocket(this.url)

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data as string) as { type: EventType; data: unknown }
        const handlers = this.handlers.get(message.type)
        handlers?.forEach((handler) => handler(message.data))
      } catch {
        // ignore malformed messages
      }
    }

    this.ws.onclose = () => {
      if (!this.isManualClose) {
        this.reconnectTimer = setTimeout(() => this.connect(), this.reconnectDelay)
      }
    }

    this.ws.onerror = () => {
      this.ws?.close()
    }
  }

  disconnect() {
    this.isManualClose = true
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.ws?.close()
    this.ws = null
  }

  subscribe(type: EventType, handler: MessageHandler) {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set())
    this.handlers.get(type)!.add(handler)
  }

  unsubscribe(type: EventType, handler: MessageHandler) {
    this.handlers.get(type)?.delete(handler)
  }

  send(data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }
}

let wsClient: WebSocketClient | null = null

export function getWsClient(url: string): WebSocketClient {
  if (!wsClient) {
    wsClient = new WebSocketClient(url)
  }
  return wsClient
}
