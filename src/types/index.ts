import { AElfNodes } from 'constants/aelf';
import { NetworkType } from '@portkey/provider-types';
import { CHAIN_NAME } from 'constants/index';
import { SideMenuKey } from 'constants/home';

export type TNetworkTypeV1 = 'MAIN' | 'TESTNET';
export type TNetworkTypeV2 = NetworkType;

export type ChainId = keyof typeof CHAIN_NAME;

export type ChainType = 'ELF';

export type EntryConfig = {
  type: SideMenuKey; // 'Deposit' | 'Withdraw'
  chainId: ChainId;
  tokenSymbol: string; // only 'USDT'
  depositFromNetwork: string; // eg: "ETH"
  withDrawAddress: string;
  withDrawNetwork: string; // eg: "ETH"
  withDrawAmount: string; // not decimal
};

export type AelfInstancesKey = keyof typeof AElfNodes;
