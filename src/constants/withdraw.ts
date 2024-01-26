export enum CreateWithdrawOrderErrorCode {
  TRANSACTION_FEES_FLUCTUATED = '40001',
  FEE_EXPIRED = '40002',
}

export const FAIL_MODAL_REASON_ERROR_CODE_LIST = [
  CreateWithdrawOrderErrorCode.TRANSACTION_FEES_FLUCTUATED,
  CreateWithdrawOrderErrorCode.FEE_EXPIRED,
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
