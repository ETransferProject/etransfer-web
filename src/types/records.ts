import { SupportedELFChainId } from 'constants/index';
import { BusinessType } from './api';

export enum TRecordsRequestType {
  ALL = 0,
  Deposits = 1,
  Withdraws = 2,
}

export enum TRecordsRequestStatus {
  ALL = 0,
  Processing = 1,
  Succeed = 2,
  Failed = 3,
}

export type TFromTransfer = {
  network: string;
  chainId: SupportedELFChainId;
  fromAddress: string;
  toAddress: string;
  amount: string;
  amountUsd?: string;
  symbol: string;
  status: string; // TODO
  txId: string;
};

export type TFeeInfo = {
  symbol: string;
  amount: string;
};

export type TToTransfer = {
  network: string;
  chainId: SupportedELFChainId;
  fromAddress: string;
  toAddress: string;
  amount: string;
  amountUsd?: string;
  symbol: string;
  status: string; // TODO
  feeInfo: TFeeInfo[];
  txId: string;
};

export type TCurrentRecordsStatus = {
  status: boolean;
};

export type TFeeInfoType = {
  symbol: string;
  amount: string;
};

export interface TRecordsTableListType {
  key: string;
  orderType: BusinessType;
  status: TOrderStatus;
  arrivalTime: number;
  symbol: string;
  sendingAmount: string;
  receivingAmount: string;
  fromNetwork: string;
  fromAddress: string;
  fromToAddress: string;
  fromChainId: SupportedELFChainId;
  fromTxId: string;
  toSymbol: string;
  toNetwork: string;
  toFromAddress: string;
  toAddress: string;
  toChainId: SupportedELFChainId;
  toTxId: string;
  feeInfo: TFeeInfoType[];
}

export enum TOrderStatus {
  Processing = 'Processing',
  Succeed = 'Succeed',
  Failed = 'Failed',
}

export enum TRecordsStatusI18n {
  Processing = 'Pending',
  Succeed = 'Completed',
  Failed = 'Failed',
}

export enum TAddressType {
  Sender = 'Sender',
  Receiver = 'Receiver',
}

export type TOrderRecordsNoticeRequest = {
  address: string;
  minTimestamp?: number;
};
export type TOrderRecordsNoticeResponse = {
  address: string;
  processing: TRecordsNoticeDetail;
  succeed: TRecordsNoticeDetail;
  failed: TRecordsNoticeDetail;
};

export type TRecordsNoticeDetail = {
  depositCount: number;
  withdrawCount: number;
  deposit: TRecordsNoticeDetailItem;
  withdraw: TRecordsNoticeDetailItem;
};

export type TRecordsNoticeDetailItem = {
  id: string;
  amount: string;
  symbol: string;
};
