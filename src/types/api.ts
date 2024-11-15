import { TChainId } from '@aelf-web-login/wallet-adapter-base';
import { PortkeyVersion } from 'constants/wallet/index';
import { TFromTransfer, TOrderStatus, TToTransfer } from './records';
import type { Moment } from 'moment';
import { IChainNameItem, TokenType } from 'constants/index';
import { TransferStatusType } from 'constants/infoDashboard';

export enum BusinessType {
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
  Transfer = 'Transfer',
}

export enum AuthTokenSource {
  Portkey = 'portkey',
  NightElf = 'nightElf',
}

export type TGetTokenListRequest = {
  type: BusinessType;
  chainId?: TChainId;
};

export type TGetTokenListResult = {
  tokenList: TTokenItem[];
};

export type TTokenItem = {
  name: string;
  symbol: string;
  icon: string;
  contractAddress: string;
  decimals: number;
};

export type TGetDepositTokenListRequest = {
  type: BusinessType;
};

export type TGetDepositTokenListResult = {
  tokenList: TDepositTokenItem[];
};

export type TDepositTokenItem = TTokenItem & {
  toTokenList?: TToTokenItem[];
};

export type TToTokenItem = TTokenItem & {
  chainIdList?: TChainId[];
  chainList?: IChainNameItem[];
};

export type TGetNetworkListRequest = {
  type: BusinessType;
  chainId?: TChainId;
  symbol?: string;
  address?: string;
};

export type TGetNetworkListResult = {
  networkList: TNetworkItem[];
};

export type TNetworkItem = {
  network: string;
  name: string;
  multiConfirm: string;
  multiConfirmTime: string;
  contractAddress: string;
  explorerUrl: string;
  status: NetworkStatus;
  withdrawFee?: string;
  withdrawFeeUnit?: string;
  specialWithdrawFee?: string;
  specialWithdrawFeeDisplay?: boolean;
};

export enum NetworkStatus {
  Health = 'Health',
  Congesting = 'Congesting',
  Offline = 'Offline',
}

export type TGetDepositInfoRequest = {
  chainId: TChainId;
  network: string;
  symbol?: string;
  toSymbol?: string;
};

export type TGetDepositInfoResult = {
  depositInfo: TDepositInfo;
};

export type TDepositInfo = {
  depositAddress: string;
  minAmount: string;
  extraNotes?: string[];
  minAmountUsd: string;
  extraInfo?: TDepositExtraInfo;
};

export type TDepositExtraInfo = {
  slippage: string;
};

export type TGetDepositCalculateRequest = {
  toChainId: TChainId;
  fromSymbol: string;
  toSymbol: string;
  fromAmount: string;
};

export type TGetDepositCalculateResult = {
  conversionRate: TConversionRate;
};

export type TConversionRate = {
  fromSymbol: string;
  toSymbol: string;
  fromAmount: string;
  toAmount: string;
  minimumReceiveAmount: string;
  extraInfo?: TConversionExtraInfo;
};

export type TConversionExtraInfo = TDepositExtraInfo;

export type TGetWithdrawInfoRequest = {
  chainId: TChainId;
  network?: string;
  symbol?: string;
  amount?: string;
  address?: string;
  memo?: string;
  version?: PortkeyVersion;
};

export type TGetWithdrawInfoResult = {
  withdrawInfo: TWithdrawInfo;
};

export type TWithdrawInfo = {
  maxAmount: string;
  minAmount: string;
  limitCurrency: string;
  totalLimit: string;
  remainingLimit: string;
  /** cobo */
  transactionFee: string;
  /** cobo */
  transactionUnit: string;
  /** cobo */
  expiredTimestamp: number;
  /** aelf */
  aelfTransactionFee: string;
  /** aelf */
  aelfTransactionUnit: string;
  receiveAmount: string;
  feeList: TFeeItem[];
  receiveAmountUsd: string;
  amountUsd: string;
  feeUsd: string;
};

