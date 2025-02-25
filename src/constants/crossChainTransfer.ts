import { DEFAULT_NULL_VALUE, TokenType } from 'constants/index';
import { TCrossChainTransferInfo } from 'types/api';

export const CROSS_CHAIN_TRANSFER_PAGE_TITLE = 'Cross-chain Transfer';

export const NO_MATCHING_NETWORK = 'No matching network';

export const BUTTON_TEXT_CONNECT = 'Connect';
export const BUTTON_TEXT_CONNECT_WALLET = 'Connect wallet';
export const BUTTON_TEXT_INSUFFICIENT_FUNDS = 'Insufficient funds';
export const BUTTON_TEXT_NOT_ENOUGH_NATIVE_FOR_GAS = 'Not enough native for gas';
export const BUTTON_TEXT_TRANSFER = 'Transfer';
export const REMAINING_TRANSFER_QUOTA_TOOLTIP = `Transfers are subject to a 24-hour limit, determined by the real-time USD value of the asset. You can transfer assets up to the available transfer limit.`;
export const TRANSFER_SEND_RECIPIENT_TIP =
  'Choose this option if you wish to send to an address without connecting wallet.';
export const DEFAULT_SEND_TRANSFER_ERROR =
  'Failed to initiate the transaction. Please try again later.';
export const ADDRESS_SHORTER_THAN_USUAL = `The address you entered is shorter than usual. Please double-check to ensure it's the correct address.`;
export const ADDRESS_NOT_CORRECT = `Please enter a correct address.`;
export const TRANSACTION_APPROVE_LOADING = 'Please approve the transaction in the wallet...';
export const NOT_ENOUGH_ELF_FEE =
  'Not enough ELF for network fee. Please keep enough ELF in your wallet for the fee.';

export const SEND_TRANSFER_ADDRESS_ERROR_CODE_LIST = ['40100', '40101'];
export const SEND_TRANSFER_ERROR_CODE_LIST = [
  '40001',
  '40002',
  '40003',
  '40004',
  '40005',
  '40006',
  '40007',
  '40008',
  '40009',
  '40010',
  '40011',
  '40012',
  '40013',
  '40014',
  '40015',
];

export enum ErrorNameType {
  FAIL_MODAL_REASON = 'failModalReason',
}

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
