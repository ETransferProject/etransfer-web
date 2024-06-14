import { AxiosRequestConfig, AxiosResponse } from 'axios';

export enum CommonErrorNameType {
  CANCEL = 'cancel',
}

export enum CancelTokenSourceKey {
  GET_DEPOSIT_INFO = 'getDepositInfo',
  GET_WITHDRAW_INFO = 'getWithdrawInfo',
  GET_NETWORK_LIST = 'getNetworkList',
}

export type RequestConfig = {
  query?: string; //this for url parameter; example: test/:id
  cancelTokenSourceKey?: CancelTokenSourceKey;
} & AxiosRequestConfig;

export type IBaseRequest = {
  url: string;
} & RequestConfig;

export type BaseConfig = string | { target: string; baseConfig: RequestConfig };

export type UrlObj = { [key: string]: BaseConfig };

export type API_REQ_FUNCTION = (config?: RequestConfig) => Promise<any | AxiosResponse<any>>;
