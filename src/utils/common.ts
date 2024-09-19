import { TChainId } from '@aelf-web-login/wallet-adapter-base';
import { EXPLORE_CONFIG } from 'constants/index';
import {
  AelfExploreType,
  BlockchainNetworkType,
  ExploreUrlNotAelf,
  LOOP_TOP_TX_URL,
  OtherExploreType,
} from 'constants/network';

export function getAelfExploreLink(data: string, type: AelfExploreType, chainId: TChainId): string {
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
  network: keyof typeof ExploreUrlNotAelf,
): string {
  const prefix = ExploreUrlNotAelf[network];
  switch (type) {
    case OtherExploreType.transaction: {
      if (network === 'TRX') {
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

export const viewTxDetailInExplore = (
  network: string,
  txHash: string,
  isCoboHash: boolean,
  chainId?: TChainId,
) => {
  if (isCoboHash) {
    openWithBlank(LOOP_TOP_TX_URL + txHash);
    return;
  }
  if (network === BlockchainNetworkType.AELF && chainId) {
    openWithBlank(getAelfExploreLink(txHash, AelfExploreType.transaction, chainId));
    return;
  }
  openWithBlank(
    getOtherExploreLink(
      txHash,
      OtherExploreType.transaction,
      network as keyof typeof ExploreUrlNotAelf,
    ),
  );
};
