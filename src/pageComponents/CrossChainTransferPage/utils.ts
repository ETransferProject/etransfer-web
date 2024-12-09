import {
  TGetTokenNetworkRelationItem,
  TGetTokenNetworkRelationResult,
  TNetworkItem,
  TTokenItem,
} from 'types/api';

function removeDuplicate(arr: TGetTokenNetworkRelationItem[]) {
  const newArr: string[] = [];
  arr.forEach((item) => {
    if (!newArr.includes(item.network)) {
      newArr.push(item.network);
    }
  });
  return newArr;
}

export function computeToNetworkList(
  currentFromNetwork: TNetworkItem,
  totalNetworkList: TNetworkItem[],
  totalTokenList: TTokenItem[],
  tokenChainRelation?: TGetTokenNetworkRelationResult,
): TNetworkItem[] {
  if (!tokenChainRelation) return [];
  const currentRelations = tokenChainRelation[currentFromNetwork.network];
  const fromNetworkTokens = Object.keys(currentRelations);

  const availableTokens = fromNetworkTokens.filter((token: string) =>
    totalTokenList.some((t) => t.symbol === token),
  );
  let repeatNetworkList: TGetTokenNetworkRelationItem[] = [];
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
  tokenChainRelation,
}: {
  fromNetwork?: TNetworkItem;
  toNetwork?: TNetworkItem;
  totalTokenList: TTokenItem[];
  tokenChainRelation?: TGetTokenNetworkRelationResult;
}): TTokenItem[] {
  if (!fromNetwork || !toNetwork || !tokenChainRelation) return totalTokenList;

  const currentRelations = tokenChainRelation[fromNetwork.network];
  const fromNetworkTokens = Object.keys(currentRelations);

  const availableTokens = fromNetworkTokens.filter((token: string) =>
    totalTokenList.some((t) => t.symbol === token),
  );

  const toNetworkTokens: string[] = [];

  availableTokens.forEach((token: string) => {
    const _list: TGetTokenNetworkRelationItem[] = currentRelations[token];
    const _networkList: string[] = [];
    _list.forEach((item) => {
      _networkList.push(item.network);
    }, []);
    if (_networkList.includes(toNetwork.network)) {
      toNetworkTokens.push(token);
    }
  });

  const result = totalTokenList.filter((token) => toNetworkTokens.includes(token.symbol));
  return result;
}
