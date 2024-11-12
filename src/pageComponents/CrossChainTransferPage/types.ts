import { CommentCheckTip } from 'constants/withdraw';
import { TNetworkItem } from 'types/api';

export enum TransferValidateStatus {
  Error = 'error',
  Warning = 'warning',
  Normal = '',
}

export enum TransferFormKeys {
  FROM_NETWORK = 'fromNetwork',
  TO_NETWORK = 'toNetwork',
  TOKEN = 'token',
  AMOUNT = 'amount',
  RECIPIENT = 'recipient',
  COMMENT = 'comment',
}

export type TTransferFormValues = {
  [TransferFormKeys.FROM_NETWORK]: string;
  [TransferFormKeys.TO_NETWORK]: TNetworkItem; // TODO
  [TransferFormKeys.TOKEN]: string;
  [TransferFormKeys.AMOUNT]: string;
  [TransferFormKeys.RECIPIENT]: string;
  [TransferFormKeys.COMMENT]: string;
};

export type TTransferFormValidateData = {
  [key in TransferFormKeys]: { validateStatus: TransferValidateStatus; errorMessage: string };
};

export const TRANSFER_FORM_VALIDATE_DATA = {
  [TransferFormKeys.FROM_NETWORK]: {
    validateStatus: TransferValidateStatus.Normal,
    errorMessage: '',
  },
  [TransferFormKeys.TO_NETWORK]: {
    validateStatus: TransferValidateStatus.Normal,
    errorMessage: '',
  },
  [TransferFormKeys.TOKEN]: { validateStatus: TransferValidateStatus.Normal, errorMessage: '' },
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
