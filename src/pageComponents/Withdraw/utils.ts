import { NetworkStatus, TGetTokenNetworkRelationResult, TNetworkItem } from 'types/api';

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
  if (!tokenChainRelation || !totalNetworkList || !Array.isArray(totalNetworkList)) return [];

  const networkKeyList: string[] = [];
  Object.keys(tokenChainRelation).forEach((network) => {
    if (Object.keys(tokenChainRelation[network]).includes(tokenSymbol)) {
      networkKeyList.push(network);
    }
  });

  const networkList: TNetworkItem[] = [];
  const _totalNetworkListCopy: TNetworkItem[] = JSON.parse(JSON.stringify(totalNetworkList));
  _totalNetworkListCopy.forEach((networkObj) => {
    // Rewrite status
    const _rewriteStatus =
      networkObj?.multiStatus?.[tokenSymbol] &&
      networkObj?.multiStatus?.[tokenSymbol] !== NetworkStatus.Offline
        ? NetworkStatus.Health
        : NetworkStatus.Offline;
    networkObj.status = _rewriteStatus;

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
  const _totalNetworkListCopy: TNetworkItem[] = JSON.parse(JSON.stringify(totalNetworkList));
  _totalNetworkListCopy.forEach((networkObj) => {
    // Rewrite status
    const _rewriteStatus =
      networkObj?.multiStatus?.[tokenSymbol] &&
      networkObj?.multiStatus?.[tokenSymbol] !== NetworkStatus.Offline
        ? NetworkStatus.Health
        : NetworkStatus.Offline;
    networkObj.status = _rewriteStatus;

    if (networkKeyList.includes(networkObj.network)) {
      toNetworkList.push(networkObj);
    }
  });

  return toNetworkList;
}
