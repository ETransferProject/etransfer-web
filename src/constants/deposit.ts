import { DEFAULT_NULL_VALUE } from 'constants/index';

export const DEPOSIT_PAGE_TITLE = 'Deposit Assets to aelf';

export const DEPOSIT_ADDRESS_LABEL = 'Deposit Address';

export const SERVICE_FEE = 'Service Fee';

export const MINIMUM_DEPOSIT = 'Minimum Deposit';

export const CONTRACT_ADDRESS = 'Contract Address';

export const DEPOSIT_RETRY_TEXT = 'The deposit service is busy. Please try again later.';

export const SERVICE_FEE_TIP =
  'This is an estimated fee charged by Cobo to cover the costs of asset consolidation.';

export const RECEIVED_0_TIP = 'Less than the minimum deposit amount.';

export const DEPOSIT_RETRY_BUTTON_TEXT = 'Retry';

export const INIT_DEPOSIT_INFO = {
  depositAddress: '',
  minAmount: '',
  minAmountUsd: DEFAULT_NULL_VALUE,
};

export const CHECK_TXN_DURATION = 5 * 60 * 1000;

export const CHECK_TXN_BUTTON = 'Check Transaction';

export const CHECKING_TXN_BUTTON = 'Checking Transaction...';

export const NO_TXN_FOUND = 'No transactions found. Please wait or verify the deposit address.';
