export const siteConfig = {
  name: "CryptoEx",
  description: "安全、快速的加密货币交易所",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  wsUrl: process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000",
}
