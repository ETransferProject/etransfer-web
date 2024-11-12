import { request } from 'api';
import { CancelTokenSourceKey } from 'api/types';
import {
  TGetDepositCalculateRequest,
  TGetDepositCalculateResult,
  TGetDepositInfoRequest,
  TGetDepositInfoResult,
  TGetDepositTokenListRequest,
  TGetDepositTokenListResult,
} from 'types/api';
import { formatApiError } from './error';

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
