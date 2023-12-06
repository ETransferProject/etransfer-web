import { handleErrorMessage } from '@portkey/did-ui-react';
import { request } from 'api';
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

export const getTokenList = async (params: GetTokenListRequest): Promise<GetTokenListResult> => {
  try {
    const res = await request.deposit.getTokenList({ params });
    return res.data;
  } catch (error) {
    throw new Error(handleErrorMessage(error, 'getTokenList error'));
  }
};

export const getNetworkList = async (
  params: GetNetworkListRequest,
): Promise<GetNetworkListResult> => {
  try {
    const res = await request.deposit.getNetworkList({ params });
    return res.data;
  } catch (error) {
    throw new Error(handleErrorMessage(error, 'getNetworkList error'));
  }
};

export const getDepositInfo = async (
  params: GetDepositInfoRequest,
): Promise<GetDepositInfoResult> => {
  try {
    const res = await request.deposit.getDepositInfo({ params });
    return res.data;
  } catch (error) {
    throw new Error(handleErrorMessage(error, 'getDepositInfo error'));
  }
};

export const getWithdrawInfo = async (
  params: GetWithdrawInfoRequest,
): Promise<GetWithdrawInfoResult> => {
  try {
    const res = await request.deposit.getWithdrawInfo({ params });
    return res.data;
  } catch (error) {
    throw new Error(handleErrorMessage(error, 'getWithdrawInfo error'));
  }
};

export const createWithdrawOrder = async (
  params: CreateWithdrawOrderRequest,
): Promise<CreateWithdrawOrderResult> => {
  try {
    const res = await request.deposit.createWithdrawOrder({ data: params });
    return res.data;
  } catch (error) {
    throw new Error(handleErrorMessage(error, 'createWithdrawOrder error'));
  }
};
