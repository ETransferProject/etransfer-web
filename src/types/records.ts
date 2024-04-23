import { SupportedELFChainId } from 'constants/index';

export enum RecordsRequestType {
  ALL = 0,
  Deposits = 1,
  Withdraws = 2,
}

export enum RecordsRequestStatus {
  ALL = 0,
  Processing = 1,
  Succeed = 2,
  Failed = 3,
}

export type fromTransfer = {
  network: string;
  chainId: SupportedELFChainId;
  fromAddress: string;
  toAddress: string;
  amount: string;
  symbol: string;
};

export type feeInfo = {
  symbol: string;
  amount: string;
};

export type toTransfer = {
  network: string;
  chainId: SupportedELFChainId;
  fromAddress: string;
  toAddress: string;
  amount: string;
  symbol: string;
  feeInfo: feeInfo[];
};

export type currentRecordsStatus = {
  status: boolean;
};

export type feeInfoType = {
  symbol: string;
  amount: string;
};

export interface recordsTableListType {
  key: string;
  orderType: string;
  status: string;
  arrivalTime: number;
  symbol: string;
  sendingAmount: string;
  receivingAmount: string;
  fromNetwork: string;
  fromAddress: string;
  fromToAddress: string;
  fromChainId: SupportedELFChainId;
  toNetwork: string;
  toFromAddress: string;
  toAddress: string;
  toChainId: SupportedELFChainId;
  feeInfo: feeInfoType[];
}

export enum RecordsStatus {
  Processing = 'Processing',
  Succeed = 'Succeed',
  Failed = 'Failed',
}

export enum RecordsStatusI18n {
  Processing = 'Pending',
  Succeed = 'Completed',
  Failed = 'Failed',
}

export enum AddressType {
  Sender = 'Sender',
  Receiver = 'Receiver',
}
