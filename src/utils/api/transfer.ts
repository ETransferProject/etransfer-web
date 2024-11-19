import { request } from 'api';
import { CancelTokenSourceKey } from 'api/types';
import {
  TCreateTransferOrderRequest,
  TCreateTransferOrderResult,
  TGetNetworkListRequest,
  TGetNetworkListResult,
  TGetTokenListRequest,
  TGetTokenListResult,
  TGetTransferInfoRequest,
  TGetTransferInfoResult,
  TUpdateTransferOrderRequest,
  TUpdateTransferOrderResult,
} from 'types/api';
import { formatApiError } from './error';

export const getTokenList = async (params: TGetTokenListRequest): Promise<TGetTokenListResult> => {
  try {
    const res = await request.transfer.getTokenList({ params });
    return res.data;
  } catch (error) {
    throw formatApiError(error, 'getTokenList error', false);
  }
};

export const getNetworkList = async (
  params: TGetNetworkListRequest,
): Promise<TGetNetworkListResult> => {
  try {
    const res = await request.transfer.getNetworkList({
      params,
      cancelTokenSourceKey: CancelTokenSourceKey.GET_NETWORK_LIST,
    });
    return res.data;
  } catch (error: any) {
    throw formatApiError(error, 'getNetworkList error', true);
  }
};

export const getTransferInfo = async (
  params: TGetTransferInfoRequest,
): Promise<TGetTransferInfoResult> => {
  try {
    const res = await request.transfer.getTransferInfo({
      params,
      cancelTokenSourceKey: CancelTokenSourceKey.GET_TRANSFER_INFO,
    });
    return res.data;
  } catch (error: any) {
    throw formatApiError(error, 'getTransferInfo error', true);
  }
};

export const createTransferOrder = async (
  params: TCreateTransferOrderRequest & { token: string },
): Promise<TCreateTransferOrderResult> => {
  try {
    const res = await request.transfer.createTransferOrder({
      data: params,
      headers: { Authorization: params.token },
    });
    return res.data;
  } catch (error: any) {
    throw formatApiError(error, 'createTransferOrder error', false);
  }
};

export const updateTransferOrder = async (
  params: TUpdateTransferOrderRequest,
): Promise<TUpdateTransferOrderResult> => {
  try {
    const res = await request.transfer.updateTransferOrder({ data: params });
    return res.data;
  } catch (error: any) {
    throw formatApiError(error, 'updateTransferOrder error', false);
  }
};
