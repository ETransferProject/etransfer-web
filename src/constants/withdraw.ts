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
  'The transaction failed due to an unexpected error. Please try again later.';
