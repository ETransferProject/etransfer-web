import { AElfNodes } from 'constants/aelf';
import { NetworkType } from '@portkey/provider-types';
import { SupportedELFChainId } from 'constants/index';
import { SideMenuKey } from 'constants/home';

export type TNetworkTypeV1 = 'MAIN' | 'TESTNET';
export type TNetworkTypeV2 = NetworkType;
export type ChainType = 'ELF';

export type EntryConfig = {
  type: SideMenuKey; // 'Deposit' | 'Withdraw'
  chainId: SupportedELFChainId;
  tokenSymbol: string; // only 'USDT'
  depositFromNetwork: string; // eg: "ETH"
  withDrawAddress: string;
  withDrawNetwork: string; // eg: "ETH"
  withDrawAmount: string; // not decimal
};

export type AelfInstancesKey = keyof typeof AElfNodes;
