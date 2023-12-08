export enum WalletType {
  unknown = 'unknown',
  discover = 'discover',
  portkey = 'portkey',
}

export enum NetworkType {
  MAIN = 'MAIN',
  TESTNET = 'TESTNET',
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

export * from './testnet';
