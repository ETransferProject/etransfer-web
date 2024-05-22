export * from './testnet';

export enum NetworkTypeV1 {
  MAIN = 'MAIN',
  TESTNET = 'TESTNET',
}
export enum NetworkTypeV2 {
  MAINNET = 'MAINNET',
  TESTNET = 'TESTNET',
}

export enum NetworkTypeText {
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
export const AppName = 'ETransfer-Web';
export const BrandName = 'ETransfer';

export const defaultNullValue = '--';

export enum TokenType {
  USDT = 'USDT',
  SGR = 'SGR-1',
  ELF = 'ELF',
}

export const TOKEN_INFO_USDT = {
  name: 'Tether USD',
  symbol: TokenType.USDT,
  icon: '',
  contractAddress: '',
  decimals: USDT_DECIMAL,
};
