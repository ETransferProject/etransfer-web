import { TokensDashboardType } from 'types/api';

export enum InfoBusinessTypeLabel {
  ALL = 'All',
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
}

export const InfoBusinessTypeOptions = [
  { value: TokensDashboardType.All, label: InfoBusinessTypeLabel.ALL },
  { value: TokensDashboardType.Deposit, label: InfoBusinessTypeLabel.Deposit },
  { value: TokensDashboardType.Withdraw, label: InfoBusinessTypeLabel.Withdraw },
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
  All = 0,
  MainChain = 1,
  SideChain = 2,
}

export enum InfoAelfChainTypeLabel {
  All = 'All Destination Chain',
  MainChain = 'MainChain',
  SideChain = 'SideChain',
}

export const InfoAelfChainOptions = [
  { value: InfoAelfChainType.All, label: InfoAelfChainTypeLabel.All },
  { value: InfoAelfChainType.MainChain, label: InfoAelfChainTypeLabel.MainChain },
  { value: InfoAelfChainType.SideChain, label: InfoAelfChainTypeLabel.SideChain },
];

export const OverviewLegendList = [
  { color: '#916BFF', label: 'Deposit' },
  { color: '#41DAFB', label: 'Withdraw' },
];

export enum TransferStatusType {
  Pending = 'Pending',
  Success = 'Success',
}
