import { createConfig, http } from "wagmi"
import { mainnet, bsc, polygon } from "wagmi/chains"
import { injected, metaMask } from "wagmi/connectors"

export const SUPPORTED_CHAINS = [mainnet, bsc, polygon] as const

export const wagmiConfig = createConfig({
  chains: SUPPORTED_CHAINS,
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [mainnet.id]: http(),
    [bsc.id]:     http(),
    [polygon.id]: http(),
  },
})

/** 支持充值的网络配置 */
export const DEPOSIT_NETWORKS = [
  {
    chainId:  mainnet.id,
    name:     "Ethereum (ERC20)",
    shortName: "ERC20",
    icon:     "⟠",
    confirmations: 12,
    minDeposit: "0.001",
    fee: "0",
  },
  {
    chainId:  bsc.id,
    name:     "BNB Smart Chain (BEP20)",
    shortName: "BEP20",
    icon:     "⬡",
    confirmations: 15,
    minDeposit: "0.1",
    fee: "0",
  },
  {
    chainId:  polygon.id,
    name:     "Polygon (MATIC)",
    shortName: "MATIC",
    icon:     "⬡",
    confirmations: 20,
    minDeposit: "1",
    fee: "0",
  },
] as const

/** 支持充值的币种 */
export const DEPOSIT_TOKENS = [
  { symbol: "USDT", name: "Tether USD",      decimals: 6,  color: "#26a17b" },
  { symbol: "USDC", name: "USD Coin",         decimals: 6,  color: "#2775ca" },
  { symbol: "ETH",  name: "Ethereum",         decimals: 18, color: "#627eea" },
  { symbol: "BNB",  name: "BNB",              decimals: 18, color: "#f3ba2f" },
  { symbol: "BTC",  name: "Bitcoin (WBTC)",   decimals: 8,  color: "#f7931a" },
  { symbol: "SOL",  name: "Solana (SOL)",     decimals: 9,  color: "#9945ff" },
] as const
