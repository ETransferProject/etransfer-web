import { request } from 'api';
import { CancelTokenSourceKey, RequestConfig } from 'api/types';
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
  authToken?: string,
): Promise<TCreateWithdrawOrderResult> => {
  try {
    const _config: RequestConfig = { data: params };
    if (authToken) {
      _config.headers = {
        Authorization: authToken,
      };
    }
    const res = await request.withdraw.createWithdrawOrder(_config);
    return res.data;
  } catch (error: any) {
    throw formatApiError(error, 'createWithdrawOrder error', false);
  }
};
