export enum CreateWithdrawOrderErrorCode {
  TRANSACTION_FEES_FLUCTUATED = '40001',
}

export const FAIL_MODAL_REASON_ERROR_CODE_LIST = [
  CreateWithdrawOrderErrorCode.TRANSACTION_FEES_FLUCTUATED,
];

export enum ErrorNameType {
  FAIL_MODAL_REASON = 'failModalReason',
}
