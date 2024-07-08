import { CHAIN_NAME_ENUM } from 'constants/index';
import { BusinessType } from 'types/api';

export enum InfoBusinessType {
  ALL = 0,
  Deposit = 1,
  Withdraw = 2,
}

export enum InfoBusinessTypeLabel {
  ALL = 'ALL',
  Deposit = BusinessType.Deposit,
  Withdraw = BusinessType.Withdraw,
}

export const InfoBusinessTypeOptions = [
  { value: InfoBusinessType.ALL, label: InfoBusinessTypeLabel.ALL },
  { value: InfoBusinessType.Deposit, label: InfoBusinessTypeLabel.Deposit },
  { value: InfoBusinessType.Withdraw, label: InfoBusinessTypeLabel.Withdraw },
];

export const DefaultTransferDashboardFromTokenOptions = {
  value: 0,
  label: 'All Source Token',
};

export const DefaultTransferDashboardFromChainOptions = {
  value: 0,
  label: 'All Source Chain',
};

export const DefaultTransferDashboardToTokenOptions = {
  value: 0,
  label: 'All Destination Token',
};

export enum InfoAelfChainType {
  ALL = 0,
  MainChain = 1,
  SideChain = 2,
}

export enum InfoAelfChainTypeLabel {
  ALL = 'All Destination Chain',
  MainChain = CHAIN_NAME_ENUM['MainChain'],
  SideChain = CHAIN_NAME_ENUM['SideChain'],
}

export const InfoAelfChainOptions = [
  { value: InfoAelfChainType.ALL, label: InfoAelfChainTypeLabel.ALL },
  { value: InfoAelfChainType.MainChain, label: InfoAelfChainTypeLabel.MainChain },
  { value: InfoAelfChainType.SideChain, label: InfoAelfChainTypeLabel.SideChain },
];

export const OverviewLegendList = [
  { color: '#916BFF', label: BusinessType.Deposit },
  { color: '#41DAFB', label: BusinessType.Withdraw },
];
