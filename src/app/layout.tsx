import type { Metadata } from "next"
import { QueryProvider } from "@/providers/query-provider"
import { WagmiClientProvider } from "@/providers/wagmi-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { siteConfig } from "@/config/site"
import "./globals.css"

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased">
        <WagmiClientProvider>
          <QueryProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </QueryProvider>
        </WagmiClientProvider>
      </body>
    </html>
  )
}
