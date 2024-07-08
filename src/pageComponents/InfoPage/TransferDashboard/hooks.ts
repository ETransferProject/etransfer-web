import { ChainId } from '@portkey/types';
import {
  DefaultTransferDashboardFromTokenOptions,
  DefaultTransferDashboardFromChainOptions,
  DefaultTransferDashboardToTokenOptions,
} from 'constants/infoDashboard';
import { useMemo } from 'react';
import { TTransferDashboardFilterToken, TTransferDashboardFilterNetwork } from 'types/api';

export interface UseFilterParams {
  fromTokenList: TTransferDashboardFilterToken[];
  fromChainList: TTransferDashboardFilterNetwork[];
  toTokenList: TTransferDashboardFilterToken[];
  toChainList: ChainId[];
}

export function useFilter({
  fromTokenList,
  fromChainList,
  toTokenList,
  toChainList,
}: UseFilterParams) {
  const fromTokenOptions = useMemo(() => {
    const list: { value: number | string; label: string }[] = [
      DefaultTransferDashboardFromTokenOptions,
    ];
    fromTokenList.forEach((item) => {
      list.push({ value: item.key, label: item.symbol });
    });
    return list;
  }, [fromTokenList]);

  const fromChainOptions = useMemo(() => {
    const list: { value: number | string; label: string }[] = [
      DefaultTransferDashboardFromChainOptions,
    ];
    fromChainList.forEach((item) => {
      list.push({ value: item.key, label: item.network });
    });
    return list;
  }, [fromChainList]);

  const toTokenOptions = useMemo(() => {
    const list: { value: number | string; label: string }[] = [
      DefaultTransferDashboardToTokenOptions,
    ];
    toTokenList.forEach((item) => {
      list.push({ value: item.key, label: item.symbol });
    });
    return list;
  }, [toTokenList]);

  // TODO
  const toChainOptions = useMemo(() => {
    const list: { value: number | string; label: string }[] = [];
    toChainList.forEach((item) => {
      list.push({ value: item, label: item });
    });
    return list;
  }, [toChainList]);

  return {
    fromTokenOptions,
    fromChainOptions,
    toTokenOptions,
    toChainOptions,
  };
}
