import { IChainNameItem } from 'constants/index';
import { NetworkItem } from './api';

export type ContractAddress = {
  address: string;
  addressLink: string;
};

export type WithdrawInfoSuccess = {
  receiveAmount: string;
  network: NetworkItem;
  amount: string;
  symbol: string;
  chainItem: IChainNameItem;
  arriveTime: string;
};
