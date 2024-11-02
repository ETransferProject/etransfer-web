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
  createRawTransaction(params: any): Promise<ICreateRawTransactionResult>;
}

export interface IGetSignatureResult {
  type: 'success' | 'error';
  signature?: string;
  errorMessage?: string | undefined;
}

export interface ICreateRawTransactionResult {
  type: 'success' | 'error';
  raw?: string;
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
  fromWalletType?: WalletTypeEnum;
  toWallet?: IWallet;
  toWalletType?: WalletTypeEnum;
}

// export interface IEvmAdapter extends IWallet {}

// export interface ISolanaAdapter extends IWallet {}

// export interface ITonAdapter extends IWallet {}

// export interface ITronAdapter extends IWallet {}

// export interface IAelfAdapter extends IWallet {}

interface IAccounts {
  AELF?: string[] | undefined;
  tDVV?: string[] | undefined;
  tDVW?: string[] | undefined;
}
