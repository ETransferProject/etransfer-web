import { TChainId } from '@aelf-web-login/wallet-adapter-base';
import type { Accounts, IPortkeyProvider } from '@portkey/provider-types';
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
  extraInfo: ExtraInfoForDiscoverAndWeb | ExtraInfoForNightElf;
}

export interface ExtraInfoForDiscoverAndWeb {
  accounts: Accounts;
  nickName: string;
  provider: IPortkeyProvider;
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

export interface GetTransactionOnEVM {
  txHash: `0x${string}`;
  network: string;
}
