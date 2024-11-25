import { TO_NETWORK_TOKEN_CONFIG } from 'constants/index';
import { TNetworkItem, TTokenItem } from 'types/api';

export function computeToNetworkList(
  currentFromNetwork: TNetworkItem,
  totalNetworkList: TNetworkItem[],
  totalTokenList: TTokenItem[],
): TNetworkItem[] {
  const fromNetworkTokens = (TO_NETWORK_TOKEN_CONFIG as any)[currentFromNetwork.network] || [];
  const availableTokens = fromNetworkTokens.filter((token: string) =>
    totalTokenList.some((t) => t.symbol === token),
  );

  const toNetworkList = totalNetworkList.filter((network) => {
    if (network.network === currentFromNetwork.network) return false;

    const toNetworkTokens = (TO_NETWORK_TOKEN_CONFIG as any)[network.network] || [];
    return availableTokens.some((token: string) => toNetworkTokens.includes(token));
  });

  return toNetworkList;
}

export function computeTokenList({
  fromNetwork,
  toNetwork,
  totalTokenList,
}: {
  fromNetwork?: TNetworkItem;
  toNetwork?: TNetworkItem;
  totalTokenList: TTokenItem[];
}): TTokenItem[] {
  if (!fromNetwork || !toNetwork) return totalTokenList;

  const fromNetworkTokens = (TO_NETWORK_TOKEN_CONFIG as any)[fromNetwork.network] || [];
  const toNetworkTokens = (TO_NETWORK_TOKEN_CONFIG as any)[toNetwork.network] || [];

  const commonTokens = fromNetworkTokens.filter((token: string) => toNetworkTokens.includes(token));

  const result = totalTokenList.filter((token) => commonTokens.includes(token.symbol));
  return result;
}
