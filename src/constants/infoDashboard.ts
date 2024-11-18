import { TokensDashboardType } from 'types/api';

export enum InfoBusinessTypeLabel {
  ALL = 'All',
  Deposit = 'Deposit',
  Withdraw = 'Withdrawal',
  Transfer = 'Transfer',
}

export const InfoBusinessTypeOptions = [
  { value: TokensDashboardType.All, label: InfoBusinessTypeLabel.ALL },
  { value: TokensDashboardType.Deposit, label: InfoBusinessTypeLabel.Deposit },
  { value: TokensDashboardType.Transfer, label: InfoBusinessTypeLabel.Transfer },
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
  { color: '#916BFF', label: 'Deposit' },
  { color: '#41DAFB', label: 'Transfer' },
];

export enum TransferStatusType {
  Pending = 'Pending',
  Success = 'Success',
  Failed = 'Failed',
}
