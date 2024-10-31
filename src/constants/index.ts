export * from './testnet';

export const ChainNamePrefix = {
  MainChain: 'aelf MainChain',
  SideChain: 'aelf dAppChain',
};

export const USDT_DECIMAL = 6;
export const SECONDS_60 = 60000;

export const prefixCls = 'etransfer-web';
export const APP_NAME = 'ETransfer-Web';
export const BRAND_NAME = 'ETransfer';

export const DEFAULT_NULL_VALUE = '--';

export enum TokenType {
  USDT = 'USDT',
  SGR = 'SGR-1',
  ELF = 'ELF',
  ACORNS = 'ACORNS',
}

export const SUPPORT_DEPOSIT_ISOMORPHIC_CHAIN_GUIDE = [TokenType.USDT, TokenType.ELF];

export const TOKEN_INFO_USDT = {
  name: 'Tether USD',
  symbol: TokenType.USDT,
  icon: 'https://d.cobo.com/public/logos/USDT%403x.png',
  contractAddress: '',
  decimals: USDT_DECIMAL,
};

export const ETRANSFER_WEBSITE_URL = 'https://etransfer.exchange';
