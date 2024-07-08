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

export const DefaultTransferDashboardToChainOptions = {
  value: 0,
  label: 'All Destination Chain',
};

export const OverviewLegendList = [
  { color: '#916BFF', label: BusinessType.Deposit },
  { color: '#41DAFB', label: BusinessType.Withdraw },
];
