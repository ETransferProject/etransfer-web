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
