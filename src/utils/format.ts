import BigNumber from 'bignumber.js';
import { divDecimals } from './calculate';
import { BlockchainNetworkType } from 'constants/network';
import { ChainNamePrefix } from 'constants/index';
import { ZERO } from 'constants/calculate';

/**
 * this function is to format address,just like "formatStr2EllipsisStr" ---> "for...Str"
 * @param address
 * @param digits [pre_count, suffix_count]
 * @param type
 * @returns
 */
export const formatStr2Ellipsis = (
  address = '',
  digits = [10, 10],
  type: 'middle' | 'tail' = 'middle',
): string => {
  if (!address) return '';

  const len = address.length;

  if (type === 'tail') return `${address.slice(0, digits[0])}...`;

  if (len < digits[0] + digits[1]) return address;
  const pre = address.substring(0, digits[0]);
  const suffix = address.substring(len - digits[1]);
  return `${pre}...${suffix}`;
};

export enum AmountSign {
  PLUS = '+',
  MINUS = '-',
  USD = '$ ',
  EMPTY = '',
}

export interface IFormatWithCommasProps {
  amount?: string | number;
  decimals?: string | number;
  digits?: number;
  sign?: AmountSign;
}
export const DEFAULT_AMOUNT = 0;
export const DEFAULT_DECIMAL = 6;
export const DEFAULT_DIGITS = 6;

/**
 * formatAmount with prefix and thousand mark, not unit
 * @example $11.1  +11.1  -11.1  9,999.9
 */
export function formatWithCommas({
  amount = DEFAULT_AMOUNT,
  decimals,
  digits = DEFAULT_DIGITS,
  sign = AmountSign.EMPTY,
}: IFormatWithCommasProps): string {
  const decimal = decimals || 0;
  const splitList = (typeof amount === 'number' ? amount.toString() : amount).split('.');

  const afterPoint = splitList[1];
  const amountTrans =
    `${divDecimals(ZERO.plus(splitList[0]), decimal).decimalPlaces(digits).toFormat()}` +
    `${afterPoint ? '.' + afterPoint : ''}`;

  if (sign && amountTrans !== '0') {
    return `${sign}${amountTrans}`;
  }
  return amountTrans;
}

export const parseWithCommas = (value?: string | null) => {
  return value ? new BigNumber(value.replace(/,/g, '')).toFixed() : '';
};

export const parseWithStringCommas = (value?: string | null) => {
  return value ? value.replace(/,/g, '') : '';
};

export const replaceCharacter = (str: string, replaced: string, replacedBy: string) => {
  return str?.replace(replaced, replacedBy);
};

export const formatSymbolDisplay = (str: string) => {
  if (!str) return '';

  // Prevent malicious tampering of the token display issued by users
  if (str?.includes('SGR-1')) return replaceCharacter(str, '-1', '');

  return str;
};

export const formatNetworkName = (item: string) => {
  switch (item) {
    case BlockchainNetworkType.AELF:
      return ChainNamePrefix.MainChain;
    case BlockchainNetworkType.tDVV:
      return ChainNamePrefix.SideChain;
    case BlockchainNetworkType.tDVW:
      return ChainNamePrefix.SideChain;
    default:
      return item;
  }
};

export const formatNetworkKey = (network?: string) => {
  if (!network) return '';
  switch (network) {
    case BlockchainNetworkType.tDVV:
      return BlockchainNetworkType.AELF;
    case BlockchainNetworkType.tDVW:
      return BlockchainNetworkType.AELF;
    default:
      return network;
  }
};

export function stringToHex(str: string) {
  let val = '';
  for (let i = 0; i < str.length; i++) {
    if (val === '') val = str.charCodeAt(i).toString(16);
    else val += str.charCodeAt(i).toString(16);
  }
  return val;
}

export const formatListWithAnd = (items: string[]): string => {
  if (items.length > 1) {
    const lastItem = items.pop();
    return `${items.join(', ')} and ${lastItem}`;
  }
  return items.join(', ');
};
