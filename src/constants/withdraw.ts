import { CHAIN_LIST, TokenType, DEFAULT_NULL_VALUE } from 'constants/index';
import { NetworkStatus, TWithdrawInfo } from 'types/api';
import { TArrivalTimeConfig, TWithdrawInfoSuccess } from 'types/deposit';
import { AllSupportedELFChainId } from './chain';

export const WithdrawAddressErrorCodeList = ['40100', '40101'];

export const WithdrawSendTxErrorCodeList = [
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

export const DefaultWithdrawErrorMessage =
  'Failed to initiate the transaction. Please try again later.';

export const AmountGreaterThanBalanceMessage =
  'The amount exceeds the remaining withdrawal quota. Please consider transferring a smaller amount.';

export const InsufficientAllowanceMessage =
  'Insufficient allowance. Please try again, ensuring that you approve an adequate amount as the allowance.';

export const RemainingWithdrawalQuotaTooltip = `Withdrawals are subject to a 24-hour limit, determined by the real-time USD value of the asset. You can withdraw assets up to the available withdrawal limit.`;

export const WithdrawTonCommentTip =
  'Check if the receiving platform requires you to include a tag/memo. If required, ensure the tag/memo is correct to avoid losing your assets.';

export const CommentCheckTip =
  'Check that the Comment is correct, otherwise your funds will be lost.';

export const InitialWithdrawInfo: TWithdrawInfo = {
  maxAmount: '',
  minAmount: '',
  limitCurrency: TokenType.USDT,
  totalLimit: '',
  remainingLimit: '',
  transactionFee: '',
  transactionUnit: TokenType.USDT,
  expiredTimestamp: 0,
  aelfTransactionFee: '',
  aelfTransactionUnit: 'ELF',
  receiveAmount: '',
  feeList: [],
  receiveAmountUsd: DEFAULT_NULL_VALUE,
  amountUsd: DEFAULT_NULL_VALUE,
  feeUsd: DEFAULT_NULL_VALUE,
};

export const InitialNetwork = {
  network: '',
  name: '',
  multiConfirm: '',
  multiConfirmTime: '',
  contractAddress: '',
  explorerUrl: '',
  status: NetworkStatus.Health,
};

export const InitialWithdrawSuccessCheck: TWithdrawInfoSuccess = {
  symbol: '',
  amount: '',
  receiveAmount: '',
  chainItem: CHAIN_LIST[0],
  network: InitialNetwork,
  arriveTime: '',
  receiveAmountUsd: DEFAULT_NULL_VALUE,
  transactionId: '',
};

export const ARRIVAL_TIME_CONFIG: Record<string, TArrivalTimeConfig> = {
  USDT: {
    dividingQuota: '300',
    chainList: [
      AllSupportedELFChainId.AELF,
      AllSupportedELFChainId.tDVV,
      AllSupportedELFChainId.tDVW,
    ],
  },
  ELF: {
    dividingQuota: '5000',
    chainList: [
      AllSupportedELFChainId.AELF,
      AllSupportedELFChainId.tDVV,
      AllSupportedELFChainId.tDVW,
    ],
  },
};

export const APPROVE_ELF_FEE = '0.02';
