import axios from 'axios';
import { BaseConfig, RequestConfig } from './types';
import { stringify } from 'query-string';
import { ETransferAuthHost } from 'constants/index';
import { LocalStorageKey } from 'constants/localStorage';
import service from './axios';
import { PortkeyVersion } from 'constants/wallet';
import myEvents from 'utils/myEvent';
import { AuthTokenSource } from 'types/api';

export function spliceUrl(baseUrl: string, extendArg?: string) {
  return extendArg ? baseUrl + '/' + extendArg : baseUrl;
}

export function getRequestConfig(base: BaseConfig, config?: RequestConfig) {
  if (typeof base === 'string') {
    return config;
  } else {
    const { baseConfig } = base || {};
    const { query, method, params, data } = config || {};
    return {
      ...config,
      ...baseConfig,
      query: (baseConfig.query || '') + (query || ''),
      method: method ? method : baseConfig.method,
      params: Object.assign({}, baseConfig.params, params),
      data: Object.assign({}, baseConfig.data, data),
    };
  }
}

type QueryAuthApiBaseConfig = {
  grant_type: string;
  scope: string;
  client_id: string;
};
export type QueryAuthApiExtraRequest = {
  pubkey: string;
  signature: string;
  plain_text: string;
  version: PortkeyVersion;
  source: AuthTokenSource;
  managerAddress: string;
  ca_hash?: string; // for Portkey
  chain_id?: string; // for Portkey
  recaptchaToken?: string; // for NightElf
};

const queryAuthApiBaseConfig: QueryAuthApiBaseConfig = {
  grant_type: 'signature',
  scope: 'ETransferServer',
  client_id: 'ETransferServer_App',
};

export type JWTData = {
  access_token: string;
  expires_in: number;
  token_type: string;
};
const Day = 1 * 24 * 60 * 60 * 1000;
export type LocalJWTData = {
  expiresTime?: number;
} & JWTData;
export const getLocalJWT = (key: string) => {
  try {
    const localData = localStorage.getItem(LocalStorageKey.ACCESS_TOKEN);
    if (!localData) return;
    const data = JSON.parse(localData) as { [key: string]: LocalJWTData };
    const cData = data[key];
    if (!cData || !cData?.expiresTime) return;
    if (Date.now() - 0.5 * Day > cData?.expiresTime) return;
    return cData;
  } catch (error) {
    return;
  }
};

export const resetLocalJWT = () => {
  return localStorage.removeItem(LocalStorageKey.ACCESS_TOKEN);
};

export const setLocalJWT = (key: string, data: LocalJWTData) => {
  const localData: LocalJWTData = {
    ...data,
    expiresTime: Date.now() + (data.expires_in - 10) * 1000,
  };
  return localStorage.setItem(LocalStorageKey.ACCESS_TOKEN, JSON.stringify({ [key]: localData }));
};

export const queryAuthApi = async (config: QueryAuthApiExtraRequest) => {
  const data = { ...queryAuthApiBaseConfig, ...config };
  const res = await axios.post<JWTData>(`${ETransferAuthHost}/connect/token`, stringify(data), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  const token_type = res.data.token_type;
  const access_token = res.data.access_token;

  service.defaults.headers.common['Authorization'] = `${token_type} ${access_token}`;
  myEvents.AuthTokenSuccess.emit();

  if (localStorage) {
    const key = config?.ca_hash || config.source + config.managerAddress;
    setLocalJWT(key, res.data);
  }

  return `${token_type} ${access_token}`;
};
