import { defaultNullValue } from 'constants/index';

export const DEPOSIT_ADDRESS_LABEL = 'Deposit Address';

export const MINIMUM_DEPOSIT = 'Minimum Deposit';

export const CONTRACT_ADDRESS = 'Contract Address';

export const DEPOSIT_RETRY_TEXT = 'The deposit service is busy. Please try again later.';

export const DEPOSIT_RETRY_BUTTON_TEXT = 'Retry';

export const INIT_DEPOSIT_INFO = {
  depositAddress: '',
  minAmount: '',
  minAmountUsd: defaultNullValue,
};

export const CHECK_TXN_DURATION = 5 * 60 * 1000;

export const CHECK_TXN_BUTTON = 'Check Txn';

export const CHECKING_TXN_BUTTON = 'Checking Transaction...';
