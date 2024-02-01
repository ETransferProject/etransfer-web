export * from './testnet';

export enum WalletType {
  unknown = 'unknown',
  discover = 'discover',
  portkey = 'portkey',
}

export enum NetworkTypeV1 {
  MAIN = 'MAIN',
  TESTNET = 'TESTNET',
}
export enum NetworkTypeV2 {
  MAINNET = 'MAINNET',
  TESTNET = 'TESTNET',
}

export enum NetworkTypeTextV1 {
  MAIN = 'Mainnet',
  TESTNET = 'Testnet',
}

export enum NetworkTypeTextV2 {
  MAINNET = 'Mainnet',
  TESTNET = 'Testnet',
}

export const ChainNamePrefix = {
  MainChain: 'MainChain',
  SideChain: 'SideChain',
};

export const USDT_DECIMAL = 6;
export const SECONDS_60 = 60000;

export const prefixCls = 'etransfer-web';
export const AppName = 'ETransfer Web';
export const BrandName = 'ETransfer';

export enum PortkeyVersion {
  v1 = 'v1',
  v2 = 'v2',
}

export enum PortkeyNameVersion {
  v1 = 'portkey',
  v2 = 'Portkey',
}
