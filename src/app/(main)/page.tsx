import Link from "next/link"
import { TRADING_PAIRS } from "@/config/trading-pairs"

export default function HomePage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">行情</h1>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground">
              <th className="py-3 pl-4 text-left font-normal">交易对</th>
              <th className="py-3 text-right font-normal">最新价</th>
              <th className="py-3 text-right font-normal">24h 涨跌</th>
              <th className="py-3 text-right font-normal">24h 高</th>
              <th className="py-3 text-right font-normal">24h 低</th>
              <th className="py-3 pr-4 text-right font-normal">24h 量</th>
            </tr>
          </thead>
          <tbody>
            {TRADING_PAIRS.map((pair) => (
              <tr
                key={pair.symbol}
                className="border-b border-border/50 transition-colors hover:bg-accent/30"
              >
                <td className="py-3 pl-4">
                  <Link
                    href={`/trade/${pair.symbol}`}
                    className="font-medium hover:text-primary"
                  >
                    {pair.displayName}
                  </Link>
                </td>
                <td className="py-3 text-right tabular-nums text-muted-foreground">--</td>
                <td className="py-3 text-right tabular-nums text-muted-foreground">--</td>
                <td className="py-3 text-right tabular-nums text-muted-foreground">--</td>
                <td className="py-3 text-right tabular-nums text-muted-foreground">--</td>
                <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">--</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
