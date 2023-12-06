import { AelfInstancesKey, ChainId } from 'types';
import { isELFChain } from './aelfUtils';
import { ELFChainConstants } from 'constants/ChainConstants';
import AElf from 'aelf-sdk';
import BigNumber from 'bignumber.js';

export const sleep = (time: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

export function getExploreLink(
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block',
  chainId?: ChainId,
): string {
  let prefix = '';
  if (isELFChain(chainId)) {
    prefix = ELFChainConstants.constants[chainId as AelfInstancesKey]?.CHAIN_INFO?.exploreUrl;
  }
  switch (type) {
    case 'transaction': {
      return `${prefix}tx/${data}`;
    }
    case 'token': {
      return `${prefix}token/${data}`;
    }
    case 'block': {
      return `${prefix}block/${data}`;
    }
    case 'address':
    default: {
      return `${prefix}address/${data}`;
    }
  }
}

export const isELFAddress = (value: string) => {
  if (/[\u4e00-\u9fa5]/.test(value)) return false;
  try {
    return !!AElf.utils.decodeAddressRep(value);
  } catch {
    return false;
  }
};

export function shortenAddress(address: string | null, chars = 4, end = 42): string {
  const parsed = address;
  if (!parsed) throw Error(`Invalid 'address' parameter '${address}'.`);
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(end - chars)}`;
}

export function shortenString(address: string | null, chars = 10): string {
  const parsed = address;
  if (!parsed) return '';
  return `${parsed.substring(0, chars)}...${parsed.substring(parsed.length - chars)}`;
}

export const formatWithThousandsSeparator = (
  value?: string | number | null,
  info?: {
    inputValue?: string | number | null;
    isTyping?: boolean;
  },
) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const endsWithDot =
    info?.isTyping && typeof info?.inputValue === 'string' && info?.inputValue.endsWith('.');
  const bigNumberValue = new BigNumber(value).toFixed();
  const parts = bigNumberValue.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return endsWithDot ? `${parts[0]}.` : parts.join('.');
};

export const parserWithThousandsSeparator = (value?: string | null) => {
  return value ? new BigNumber(value.replace(/,/g, '')).toFixed() : '';
};
