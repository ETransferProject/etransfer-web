import { WalletTypeEnum as AelfWalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { Adapter as SolanaAdapter } from '@solana/wallet-adapter-base';
import type { Adapter as TRONAdapter } from '@tronweb3/tronwallet-abstract-adapter';
import { ITonConnect } from '@tonconnect/sdk';
import { AuthTokenSource } from 'types/api';
import {
  SendEVMTransactionParams,
  SendSolanaTransactionParams,
  SendTONTransactionParams,
  SendTRONTransactionParams,
  TAelfAccounts,
} from 'types/wallet';
import { Connector } from 'wagmi';
import { SupportedELFChainId } from 'constants/index';
import { TGetSignature } from 'utils/contract';

export enum WalletTypeEnum {
  EVM = 'EVM',
  SOL = 'Solana',
  TON = 'TON',
  TRON = 'TRON',
  AELF = 'Aelf',
}

export interface IWallet {
  isConnected: boolean;
  walletType?: WalletTypeEnum;
  chainId?: any;
  provider?: any;
  account?: string | `0x${string}` | null;
  accounts?:
    | TAelfAccounts
    | string[]
    | readonly [`0x${string}`, ...`0x${string}`[]]
    | readonly `0x${string}`[];
  connector?: TConnector;
  disconnect(): Promise<any>;
  getBalance(
    params: IGetBalanceRequest | IGetEVMBalanceRequest | IGetAelfBalanceRequest,
  ): Promise<IGetBalanceResult>;
  getAccountInfo?(params: any): any;
  getSignature?(params: any): Promise<IGetSignatureResult>;
  signMessage: any; // TSignMessage;
  sendTransaction?(
    params:
      | SendEVMTransactionParams
      | SendSolanaTransactionParams
      | SendTONTransactionParams
      | SendTRONTransactionParams,
  ): Promise<any>;
}

export type TSignMessageMethod = () => Promise<ISignMessageResult>;

export type TSignMessage = TSignMessageMethod | TGetSignature;

export interface ISignMessageResult {
  plainTextOrigin: string;
  plainTextHex: string;
  signature: any;
  publicKey: string;
  sourceType: AuthTokenSource;
}

export interface IGetSignatureResult {
  type: 'success' | 'error';
  signature?: string;
  errorMessage?: string | undefined;
}

export interface IGetEVMBalanceRequest {
  tokenContractAddress?: string;
  network: string;
  tokenSymbol?: string;
}

export interface IGetAelfBalanceRequest {
  address: string;
  tokenSymbol: string;
  chainId: SupportedELFChainId;
}

export interface IGetBalanceRequest {
  tokenContractAddress: string;
}

export interface IGetBalanceResult {
  value: string | string;
  decimals?: number | string;
}

export type TConnector =
  | Connector
  | SolanaAdapter
  | ITonConnect
  | TRONAdapter<string>
  | AelfWalletTypeEnum
  | string;

export interface IWalletProvider {
  fromWallet?: IWallet;
  toWallet?: IWallet;
}
