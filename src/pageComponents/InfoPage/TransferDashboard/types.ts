import { ChainId } from '@portkey/types';
import { InfoBusinessType } from 'constants/infoDashboard';
import { TTransferDashboardFilterNetwork, TTransferDashboardFilterToken } from 'types/api';

export interface TransferDashboardHeaderProps {
  fromTokenList: TTransferDashboardFilterToken[];
  fromChainList: TTransferDashboardFilterNetwork[];
  toTokenList: TTransferDashboardFilterToken[];
  toChainList: ChainId[];
  type: InfoBusinessType;
  fromToken: number;
  fromChain: number;
  toToken: number;
  toChain: number;
}

export interface WebTransferDashboardHeaderProps extends TransferDashboardHeaderProps {
  handleTypeChange: (type: number) => void;
  handleFromTokenChange: (type: number) => void;
  handleFromChainChange: (type: number) => void;
  handleToTokenChange: (type: number) => void;
  handleToChainChange: (type: number) => void;
}

export interface MobileTransferDashboardHeaderProps extends TransferDashboardHeaderProps {
  handleResetFilter: () => void;
  handleApplyFilter: (item: HandleApplyFilterParams) => void;
}

export interface HandleApplyFilterParams {
  type: InfoBusinessType;
  fromToken: number;
  fromChain: number;
  toToken: number;
  toChain: number;
}

export interface TransferDashboardFilterOption {
  value: number;
  label: string;
}

export interface TransferDashboardProps {
  filterFromTokenList: TTransferDashboardFilterToken[];
  filterFromChainList: TTransferDashboardFilterNetwork[];
  filterToTokenList: TTransferDashboardFilterToken[];
  filterToChainList: ChainId[];
  filterType: InfoBusinessType;
  filterFromToken: number;
  filterFromChain: number;
  filterToToken: number;
  filterToChain: number;
}

export interface WebTransferDashboardProps extends TransferDashboardProps {
  handleTypeChange: (type: number) => void;
  handleFromTokenChange: (type: number) => void;
  handleFromChainChange: (type: number) => void;
  handleToTokenChange: (type: number) => void;
  handleToChainChange: (type: number) => void;
}

export interface MobileTransferDashboardProps extends TransferDashboardProps {
  handleResetFilter: () => void;
  handleApplyFilter: (item: HandleApplyFilterParams) => void;
}
