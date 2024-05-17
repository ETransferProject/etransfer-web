import { request } from 'api';
import { CancelTokenSourceKey } from 'api/types';
import {
  TCreateWithdrawOrderRequest,
  TCreateWithdrawOrderResult,
  TGetDepositCalculateRequest,
  TGetDepositCalculateResult,
  TGetDepositInfoRequest,
  TGetDepositInfoResult,
  TGetDepositTokenListRequest,
  TGetDepositTokenListResult,
  TGetNetworkListRequest,
  TGetNetworkListResult,
  TGetTokenListRequest,
  TGetTokenListResult,
  TGetWithdrawInfoRequest,
  TGetWithdrawInfoResult,
} from 'types/api';
import { formatApiError } from './error';

export const getTokenList = async (params: TGetTokenListRequest): Promise<TGetTokenListResult> => {
  try {
    const res = await request.deposit.getTokenList({ params });
    return res.data;
  } catch (error) {
    throw formatApiError(error, 'getTokenList error', false);
  }
};

export const getNetworkList = async (
  params: TGetNetworkListRequest,
): Promise<TGetNetworkListResult> => {
  try {
    const res = await request.deposit.getNetworkList({
      params,
      cancelTokenSourceKey: CancelTokenSourceKey.GET_NETWORK_LIST,
    });
    return res.data;
  } catch (error: any) {
    throw formatApiError(error, 'getNetworkList error', true);
  }
};

export const getDepositInfo = async (
  params: TGetDepositInfoRequest,
): Promise<TGetDepositInfoResult> => {
  try {
    const res = await request.deposit.getDepositInfo({
      params,
      cancelTokenSourceKey: CancelTokenSourceKey.GET_DEPOSIT_INFO,
    });
    return res.data;
  } catch (error: any) {
    throw formatApiError(error, 'getDepositInfo error', true);
  }
};

export const getDepositTokenList = async (
  params: TGetDepositTokenListRequest,
): Promise<TGetDepositTokenListResult> => {
  try {
    const res = await request.deposit.getDepositTokenList({
      params,
    });
    return res.data;
  } catch (error: any) {
    throw formatApiError(error, 'getDepositCalculate error', false);
  }
};

export const getDepositCalculate = async (
  params: TGetDepositCalculateRequest,
): Promise<TGetDepositCalculateResult> => {
  try {
    const res = await request.deposit.depositCalculator({
      params,
    });
    return res.data;
  } catch (error: any) {
    throw formatApiError(error, 'getDepositCalculate error', false);
  }
};

export const getWithdrawInfo = async (
  params: TGetWithdrawInfoRequest,
): Promise<TGetWithdrawInfoResult> => {
  try {
    const res = await request.deposit.getWithdrawInfo({
      params,
      cancelTokenSourceKey: CancelTokenSourceKey.GET_WITHDRAW_INFO,
    });
    return res.data;
  } catch (error: any) {
    throw formatApiError(error, 'getWithdrawInfo error', true);
  }
};

export const createWithdrawOrder = async (
  params: TCreateWithdrawOrderRequest,
): Promise<TCreateWithdrawOrderResult> => {
  try {
    const res = await request.deposit.createWithdrawOrder({ data: params });
    return res.data;
  } catch (error: any) {
    throw formatApiError(error, 'createWithdrawOrder error', false);
  }
};
