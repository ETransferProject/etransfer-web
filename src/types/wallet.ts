import { TChainId } from '@aelf-web-login/wallet-adapter-base';
import type { Accounts, IPortkeyProvider } from '@portkey/provider-types';
import { PortkeyDid } from '@aelf-web-login/wallet-adapter-bridge';
import { Abi } from 'viem';

export type TAelfAccounts = {
  AELF?: string;
  tDVV?: string;
  tDVW?: string;
};

export type TChainIds = TChainId[];
export type TChainType = 'ethereum' | 'aelf';

export interface WalletInfo {
  name?: string;
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
  portkeyInfo: PortkeyDid.DIDWalletInfo & {
    accounts: TAelfAccounts;
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

export interface SendEVMTransactionParams {
  network: string;
  tokenContractAddress: `0x${string}`;
  toAddress: string;
  tokenAbi?: Abi | unknown[];
  amount: string;
  decimals: number;
}

export interface SendSolanaTransactionParams {
  tokenContractAddress: string;
  toAddress: string;
  amount: string;
  decimals: number;
}

export interface SendTONTransactionParams {
  tokenContractAddress: string;
  toAddress: string;
  amount: number;
  decimals: number | string;
  orderId: string;
  forwardTonAmount?: string;
}

export interface SendTRONTransactionParams {
  tokenContractAddress: string;
  toAddress: string;
  amount: number; // unit is SUN，1 TRX = 1,000,000 SUN
}

export interface CreateTokenOnEVMParams {
  network: string;
  contractAddress: `0x${string}`;
  contractAbi?: Abi | unknown[];
  name: string;
  symbol: string;
  initialSupply: number;
}
