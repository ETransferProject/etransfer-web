import { CommentCheckTip } from 'constants/withdraw';

export enum WithdrawValidateStatus {
  Error = 'error',
  Warning = 'warning',
  Normal = '',
}

export enum WithdrawFormKeys {
  ADDRESS = 'address',
  AMOUNT = 'amount',
  COMMENT = 'comment',
}

export type TWithdrawFormValues = {
  [WithdrawFormKeys.ADDRESS]: string;
  [WithdrawFormKeys.AMOUNT]: string;
  [WithdrawFormKeys.COMMENT]: string;
};

export type TWithdrawFormValidateData = {
  [key in WithdrawFormKeys]: { validateStatus: WithdrawValidateStatus; errorMessage: string };
};

export const WITHDRAW_FORM_VALIDATE_DATA = {
  [WithdrawFormKeys.ADDRESS]: { validateStatus: WithdrawValidateStatus.Normal, errorMessage: '' },
  [WithdrawFormKeys.AMOUNT]: { validateStatus: WithdrawValidateStatus.Normal, errorMessage: '' },
  [WithdrawFormKeys.COMMENT]: {
    validateStatus: WithdrawValidateStatus.Warning,
    errorMessage: CommentCheckTip,
  },
};
