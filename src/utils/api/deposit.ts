import { request } from 'api';
import { CancelTokenSourceKey } from 'api/types';
import {
  CreateWithdrawOrderRequest,
  CreateWithdrawOrderResult,
  GetDepositInfoRequest,
  GetDepositInfoResult,
  GetNetworkListRequest,
  GetNetworkListResult,
  GetTokenListRequest,
  GetTokenListResult,
  GetWithdrawInfoRequest,
  GetWithdrawInfoResult,
} from 'types/api';
import { formatApiError } from './error';

export const getTokenList = async (params: GetTokenListRequest): Promise<GetTokenListResult> => {
  try {
    const res = await request.deposit.getTokenList({ params });
    return res.data;
  } catch (error) {
    throw formatApiError(error, 'getTokenList error', false);
  }
};

export const getNetworkList = async (
  params: GetNetworkListRequest,
): Promise<GetNetworkListResult> => {
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
  params: GetDepositInfoRequest,
): Promise<GetDepositInfoResult> => {
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

export const getWithdrawInfo = async (
  params: GetWithdrawInfoRequest,
): Promise<GetWithdrawInfoResult> => {
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
  params: CreateWithdrawOrderRequest,
): Promise<CreateWithdrawOrderResult> => {
  try {
    const res = await request.deposit.createWithdrawOrder({ data: params });
    return res.data;
  } catch (error: any) {
    throw formatApiError(error, 'createWithdrawOrder error', false);
  }
};
