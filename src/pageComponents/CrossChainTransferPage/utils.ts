import { NETWORK_TOKEN_RELATIONS } from 'constants/index';
import { TNetworkItem, TTokenItem } from 'types/api';

function removeDuplicate(arr: string[]) {
  const newArr: string[] = [];
  arr.forEach((item) => {
    if (!newArr.includes(item)) {
      newArr.push(item);
    }
  });
  return newArr;
}

export function computeToNetworkList(
  currentFromNetwork: TNetworkItem,
  totalNetworkList: TNetworkItem[],
  totalTokenList: TTokenItem[],
): TNetworkItem[] {
  const currentRelations = (NETWORK_TOKEN_RELATIONS as any)[currentFromNetwork.network];
  const fromNetworkTokens = Object.keys(currentRelations);

  const availableTokens = fromNetworkTokens.filter((token: string) =>
    totalTokenList.some((t) => t.symbol === token),
  );

  let repeatNetworkList: string[] = [];
  availableTokens.forEach((token: string) => {
    const _list = currentRelations[token];
    repeatNetworkList = repeatNetworkList.concat(_list);
  });
  const _networkList = removeDuplicate(repeatNetworkList);

  const toNetworkList = totalNetworkList.filter((network) => {
    if (network.network === currentFromNetwork.network) return false;

    return _networkList.includes(network.network);
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

  const currentRelations = (NETWORK_TOKEN_RELATIONS as any)[fromNetwork.network];
  const fromNetworkTokens = Object.keys(currentRelations);

  const availableTokens = fromNetworkTokens.filter((token: string) =>
    totalTokenList.some((t) => t.symbol === token),
  );

  const toNetworkTokens: string[] = [];

  availableTokens.forEach((token) => {
    const _list: string[] = currentRelations[token];
    if (_list.includes(toNetwork.network)) {
      toNetworkTokens.push(token);
    }
  });

  const result = totalTokenList.filter((token) => toNetworkTokens.includes(token.symbol));
  return result;
}
