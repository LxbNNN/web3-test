"use client";

import { useState } from "react";
import { useConnection } from "wagmi";
import { AssetTable } from "@/components/wallet/asset-table";
import { DepositPanel } from "@/components/wallet/deposit-panel";
import { WithdrawPanel } from "@/components/wallet/withdraw-panel";
import { ConnectButton } from "@/components/wallet/connect-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BN } from "@/lib/bignumber";
import type { WalletAsset } from "@/types";
import {
  Wallet,
  LayoutGrid,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";

// ─── 模拟持仓数据（真实场景从后端 API 拉取）────────────────────────────────────
const MOCK_PRICES: Record<string, string> = {
  USDT: "1",
  USDC: "1",
  BTC: "65000",
  ETH: "3200",
  BNB: "580",
  SOL: "140",
};

const MOCK_BALANCES: WalletAsset[] = [
  {
    symbol: "USDT",
    name: "Tether USD",
    color: "#26a17b",
    free: "10234.56",
    locked: "500.00",
    usdtPrice: "1",
    usdtValue: "10734.56",
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    color: "#f7931a",
    free: "0.12345",
    locked: "0",
    usdtPrice: "65000",
    usdtValue: "8024.25",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    color: "#627eea",
    free: "2.5678",
    locked: "0.5",
    usdtPrice: "3200",
    usdtValue: "9816.96",
  },
  {
    symbol: "BNB",
    name: "BNB",
    color: "#f3ba2f",
    free: "15.123",
    locked: "0",
    usdtPrice: "580",
    usdtValue: "8771.34",
  },
  {
    symbol: "SOL",
    name: "Solana",
    color: "#9945ff",
    free: "50.5",
    locked: "10",
    usdtPrice: "140",
    usdtValue: "8470.00",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    color: "#2775ca",
    free: "2000.00",
    locked: "0",
    usdtPrice: "1",
    usdtValue: "2000.00",
  },
];

// 根据 MOCK_PRICES 实时计算 usdtValue（演示 BigNumber 乘法）
const assetsWithValue: WalletAsset[] = MOCK_BALANCES.map((a) => {
  const total = BN(a.free).plus(BN(a.locked));
  const price = BN(MOCK_PRICES[a.symbol] ?? "0");
  const usdtValue = total.times(price).toFixed(2, 1);
  return { ...a, usdtValue };
});

export default function WalletPage() {
  const { isConnected } = useConnection();
  const [activeTab, setActiveTab] = useState("overview");
  const [depositSymbol, setDepositSymbol] = useState("USDT");
  const [withdrawSymbol, setWithdrawSymbol] = useState("USDT");

  const handleDeposit = (symbol: string) => {
    setDepositSymbol(symbol);
    setActiveTab("deposit");
  };

  const handleWithdraw = (symbol: string) => {
    setWithdrawSymbol(symbol);
    setActiveTab("withdraw");
  };

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      {/* 页头 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">资产管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理您的数字资产，充值和提现
          </p>
        </div>
        <ConnectButton />
      </div>

      {/* 已连接钱包信息条 */}
      {isConnected && <WalletChainInfo />}

      {/* 主内容 Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 h-10">
          <TabsTrigger value="overview" className="gap-1.5 px-4">
            <LayoutGrid className="h-4 w-4" /> 资产总览
          </TabsTrigger>
          <TabsTrigger value="deposit" className="gap-1.5 px-4">
            <ArrowDownToLine className="h-4 w-4" /> 充值
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="gap-1.5 px-4">
            <ArrowUpFromLine className="h-4 w-4" /> 提现
          </TabsTrigger>
        </TabsList>

        {/* 总览 */}
        <TabsContent value="overview" className="mt-0">
          <AssetTable
            assets={assetsWithValue}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
          />
        </TabsContent>

        {/* 充值 */}
        <TabsContent value="deposit" className="mt-0">
          <DepositPanel defaultSymbol={depositSymbol} />
        </TabsContent>

        {/* 提现 */}
        <TabsContent value="withdraw" className="mt-0">
          <WithdrawPanel
            assets={assetsWithValue}
            defaultSymbol={withdrawSymbol}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── 已连接钱包的链信息条 ──────────────────────────────────────────────────────
function WalletChainInfo() {
  const { address, chain } = useConnection();

  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
        <Wallet className="h-4 w-4 text-green-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-green-300">钱包已连接</p>
        <p className="text-xs text-muted-foreground font-mono">
          {address} · {chain?.name ?? "未知网络"}
        </p>
      </div>
    </div>
  );
}
