import { ChainId } from '@portkey/types';
import { BusinessType, TTransferDashboardItemToFee } from './api';
import { TOrderStatus } from './records';
import { TransferStatusType } from 'constants/infoDashboard';

export type TTokenDashboardItem = TTokenDashboardItemVolume & {
  symbol: string;
  symbolIcon: string;
  networks: string[];
  aelfChain: ChainId[];
  details: TTokenDashboardItemDetail[];
};

export type TTokenDashboardItemVolume = {
  volume24H: string;
  volume24HUsd: string;
  volume7D: string;
  volume7DUsd: string;
  volumeTotal: string;
  volumeTotalUsd: string;
};

export type TTokenDashboardItemDetail = TTokenDashboardItemVolume & {
  name: string;
};

export type TTransferDashboardData = {
  orderType: BusinessType;
  status: TOrderStatus;
  createTime: number;
  fromNetwork: string;
  fromChainId: ChainId;
  fromSymbol: string;
  fromAddress: string;
  fromAmount: string;
  fromAmountUsd: string;
  fromTxId: string;
  fromStatus: TransferStatusType;
  toNetwork: string;
  toChainId: ChainId;
  toSymbol: string;
  toAddress: string;
  toAmount: string;
  toAmountUsd: string;
  toTxId: string;
  toStatus: TransferStatusType;
  toFeeInfo: TTransferDashboardItemToFee[];
};
