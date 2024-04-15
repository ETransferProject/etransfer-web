import { ChainId } from '@portkey/provider-types';
import { PortkeyVersion } from 'constants/wallet';
import { fromTransfer, toTransfer } from './records';
import type { Moment } from 'moment';

export enum BusinessType {
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
}

export type GetTokenListRequest = {
  type: BusinessType;
  chainId: ChainId;
};

export type GetTokenListResult = {
  tokenList: TokenItem[];
};

export type TokenItem = {
  name: string;
  symbol: string;
  icon: string;
  contractAddress: string;
  decimals: number;
};

export type GetNetworkListRequest = {
  type: BusinessType;
  chainId: ChainId;
  symbol?: string;
  address?: string;
};

export type GetNetworkListResult = {
  networkList: NetworkItem[];
};

export type NetworkItem = {
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

export type GetDepositInfoRequest = {
  chainId: ChainId;
  network: string;
  symbol?: string;
};

export type GetDepositInfoResult = {
  depositInfo: DepositInfo;
};

export type DepositInfo = {
  depositAddress: string;
  minAmount: string;
  extraNotes?: string[];
  minAmountUsd: string;
};

export type GetWithdrawInfoRequest = {
  chainId: ChainId;
  network?: string;
  symbol?: string;
  amount?: string;
  address?: string;
  version?: PortkeyVersion;
};

export type GetWithdrawInfoResult = {
  withdrawInfo: WithdrawInfo;
};

export type WithdrawInfo = {
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
  feeList: FeeItem[];
  receiveAmountUsd: string;
  amountUsd: string;
  feeUsd: string;
};

export type FeeItem = {
  name: string;
  currency: string;
  amount: string;
};

export type FeeInfoItem = {
  amount: string;
  unit: string;
};

export type CreateWithdrawOrderRequest = {
  network: string;
  symbol: string;
  amount: string;
  fromChainId: ChainId;
  toAddress: string;
  rawTransaction: string;
};

export type CreateWithdrawOrderResult = {
  orderId: string;
};

export type RangeValue = [Moment | null, Moment | null] | null;

export interface GetRecordsListRequest {
  type: number;
  status: number;
  startTimestamp?: number | null;
  endTimestamp?: number | null;
  skipCount: number;
  maxResultCount: number;
  search?: string | undefined;
}

export type RecordsListItem = {
  id: string;
  orderType: string;
  status: string;
  arrivalTime: number;
  fromTransfer: fromTransfer;
  toTransfer: toTransfer;
};

export type GetRecordsListResult = {
  totalCount: number;
  items: RecordsListItem[];
};

export type RecordsContentParams = {
  requestRecordsList: () => void;
};
