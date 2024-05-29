import { ChainId } from '@portkey/provider-types';
import { PortkeyVersion } from 'constants/wallet';
import { TFromTransfer, TToTransfer } from './records';
import type { Moment } from 'moment';
import { IChainNameItem } from 'constants/index';

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
  orderType: string;
  status: string;
  arrivalTime: number;
  fromTransfer: TFromTransfer;
  toTransfer: TToTransfer;
};

export type TGetRecordsListResult = {
  totalCount: number;
  items: TRecordsListItem[];
};
