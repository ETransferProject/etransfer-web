import { AxiosRequestConfig, AxiosResponse } from 'axios';

export enum CancelTokenSourceKey {
  GET_WITHDRAW_INFO = 'getWithdrawInfo',
}

export type RequestConfig = {
  query?: string; //this for url parameter； example: test/:id
  cancelTokenSourceKey?: CancelTokenSourceKey;
} & AxiosRequestConfig;

export type IBaseRequest = {
  url: string;
} & RequestConfig;

export type BaseConfig = string | { target: string; baseConfig: RequestConfig };

export type UrlObj = { [key: string]: BaseConfig };

export type API_REQ_FUNCTION = (config?: RequestConfig) => Promise<any | AxiosResponse<any>>;
