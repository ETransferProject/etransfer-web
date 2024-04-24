import { CHAIN_LIST, defaultNullValue } from 'constants/index';
import { NetworkStatus, WithdrawInfo } from 'types/api';
import { WithdrawInfoSuccess } from 'types/deposit';

export const WithdrawAddressErrorCodeList = ['40100', '40101'];

export const WithdrawSendTxErrorCodeList = [
  '40001',
  '40002',
  '40003',
  '40004',
  '40005',
  '40006',
  '40007',
  '40008',
  '40009',
  '40010',
  '40011',
  '40012',
  '40013',
  '40014',
  '40015',
];
export enum ErrorNameType {
  FAIL_MODAL_REASON = 'failModalReason',
}

export const DefaultWithdrawErrorMessage =
  'Failed to initiate the transaction. Please try again later.';

export const AmountGreaterThanBalanceMessage =
  'The amount exceeds the remaining withdrawal quota. Please consider transferring a smaller amount.';

export const InsufficientAllowanceMessage =
  'Insufficient allowance. Please try again, ensuring that you approve an adequate amount as the allowance.';

export const RemainingWithdrawalQuotaTooltip = `Withdrawals are subject to a 24-hour limit, determined by the real-time USD value of the asset. You can withdraw assets up to the available withdrawal limit.`;

export const InitialWithdrawInfo: WithdrawInfo = {
  maxAmount: '',
  minAmount: '',
  limitCurrency: 'USDT',
  totalLimit: '',
  remainingLimit: '',
  transactionFee: '',
  transactionUnit: 'USDT',
  expiredTimestamp: 0,
  aelfTransactionFee: '',
  aelfTransactionUnit: 'ELF',
  receiveAmount: '',
  feeList: [],
  receiveAmountUsd: defaultNullValue,
  amountUsd: defaultNullValue,
  feeUsd: defaultNullValue,
};

export const InitialNetwork = {
  network: '',
  name: '',
  multiConfirm: '',
  multiConfirmTime: '',
  contractAddress: '',
  explorerUrl: '',
  status: NetworkStatus.Health,
};

export const InitialWithdrawSuccessCheck: WithdrawInfoSuccess = {
  symbol: '',
  amount: '',
  receiveAmount: '',
  chainItem: CHAIN_LIST[0],
  network: InitialNetwork,
  arriveTime: '',
  receiveAmountUsd: defaultNullValue,
  transactionId: '',
};
