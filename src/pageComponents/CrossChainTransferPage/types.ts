import { CommentCheckTip } from 'constants/withdraw';

export enum TransferValidateStatus {
  Error = 'error',
  Warning = 'warning',
  Normal = '',
}

export enum TransferFormKeys {
  AMOUNT = 'amount',
  RECIPIENT = 'recipient',
  COMMENT = 'comment',
}

export type TTransferFormValues = {
  [TransferFormKeys.AMOUNT]: string;
  [TransferFormKeys.RECIPIENT]: string;
  [TransferFormKeys.COMMENT]: string;
};

export type TTransferFormValidateData = {
  [key in TransferFormKeys]: { validateStatus: TransferValidateStatus; errorMessage: string };
};

export const TRANSFER_FORM_VALIDATE_DATA = {
  [TransferFormKeys.AMOUNT]: { validateStatus: TransferValidateStatus.Normal, errorMessage: '' },
  [TransferFormKeys.RECIPIENT]: {
    validateStatus: TransferValidateStatus.Warning,
    errorMessage: '',
  },
  [TransferFormKeys.COMMENT]: {
    validateStatus: TransferValidateStatus.Warning,
    errorMessage: CommentCheckTip,
  },
};
