import BigNumber from "bignumber.js";

/**
 * 全局 BigNumber 配置
 * - DECIMAL_PLACES: 内部精度保留 20 位，足够覆盖所有加密货币场景
 * - ROUNDING_MODE: 截断舍去（ROUND_DOWN），交易所展示标准：对用户保守
 * - EXPONENTIAL_AT: 禁用科学计数法，避免极小值显示为 1e-8
 */
BigNumber.config({
  DECIMAL_PLACES: 20,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  EXPONENTIAL_AT: [-20, 20],
  FORMAT: {
    prefix: "",
    decimalSeparator: ".",
    groupSeparator: ",",
    groupSize: 3,
    secondaryGroupSize: 0,
    fractionGroupSeparator: "",
    fractionGroupSize: 0,
    suffix: "",
  },
});

type BNInput = string | number | BigNumber | null | undefined;

/**
 * 安全构造 BigNumber。
 * null / undefined / "" / 非数字字符串 → 返回 BN(0)，不抛异常。
 */
export const BN = (n: BNInput): BigNumber => {
  if (n === null || n === undefined) return new BigNumber(0);
  if (typeof n === "string" && n.trim() === "") return new BigNumber(0);
  const result = new BigNumber(n);
  return result.isNaN() ? new BigNumber(0) : result;
};

/** 取两个 BigNumber 的较大值 */
export const bnMax = (a: BigNumber, b: BigNumber): BigNumber =>
  a.gt(b) ? a : b;

/** 取两个 BigNumber 的较小值 */
export const bnMin = (a: BigNumber, b: BigNumber): BigNumber =>
  a.lt(b) ? a : b;

/**
 * 判断输入是否可以被安全解析为有效 BigNumber（非 NaN、非 Infinite）。
 * null / undefined / "" 均视为无效。
 */
export const isValidBN = (n: BNInput): boolean => {
  if (n === null || n === undefined) return false;
  if (typeof n === "string" && n.trim() === "") return false;
  const bn = new BigNumber(n);
  return !bn.isNaN() && bn.isFinite();
};

export { BigNumber };
