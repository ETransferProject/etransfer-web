import {
  TO_NETWORK_TOKEN_CONFIG,
  TOKEN_NETWORK_RELATIONS,
  TransferAllowanceTokens,
} from 'constants/index';
import { BlockchainNetworkType } from 'constants/network';
import { TNetworkItem, TTokenItem } from 'types/api';

export function computeToNetworkList(
  currentFromNetwork: TNetworkItem,
  totalNetworkList: TNetworkItem[],
  totalTokenList: TTokenItem[],
): TNetworkItem[] {
  // Get a list of supported networks.
  const totalNetworkKeys: string[] = [];
  totalNetworkList.forEach((networkItem) => {
    totalNetworkKeys.push(networkItem.network);
  });

  // Get a list of networks that are allowed to transfer token.
  const toNetworkKeyList: BlockchainNetworkType[] = [];
  const toNetworkList: TNetworkItem[] = [];
  totalTokenList.forEach((token) => {
    const symbol = token.symbol as unknown as TransferAllowanceTokens;
    const networks = TOKEN_NETWORK_RELATIONS[symbol] || [];
    networks.forEach((network) => {
      if (
        network !== currentFromNetwork.network &&
        !toNetworkKeyList.includes(network) &&
        totalNetworkKeys.includes(network)
      ) {
        toNetworkKeyList.push(network);
        const target = totalNetworkList.find((item) => item.network === network);
        if (target) toNetworkList.push(target);
      }
    });
  });

  return toNetworkList;
}

export function computeTokenList(
  toNetwork: TNetworkItem,
  totalTokenList: TTokenItem[],
): TTokenItem[] {
  const network = toNetwork?.network as unknown as BlockchainNetworkType;
  const targetList: string[] = (TO_NETWORK_TOKEN_CONFIG as any)?.[network];

  const list: TTokenItem[] = [];
  if (Array.isArray(targetList) && targetList.length > 0) {
    totalTokenList.forEach((token) => {
      if (targetList?.includes(token.symbol)) {
        list.push(token);
      }
    });
  }

  return list;
}
