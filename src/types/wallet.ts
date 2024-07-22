import { ChainId } from '@portkey/types';
import type { Accounts, IPortkeyProvider } from '@portkey/provider-types';
import { DIDWalletInfo } from '@portkey/did-ui-react';

export type TAelfAccounts = {
  AELF?: string[] | undefined;
  tDVV?: string[] | undefined;
  tDVW?: string[] | undefined;
};

export type TChainIds = ChainId[];

export interface WalletInfo {
  name?: string | undefined;
  address: string;
  extraInfo: ExtraInfoForDiscover | ExtraInfoForPortkeyAA | ExtraInfoForNightElf;
}

export interface ExtraInfoForDiscover {
  accounts: Accounts;
  nickName: string;
  provider: IPortkeyProvider;
}

export interface ExtraInfoForPortkeyAA {
  publicKey: string;
  portkeyInfo: DIDWalletInfo & {
    accounts: Record<ChainId, string>;
    nickName: string;
  };
}

export interface ExtraInfoForNightElf {
  publicKey: string;
  nightElfInfo: {
    name: string;
    // appPermission;
    // defaultAElfBridge: bridge;
    // aelfBridges: bridges;
    // nodes;
  };
}
