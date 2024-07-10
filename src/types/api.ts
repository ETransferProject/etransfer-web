import { ChainId } from '@portkey/provider-types';
import { PortkeyVersion } from 'constants/wallet';
import { TFromTransfer, TOrderStatus, TToTransfer } from './records';
import type { Moment } from 'moment';
import { IChainNameItem, TokenType } from 'constants/index';
import { TransferStatusType } from 'constants/infoDashboard';

export enum BusinessType {
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
}

export enum AuthTokenSource {
  Portkey = 'portkey',
  NightElf = 'nightElf',
}

export type TGetTokenListRequest = {
  type: BusinessType;
  chainId: ChainId;
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
  chainIdList?: ChainId[];
  chainList?: IChainNameItem[];
};

export type TGetNetworkListRequest = {
  type: BusinessType;
  chainId: ChainId;
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
};

export enum NetworkStatus {
  Health = 'Health',
  Congesting = 'Congesting',
  Offline = 'Offline',
}

export type TGetDepositInfoRequest = {
  chainId: ChainId;
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
  toChainId: ChainId;
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
};

export type TGetWithdrawInfoRequest = {
  chainId: ChainId;
  network?: string;
  symbol?: string;
  amount?: string;
  address?: string;
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
  fromChainId: ChainId;
  toAddress: string;
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
};

export enum TokensDashboardType {
  All,
  Deposit,
  Withdraw,
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
  chainIds: ChainId[];
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
  ToChainId: number;
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
  orderType: BusinessType;
  status: TOrderStatus;
  createTime: number;
  fromTransfer: TTransferDashboardItemFrom;
  toTransfer: TTransferDashboardItemTo;
};

export type TTransferDashboardItemFrom = {
  network: string;
  chainId: ChainId;
  fromAddress: string;
  amount: string;
  amountUsd: string;
  symbol: string;
  txId: string;
  status: TransferStatusType;
};

export type TTransferDashboardItemTo = {
  network: string;
  chainId: ChainId;
  toAddress: string;
  amount: string;
  amountUsd: string;
  symbol: string;
  txId: string;
  status: TransferStatusType;
  feeInfo: TTransferDashboardItemToFee[];
};

export type TTransferDashboardItemToFee = {
  symbol: string;
  amount: string;
};
