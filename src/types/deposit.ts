import { ChainNameItem } from 'constants/index';
import { NetworkItem } from './api';

export type ContractAddress = {
  address: string;
  addressLink: string;
};

export type WithdrawInfoCheck = {
  receiveAmount: string;
  address: string;
  network: NetworkItem;
  amount: string;
  transactionFee: {
    amount: string;
    currency: string;
    name: string;
  };
  symbol: string;
};

export type WithdrawInfoSuccess = {
  receiveAmount: string;
  network: NetworkItem;
  amount: string;
  symbol: string;
  chainItem: ChainNameItem;
  arriveTime: string;
};
