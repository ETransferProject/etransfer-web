import { DEFAULT_NULL_VALUE, TokenType } from 'constants/index';
import { TCrossChainTransferInfo } from 'types/api';

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