export type TFeeItem = {
  name: string;
  currency: string;
  amount: string;
};

export type TFeeInfoItem = {
  amount: string;
  unit: string;
};

export type TCreateWithdrawOrderRequest = {
  network: string;
  symbol: string;
  amount: string;
  fromChainId: TChainId;
  toAddress: string;
  memo?: string;
  rawTransaction: string;
};

export type TCreateWithdrawOrderResult = {
  orderId: string;
  transactionId: string;
};

export type TRangeValue = [Moment | null, Moment | null] | null;

export interface TGetRecordsListRequest {
  type: number;
  status: number;
  startTimestamp?: number | null;
  endTimestamp?: number | null;
  skipCount: number;
  maxResultCount: number;
  search?: string | undefined;
}

export type TRecordsListItem = {
  id: string;
  orderType: BusinessType;
  status: TOrderStatus;
  arrivalTime: number;
  createTime: number;
  fromTransfer: TFromTransfer;
  toTransfer: TToTransfer;
};

export type TGetRecordsListResult = {
  totalCount: number;
  items: TRecordsListItem[];
};

export type TCheckEOARegistrationRequest = {
  address: string;
};

export type TCheckEOARegistrationResult = {
  result: boolean;
};

export enum WalletSourceType {
  EVM = 'EVM',
  Solana = 'Solana',
  TRX = 'TRX',
  Ton = 'Ton',
}

export type TCheckRegistrationRequest = {
  address: string;
  sourceType: WalletSourceType;
};

export type TCheckRegistrationResult = {
  result: boolean;
};

export type TTokenPricesRequest = {
  symbols: string;
};

export type TTokenPricesResult = {
  items: TTokenPriceItem[];
};

export type TTokenPriceItem = {
  symbol: string;
  priceUsd: number;
};

export type TTransactionOverviewRequest = {
  type: TOverviewTimeType;
  maxResultCount?: number;
};

export enum TOverviewTimeType {
  Day,
  Week,
  Month,
}

export type TTransactionOverviewResult = {
  transaction: TTransactionOverviewData;
};

export type TTransactionOverviewData = {
  totalTx: number;
  latest: string;
  day?: TTransactionOverviewItem[];
  week?: TTransactionOverviewItem[];
  month?: TTransactionOverviewItem[];
};

export type TTransactionOverviewItem = {
  date: string;
  depositTx: number;
  withdrawTx: number;
  transferTx: number;
};

export type TVolumeOverviewRequest = TTransactionOverviewRequest;

export type TVolumeOverviewResult = {
  volume: TVolumeOverviewData;
};

export type TVolumeOverviewData = {
  totalAmountUsd: string;
  latest: string;
  day?: TVolumeOverviewItem[];
  week?: TVolumeOverviewItem[];
  month?: TVolumeOverviewItem[];
};

export type TVolumeOverviewItem = {
  date: string;
  depositAmountUsd: string;
  withdrawAmountUsd: string;
  transferAmountUsd: string;
};

export enum TokensDashboardType {
  All,
  Deposit,
  Withdraw,
  Transfer,
}

export type TTokenDashboardRequest = {
  type: TokensDashboardType;
};

export type TTokenDashboardResult = {
  [token in TokenType]: TTokenDashboardData;
};

export type TTokenDashboardData = {
  icon: string;
  networks: string[];
  chainIds: TChainId[];
  general: TTokenDashboardItemAmount;
  details: TTokenDashboardDataDetail[];
};

export type TTokenDashboardDataDetail = {
  name: string;
  item: TTokenDashboardItemAmount;
};

export type TTokenDashboardItemAmount = {
  amount24H: string;
  amount24HUsd: string;
  amount7D: string;
  amount7DUsd: string;
  amountTotal: string;
  amountTotalUsd: string;
};

