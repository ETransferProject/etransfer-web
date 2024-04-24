import { ChainId } from 'types';
import { EXPLORE_CONFIG } from 'constants/index';
import { ExploreUrlType } from 'constants/network';
import AElf from 'aelf-sdk';

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
  chainId: ChainId,
): string {
  const prefix = EXPLORE_CONFIG[chainId];
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

export function getOtherExploreLink(
  data: string,
  network: keyof typeof ExploreUrlType,
  type: 'transaction' | 'address',
): string {
  const prefix = ExploreUrlType[network];
  switch (type) {
    case 'transaction': {
      if (network === 'TRX') {
        return `${prefix}/#/transaction/${data}`;
      }
      return `${prefix}/tx/${data}`;
    }
    case 'address':
    default: {
      if (network === 'TRX') {
        return `${prefix}/#/address/${data}`;
      }
      return `${prefix}/address/${data}`;
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

export function openWithBlank(url: string): void {
  const newWindow = window.open(url, '_blank');
  if (newWindow) {
    newWindow.opener = null;
  }
}
