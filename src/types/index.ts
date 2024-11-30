import { AElfNodes } from 'constants/aelf';
import { SupportedELFChainId } from 'constants/index';
import { SideMenuKey } from 'constants/home';
import { BusinessType } from './api';
import { TRecordsStatusI18n } from './records';

export type TEntryConfig = {
  type?: SideMenuKey;
  chainId?: SupportedELFChainId;
  tokenSymbol?: string; // 'USDT'|'SGR'|'ELF' , default = 'USDT'
  depositFromNetwork?: string; // eg: "ETH"
  depositToToken?: string; // 'USDT'|'SGR'|'ELF' , default = 'USDT'
  calculatePay?: string;
  withdrawAddress?: string;
  // withdrawNetwork?: string;
  // withdrawAmount?: string; // not decimal
};

export type TDepositEntryConfig = {
  chainId?: SupportedELFChainId;
  tokenSymbol?: string; // 'USDT'|'SGR'|'ELF' , default = 'USDT'
  depositFromNetwork?: string; // eg: "ETH"
  depositToToken?: string; // 'USDT'|'SGR'|'ELF' , default = 'USDT'
  calculatePay?: string;
};

export type TWithdrawEntryConfig = {
  chainId?: SupportedELFChainId;
  tokenSymbol?: string; // 'USDT'|'SGR'|'ELF' , default = 'USDT'
  withdrawAddress?: string;
  // withdrawNetwork?: string;
  // withdrawAmount?: string; // not decimal
};

export type TCrossChainTransferEntryConfig = {
  fromNetwork?: string; // eg: "AELF"
  toNetwork?: string; // eg: "tDVW"
  tokenSymbol?: string; // 'USDT'|'SGR'|'ELF' , default = 'USDT'
};

export type THistoryEntryConfig = {
  method?: BusinessType;
  status?: TRecordsStatusI18n;
  start?: number;
  end?: number;
};

export type AelfInstancesKey = keyof typeof AElfNodes;
