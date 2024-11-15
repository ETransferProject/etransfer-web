import { DEFAULT_NULL_VALUE, TokenType } from 'constants/index';
import { TCrossChainTransferInfo } from 'types/api';

export const CROSS_CHAIN_TRANSFER_PAGE_TITLE = 'Cross-chain Transfer';

export const BUTTON_TEXT_CONNECT_WALLET = 'Connect wallet';
export const BUTTON_TEXT_INSUFFICIENT_FUNDS = 'Insufficient funds';
export const BUTTON_TEXT_NOT_ENOUGH_NATIVE_FOR_GAS = 'Not enough native for gas';
export const BUTTON_TEXT_TRANSFER = 'Transfer';

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