export type TTransferDashboardFilterResult = {
  networkList: TTransferDashboardFilterNetwork[];
  tokenList: TTransferDashboardFilterToken[];
};

export type TTransferDashboardFilterNetwork = {
  key: number;
  name: string;
  network: string;
};

export type TTransferDashboardFilterToken = {
  key: number;
  name: string;
  symbol: string;
  icon: string;
};

export type TTransferDashboardRequest = {
  type: TokensDashboardType;
  fromToken: number;
  fromChainId: number;
  toToken: number;
  toChainId: number;
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
  limit?: number;
};

export type TTransferDashboardResult = {
  totalCount: number;
  items: TTransferDashboardItem[];
};

export type TTransferDashboardItem = {
  id: string;
  orderType: BusinessType;
  status: TOrderStatus;
  createTime: number;
  arrivalTime: number;
  fromTransfer: TTransferDashboardItemFrom;
  toTransfer: TTransferDashboardItemTo;
};

export type TTransferDashboardItemFrom = {
  network: string;
  chainId: TChainId;
  fromAddress: string;
  toAddress: string;
  amount: string;
  amountUsd: string;
  symbol: string;
  txId: string;
  status: TransferStatusType;
  icon?: string;
};

export type TTransferDashboardItemTo = {
  network: string;
  chainId: TChainId;
  toAddress: string;
  fromAddress: string;
  amount: string;
  amountUsd: string;
  symbol: string;
  txId: string;
  status: TransferStatusType;
  feeInfo: TTransferDashboardItemToFee[];
  icon?: string;
};

export type TTransferDashboardItemToFee = {
  symbol: string;
  amount: string;
};

export type TGetRecordDetailResult = {
  id: string;
  orderType: BusinessType;
  status: TOrderStatus;
  arrivalTime: number;
  createTime: number;
  fromTransfer: TFromTransfer & { icon: string };
  toTransfer: TToTransfer & { icon: string };
  step: TRecordDetailStep;
};

export type TRecordDetailStep = {
  currentStep: TransactionRecordStep;
  fromTransfer: {
    confirmingThreshold: number; // total
    confirmedNum: number; // already
  };
};

export enum TransactionRecordStep {
  Submitted,
  FromTransfer,
  ToTransfer,
  ReceivedOrSent,
}

export type TGetTransferInfoRequest = {
  fromNetwork: string;
  toNetwork?: string;
  symbol: string;
  amount?: string;
  toAddress?: string;
  memo?: string;
  version?: PortkeyVersion;
};

export type TGetTransferInfoResult = {
  transferInfo: TCrossChainTransferInfo;
};

export type TCrossChainTransferInfo = {
  maxAmount: string;
  minAmount: string;
  limitCurrency: string;
  totalLimit: string;
  remainingLimit: string;
  transactionFee?: string;
  transactionUnit?: string;
  aelfTransactionFee?: string;
  aelfTransactionUnit?: string;
  receiveAmount: string;
  expiredTimestamp: number;
  amountUsd: string;
  receiveAmountUsd: string;
  feeUsd: string;
};

export type TCreateTransferOrderRequest = {
  amount: string;
  fromNetwork: string;
  toNetwork: string;
  fromSymbol: string;
  toSymbol?: string;
  fromAddress: string;
  toAddress: string;
  memo?: string;
  rawTransaction?: string;
};

export type TCreateTransferOrderResult = {
  orderId: string;
  address: string;
  txId: string;
};

export enum UpdateTransferOrderStatus {
  Rejected = 'Rejected',
}

export type TUpdateTransferOrderRequest = {
  amount: string;
  fromNetwork: string;
  toNetwork: string;
  fromSymbol: string;
  toSymbol?: string;
  fromAddress: string;
  toAddress: string;
  address: string; // token pool address
  memo?: string;
  txId: string;
  status: UpdateTransferOrderStatus;
};

export type TUpdateTransferOrderResult = boolean;
