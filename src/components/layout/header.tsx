"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useLogout } from "@/hooks/use-auth";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Wallet,
  FileText,
  Settings,
  LogOut,
  BarChart2,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "行情" },
  { href: "/trade/BTCUSDT", label: "现货" },
  { href: "/wallet", label: "钱包" },
];

export function Header() {
  const { user, isAuthenticated } = useAuthStore();
  const logout = useLogout();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-screen-2xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <BarChart2 className="h-5 w-5 text-primary" />
          {siteConfig.name}
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <>
              <Link href="/wallet">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <Wallet className="h-4 w-4" />
                  资产
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full outline-none">
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarFallback className="text-xs">
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user.username}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push("/account")}
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" /> 账户设置
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/orders")}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" /> 订单历史
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/account/kyc")}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" /> KYC 认证
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 text-destructive"
                  >
                    <LogOut className="h-4 w-4" /> 退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  登录
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">注册</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
