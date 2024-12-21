import { ZERO } from '@etransfer/utils';
import { ContractType } from 'constants/chain';
import { ADDRESS_MAP, SupportedELFChainId } from 'constants/index';
import { APPROVE_ELF_FEE } from 'constants/withdraw';
import {
  TGetTokenNetworkRelationItem,
  TGetTokenNetworkRelationResult,
  TNetworkItem,
  TTokenItem,
} from 'types/api';
import { checkIsEnoughAllowance } from 'utils/contract';

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

export async function getAelfMaxBalance({
  balance,
  aelfFee,
  fromNetwork,
  tokenSymbol,
  account,
}: {
  balance: string;
  aelfFee?: string;
  fromNetwork?: string;
  tokenSymbol: string;
  account: string;
}) {
  let _maxInput = balance;

  if (_maxInput && aelfFee && ZERO.plus(aelfFee).gt(0)) {
    const _chainId = fromNetwork as SupportedELFChainId;
    const isEnoughAllowance = await checkIsEnoughAllowance({
      chainId: _chainId,
      symbol: tokenSymbol,
      address: account,
      approveTargetAddress: ADDRESS_MAP[_chainId]?.[ContractType.ETRANSFER],
      amount: _maxInput,
    });
    let _maxInputBignumber;
    if (isEnoughAllowance) {
      _maxInputBignumber = ZERO.plus(balance).minus(aelfFee);
    } else {
      _maxInputBignumber = ZERO.plus(balance).minus(aelfFee).minus(APPROVE_ELF_FEE);
    }
    _maxInput = _maxInputBignumber.lt(0) ? '0' : _maxInputBignumber.toFixed();
  }
  return _maxInput;
}
