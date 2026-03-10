import Link from "next/link"
import { siteConfig } from "@/config/site"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-8">
      <div className="mx-auto max-w-screen-2xl px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground">服务条款</Link>
            <Link href="/privacy" className="hover:text-foreground">隐私政策</Link>
            <Link href="/support" className="hover:text-foreground">帮助中心</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
