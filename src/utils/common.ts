import { EXPLORE_CONFIG, SupportedELFChainId } from 'constants/index';
import { AelfExploreType, ExploreUrlType, OtherExploreType } from 'constants/network';

export function getAelfExploreLink(
  data: string,
  type: AelfExploreType,
  chainId: SupportedELFChainId,
): string {
  const prefix = EXPLORE_CONFIG[chainId];
  switch (type) {
    case AelfExploreType.transaction: {
      return `${prefix}tx/${data}`;
    }
    case AelfExploreType.token: {
      return `${prefix}token/${data}`;
    }
    case AelfExploreType.block: {
      return `${prefix}block/${data}`;
    }
    case AelfExploreType.address:
    default: {
      return `${prefix}address/${data}`;
    }
  }
}

export function getOtherExploreLink(
  data: string,
  type: OtherExploreType,
  network: keyof typeof ExploreUrlType,
): string {
  const prefix = ExploreUrlType[network];
  switch (type) {
    case OtherExploreType.transaction: {
      if (network === 'TRX') {
        console.log(
          '🌈 🌈 🌈 🌈 🌈 🌈 `${prefix}/#/transaction/${data}`',
          `${prefix}/#/transaction/${data}`,
        );
        return `${prefix}/#/transaction/${data}`;
      }
      return `${prefix}/tx/${data}`;
    }
    case OtherExploreType.address:
    default: {
      if (network === 'TRX') {
        return `${prefix}/#/address/${data}`;
      }
      return `${prefix}/address/${data}`;
    }
  }
}

export function openWithBlank(url: string): void {
  const newWindow = window.open(url, '_blank');
  if (newWindow) {
    newWindow.opener = null;
  }
}
