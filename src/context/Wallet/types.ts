import { AuthTokenSource } from 'types/api';
import {
  SendEVMTransactionParams,
  SendSolanaTransactionParams,
  SendTONTransactionParams,
  SendTRONTransactionParams,
} from 'types/wallet';

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
  account?: string;
  accounts?: IAccounts;
  connector?: IConnector | string;
  disconnect(): Promise<void>;
  getBalance(params: IGetBalanceRequest): Promise<IGetBalanceResult>;
  getAccountInfo(): Promise<IGetAccountInfoResult>;
  getSignature(params: any): Promise<IGetSignatureResult>;
  signMessage(): Promise<ISignMessageResult>;
  sendTransaction(
    params:
      | SendEVMTransactionParams
      | SendSolanaTransactionParams
      | SendTONTransactionParams
      | SendTRONTransactionParams,
  ): Promise<any>;
}

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

export interface IGetBalanceRequest {
  address: string;
  tokenAddress?: string | undefined;
}

export interface IGetBalanceResult {
  symbol: string;
  value: string | string;
  decimals?: number | string;
}

export interface IGetAccountInfoResult {
  isConnected: boolean;
  address: string;
  addresses: string[];
  chain?: string;
  chainId?: number;
  connector?: IConnector[];
}

export interface IConnector {
  readonly id: string;
  readonly name: string;
  readonly icon?: string | undefined;
  readonly type: string;
  readonly supportsSimulation?: boolean | undefined;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getAccounts(): Promise<IAccounts>;
  getChainId(): Promise<number>;
  getProvider(parameters?: { chainId?: number | undefined } | undefined): Promise<unknown>;
}

export interface IWalletProvider {
  fromWallet?: IWallet;
  toWallet?: IWallet;
}

interface IAccounts {
  AELF?: string[] | undefined;
  tDVV?: string[] | undefined;
  tDVW?: string[] | undefined;
}
