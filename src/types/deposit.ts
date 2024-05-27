import { IChainNameItem } from 'constants/index';
import { TNetworkItem } from './api';
import { AllSupportedELFChainId } from 'constants/chain';

export type TContractAddress = {
  address: string;
  addressLink: string;
};

export type TWithdrawInfoSuccess = {
  receiveAmount: string;
  network: TNetworkItem;
  amount: string;
  symbol: string;
  chainItem: IChainNameItem;
  arriveTime: string;
  receiveAmountUsd: string;
  transactionId: string;
};

export type TArrivalTimeConfig = {
  chainList: AllSupportedELFChainId[];
  dividingQuota: string;
};
