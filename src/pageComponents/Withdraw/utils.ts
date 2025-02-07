import { TGetTokenNetworkRelationResult, TNetworkItem } from 'types/api';

function removeDuplicateAndReturnList(arr: TNetworkItem[]) {
  const newArr: TNetworkItem[] = [];
  arr.forEach((item) => {
    const duplicate = newArr.find((newItem) => newItem.network === item.network);
    if (!duplicate) {
      newArr.push(item);
    }
  });
  return newArr;
}

export function computeFromNetworkList(
  tokenSymbol: string,
  totalNetworkList?: TNetworkItem[],
  tokenChainRelation?: TGetTokenNetworkRelationResult,
): TNetworkItem[] {
  if (!tokenChainRelation || !totalNetworkList) return [];

  const networkKeyList: string[] = [];
  Object.keys(tokenChainRelation).forEach((network) => {
    if (Object.keys(tokenChainRelation[network]).includes(tokenSymbol)) {
      networkKeyList.push(network);
    }
  });

  const networkList: TNetworkItem[] = [];
  totalNetworkList.forEach((networkObj) => {
    if (networkKeyList.includes(networkObj.network)) {
      networkList.push(networkObj);
    }
  });

  return removeDuplicateAndReturnList(networkList);
}

export function computeToNetworkList(
  currentFromNetwork: TNetworkItem,
  tokenSymbol: string,
  totalNetworkList?: TNetworkItem[],
  tokenChainRelation?: TGetTokenNetworkRelationResult,
): TNetworkItem[] {
  if (!totalNetworkList || !tokenChainRelation) return [];

  const currentRelations = tokenChainRelation[currentFromNetwork.network];
  const currentToNetwork = currentRelations[tokenSymbol];

  const networkKeyList: string[] = [];
  currentToNetwork.forEach((networkObj) => {
    networkKeyList.push(networkObj.network);
  });

  const toNetworkList: TNetworkItem[] = [];
  totalNetworkList.forEach((networkObj) => {
    if (networkKeyList.includes(networkObj.network)) {
      toNetworkList.push(networkObj);
    }
  });

  return toNetworkList;
}
