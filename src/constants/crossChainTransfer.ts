import { DEFAULT_NULL_VALUE, TokenType } from 'constants/index';
import { TCrossChainTransferInfo } from 'types/api';

export const CROSS_CHAIN_TRANSFER_PAGE_TITLE = 'Cross-chain Transfer';

export const BUTTON_TEXT_CONNECT_WALLET = 'Connect wallet';
export const BUTTON_TEXT_INSUFFICIENT_FUNDS = 'Insufficient funds';
export const BUTTON_TEXT_NOT_ENOUGH_NATIVE_FOR_GAS = 'Not enough native for gas';
export const BUTTON_TEXT_TRANSFER = 'Transfer';
export const REMAINING_TRANSFER_QUOTA_TOOLTIP = `Transfers are subject to a 24-hour limit, determined by the real-time USD value of the asset. You can transfer assets up to the available transfer limit.`;
export const TRANSFER_SEND_RECIPIENT_TIP =
  'Choose this option if you wish to send to an address without connecting wallet.';

export const InitialCrossChainTransferInfo: TCrossChainTransferInfo = {
  maxAmount: '',
  minAmount: '',
  limitCurrency: TokenType.USDT,
  totalLimit: '',
  remainingLimit: '',
  transactionFee: '',
  transactionUnit: '',
  expiredTimestamp: 0,
  aelfTransactionFee: '',
  aelfTransactionUnit: 'ELF',
  receiveAmount: '',
  receiveAmountUsd: DEFAULT_NULL_VALUE,
  amountUsd: DEFAULT_NULL_VALUE,
  feeUsd: DEFAULT_NULL_VALUE,
};
