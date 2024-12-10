import { ZERO } from '@etransfer/utils';
import { ContractType } from 'constants/chain';
import { ADDRESS_MAP, NETWORK_TOKEN_RELATIONS, SupportedELFChainId } from 'constants/index';
import { APPROVE_ELF_FEE } from 'constants/withdraw';
import { TNetworkItem, TTokenItem } from 'types/api';
import { checkIsEnoughAllowance } from 'utils/contract';

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
