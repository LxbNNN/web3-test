export interface WalletAsset {
  symbol:     string
  name:       string
  icon?:      string
  color?:     string
  free:       string   // 可用余额
  locked:     string   // 冻结余额
  usdtPrice:  string   // 当前 USDT 单价
  usdtValue:  string   // 折合 USDT 总价值
}

export type DepositStatus = "pending" | "confirming" | "credited" | "failed"

export interface DepositRecord {
  txHash:      string
  symbol:      string
  network:     string
  amount:      string
  fee:         string
  status:      DepositStatus
  confirmations: number
  requiredConfirmations: number
  timestamp:   number
}

export type WithdrawStatus = "pending" | "processing" | "completed" | "rejected"

export interface WithdrawRecord {
  id:          string
  symbol:      string
  network:     string
  toAddress:   string
  amount:      string
  fee:         string
  status:      WithdrawStatus
  timestamp:   number
}
