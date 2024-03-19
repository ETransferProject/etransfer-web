import BigNumber from 'bignumber.js';
import BN, { isBN } from 'bn.js';
import { isEffectiveNumber, ZERO } from 'constants/misc';

export function timesDecimals(a?: BigNumber.Value, decimals: string | number = 18) {
  if (!a) return ZERO;
  const bigA = ZERO.plus(a);
  if (bigA.isNaN()) return ZERO;
  if (typeof decimals === 'string' && decimals.length > 10) return bigA.times(decimals);
  return bigA.times(`1e${decimals}`);
}

export function divDecimals(a?: BigNumber.Value, decimals: string | number = 18) {
  if (!a) return ZERO;
  const bigA = ZERO.plus(a);
  if (bigA.isNaN()) return ZERO;
  if (typeof decimals === 'string' && decimals.length > 10) return bigA.div(decimals);
  return bigA.div(`1e${decimals}`);
}

export function divDecimalsStr(
  a?: BigNumber.Value,
  decimals: string | number = 8,
  defaultVal = '--',
) {
  const n = divDecimals(a, decimals);
  return isEffectiveNumber(n) ? n.toFormat() : defaultVal;
}

export function bigNumberToWeb3Input(input: BigNumber): string {
  return BigNumber.isBigNumber(input) ? input.toFixed(0) : new BigNumber(input).toFixed(0);
}

export function valueToPercentage(input?: BigNumber.Value) {
  return BigNumber.isBigNumber(input) ? input.times(100) : timesDecimals(input, 2);
}

export function zeroFill(str: string | BN) {
  return isBN(str) ? str.toString(16, 64) : str.padStart(64, '0');
}

/**
 * currency show as role: fixed(2) and min is 0.01
 * @param strValue amount value
 * @param currency currency type
 * @returns string
 */
export function valueFixed2LessThanMin(strValue: string, currency?: string): string {
  let valueBigNumber = new BigNumber(strValue);
  if (valueBigNumber.isNaN()) {
    return '--';
  }

  valueBigNumber = valueBigNumber.dp(2, BigNumber.ROUND_DOWN);

  if (valueBigNumber.isLessThan(0.01)) {
    return currency ? `<${currency}0.01` : '<$0.01';
  }

  return `${currency}${valueBigNumber.toString()}`;
}
