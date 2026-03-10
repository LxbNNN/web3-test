"use client"

import { WagmiProvider } from "wagmi"
import { wagmiConfig } from "@/config/wagmi"

export function WagmiClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      {children}
    </WagmiProvider>
  )
}
