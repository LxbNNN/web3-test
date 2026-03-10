import { BN, BigNumber, isValidBN } from "@/lib/bignumber"

type BNInput = string | number | BigNumber | null | undefined

// ─── 阈值常量（BigNumber，避免重复构造）─────────────────────────────────────────
const BN_ZERO   = BN("0")
const BN_ONE    = BN("1")
const BN_THOU   = BN("1000")
const BN_MIL    = BN("1000000")
const BN_BIL    = BN("1000000000")
const BN_HUNDRED = BN("100")

/**
 * 格式化价格
 * - 指定 decimals：固定精度，千位分隔
 * - 自动精度：≥1000 → 2位，≥1 → 4位，<1 → 6位（最多8位）
 */
export function formatPrice(price: BNInput, decimals?: number): string {
  const bn = BN(price)
  if (!isValidBN(price)) return "0.00"

  if (decimals !== undefined) {
    return bn.toFormat(decimals, BigNumber.ROUND_DOWN)
  }

  if (bn.gte(BN_THOU)) return bn.toFormat(2, BigNumber.ROUND_DOWN)
  if (bn.gte(BN_ONE))  return bn.toFormat(4, BigNumber.ROUND_DOWN)
  // 小于 1 的低价币：最多 8 位，去掉尾部零后最少 6 位
  return bn.toFormat(8, BigNumber.ROUND_DOWN)
}

/**
 * 格式化交易数量
 */
export function formatQuantity(qty: BNInput, decimals = 4): string {
  const bn = BN(qty)
  if (!isValidBN(qty)) return "0"
  return bn.toFormat(decimals, BigNumber.ROUND_DOWN)
}

/**
 * 格式化交易量（K/M/B 缩写）
 */
export function formatVolume(volume: BNInput): string {
  const bn = BN(volume)
  if (!isValidBN(volume)) return "0"

  if (bn.gte(BN_BIL)) return `${bn.dividedBy(BN_BIL).toFixed(2, BigNumber.ROUND_DOWN)}B`
  if (bn.gte(BN_MIL)) return `${bn.dividedBy(BN_MIL).toFixed(2, BigNumber.ROUND_DOWN)}M`
  if (bn.gte(BN_THOU)) return `${bn.dividedBy(BN_THOU).toFixed(2, BigNumber.ROUND_DOWN)}K`
  return bn.toFixed(2, BigNumber.ROUND_DOWN)
}

/**
 * 格式化涨跌幅百分比（+/- 前缀，2位小数）
 */
export function formatPercent(percent: BNInput): string {
  const bn = BN(percent)
  if (!isValidBN(percent)) return "0.00%"
  const sign = bn.gte(BN_ZERO) ? "+" : ""
  // 涨跌幅采用四舍五入，符合交易所惯例
  return `${sign}${bn.toFixed(2, BigNumber.ROUND_HALF_UP)}%`
}

/**
 * 计算价格变动方向
 */
export function getPriceDirection(change: BNInput): "up" | "down" | "neutral" {
  const bn = BN(change)
  if (!isValidBN(change)) return "neutral"
  if (bn.gt(BN_ZERO)) return "up"
  if (bn.lt(BN_ZERO)) return "down"
  return "neutral"
}

/**
 * 计算订单总价：price × quantity（BigNumber 精确乘法）
 */
export function calcOrderTotal(price: BNInput, quantity: BNInput): string {
  const bnPrice = BN(price)
  const bnQty   = BN(quantity)
  if (!isValidBN(price) || !isValidBN(quantity)) return "0.00"
  if (bnPrice.lte(BN_ZERO) || bnQty.lte(BN_ZERO)) return "0.00"
  return bnPrice.times(bnQty).toFixed(2, BigNumber.ROUND_DOWN)
}

/**
 * 计算手续费：amount × feeRate（BigNumber 精确乘法）
 */
export function calcFee(amount: BNInput, feeRate: BNInput): string {
  const bnAmount = BN(amount)
  const bnRate   = BN(feeRate)
  if (!isValidBN(amount) || !isValidBN(feeRate)) return "0.00000000"
  return bnAmount.times(bnRate).toFixed(8, BigNumber.ROUND_UP)
}

/**
 * 计算涨跌幅：(current - base) / base × 100
 */
export function calcChangePercent(current: BNInput, base: BNInput): string {
  const bnCurrent = BN(current)
  const bnBase    = BN(base)
  if (!isValidBN(current) || !isValidBN(base) || bnBase.isZero()) return "0.00"
  return bnCurrent.minus(bnBase).dividedBy(bnBase).times(BN_HUNDRED)
    .toFixed(2, BigNumber.ROUND_HALF_UP)
}

/**
 * 截断钱包地址显示
 */
export function truncateAddress(address: string, start = 6, end = 4): string {
  if (address.length <= start + end) return address
  return `${address.slice(0, start)}...${address.slice(-end)}`
}

/**
 * 格式化时间
 */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}
