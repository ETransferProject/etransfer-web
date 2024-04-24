import type { HttpProvider } from 'web3-core';
import type { AElfDappBridge } from '@aelf-react/types';
import type { AElfContextType } from '@aelf-react/core/dist/types';
import { AElfNodes } from 'constants/aelf';
import { Accounts, NetworkType } from '@portkey/provider-types';
import { CHAIN_NAME } from 'constants/index';
import { SideMenuKey } from 'constants/home';

export type TNetworkTypeV1 = 'MAIN' | 'TESTNET';
export type TNetworkTypeV2 = NetworkType;

export type ChainId = keyof typeof CHAIN_NAME;

export type ChainType = 'ELF';

export type WalletType = 'PORTKEY';

export type AelfInstancesKey = keyof typeof AElfNodes;

export type Web3Type = {
  chainId?: ChainId;
  library?: HttpProvider | any;
  aelfInstance?: AElfDappBridge;
  provider?: any;
  isActive?: boolean;
  account?: string;
  connector?: string;
  deactivate?: AElfContextType['deactivate'];
  aelfInstances?: { [key in AelfInstancesKey]: AElfDappBridge };
  isPortkey?: boolean;
  walletType?: WalletType;
  accounts?: Accounts;
};

export type EntryConfig = {
  type: SideMenuKey; // 'Deposit' | 'Withdraw'
  chainId: ChainId;
  tokenSymbol: string; // only 'USDT'
  depositFromNetwork: string; // eg: "ETH"
  withDrawAddress: string;
  withDrawNetwork: string; // eg: "ETH"
  withDrawAmount: string; // not decimal
};

export enum TTokenType {
  USDT = 'USDT',
  SGR = 'SGR-1',
}
