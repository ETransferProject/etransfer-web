import axios from 'axios';
import { BaseConfig, RequestConfig } from './types';
import { stringify } from 'query-string';
import { ETransferAuthHost, SupportedELFChainId } from 'constants/index';
import { LocalStorageKey } from 'constants/localStorage';
import getPortkeyWallet from 'wallet/portkeyWallet';
import AElf from 'aelf-sdk';
import service from './axios';
import { PortkeyVersion } from 'constants/wallet';

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
type QueryAuthApiExtraRequest = {
  pubkey: string;
  signature: string;
  plain_text: string;
  ca_hash: string;
  chain_id: string;
  managerAddress: string;
  version: PortkeyVersion;
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

export const resetJWT = () => {
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

  if (localStorage) {
    setLocalJWT(config.ca_hash + config.managerAddress, res.data);
  }

  return `${token_type} ${access_token}`;
};

// const plainText = `Welcome to ETransfer!

// Click to sign in. This request will not trigger a blockchain transaction or cost any transaction fees.

// Nonce:
// ${Date.now()}`;

export const queryAuthToken = async ({
  chainId,
  version,
}: {
  chainId: SupportedELFChainId;
  version: PortkeyVersion;
}) => {
  const portkeyWallet = getPortkeyWallet(version);
  const managerAddress = await portkeyWallet.getManagerAddress();
  const caHash = await portkeyWallet.getCaHash();

  const key = caHash + managerAddress;
  const localData = getLocalJWT(key);

  if (localData) {
    service.defaults.headers.common[
      'Authorization'
    ] = `${localData.token_type} ${localData.access_token}`;
    return `${localData.token_type} ${localData.access_token}`;
  }

  const plainText = `Nonce:${Date.now()}`;
  const plainTextHex = Buffer.from(plainText).toString('hex');

  const { pubKey, signatureStr } = await portkeyWallet.getManagerPublicKey(
    AElf.utils.sha256(plainTextHex),
  );
  if (!pubKey || !signatureStr) return; // TODO
  if (!caHash) return; // TODO

  return queryAuthApi({
    pubkey: pubKey,
    signature: signatureStr,
    plain_text: plainTextHex,
    ca_hash: caHash,
    chain_id: chainId,
    managerAddress,
    version: version,
  });
};
