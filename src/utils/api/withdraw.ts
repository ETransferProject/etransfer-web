import { request } from 'api';
import { CancelTokenSourceKey } from 'api/types';
import {
  TCreateWithdrawOrderRequest,
  TCreateWithdrawOrderResult,
  TGetWithdrawInfoRequest,
  TGetWithdrawInfoResult,
} from 'types/api';
import { formatApiError } from './error';

export const getWithdrawInfo = async (
  params: TGetWithdrawInfoRequest,
): Promise<TGetWithdrawInfoResult> => {
  try {
    const res = await request.withdraw.getWithdrawInfo({
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
    const res = await request.withdraw.createWithdrawOrder({ data: params });
    return res.data;
  } catch (error: any) {
    throw formatApiError(error, 'createWithdrawOrder error', false);
  }
};
