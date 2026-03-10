"use client";

import { useConnection, useConnect, useDisconnect, useConnectors } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { truncateAddress } from "@/lib/format";
import { Wallet, ChevronDown, Copy, LogOut, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export function ConnectButton() {
  const { address, isConnected, connector } = useConnection();
  const connectors = useConnectors();
  const { mutate: connect, isPending } = useConnect();
  const { mutate: disconnect } = useDisconnect();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="outline-none">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-accent/50 transition-colors cursor-pointer">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono font-medium">
              {truncateAddress(address)}
            </span>
            <span className="text-muted-foreground text-xs">
              ({connector?.name})
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-2">
            <p className="text-xs text-muted-foreground mb-1">已连接钱包</p>
            <p className="font-mono text-xs break-all">{address}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={copyAddress}
            className="flex items-center gap-2 cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-400" /> 已复制
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> 复制地址
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => disconnect()}
            className="flex items-center gap-2 cursor-pointer text-destructive"
          >
            <LogOut className="h-4 w-4" /> 断开连接
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <Button className="gap-2" disabled={isPending}>
          <Wallet className="h-4 w-4" />
          {isPending ? "连接中..." : "连接钱包"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <p className="px-2 py-1.5 text-xs text-muted-foreground">选择钱包</p>
        <DropdownMenuSeparator />
        {connectors.map((c) => (
          <DropdownMenuItem
            key={c.id}
            onClick={() => connect({ connector: c })}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Wallet className="h-4 w-4" />
            {c.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
