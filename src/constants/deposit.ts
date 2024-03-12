import { CHAIN_LIST } from 'constants/index';
import { NetworkStatus, WithdrawInfo } from 'types/api';
import { WithdrawInfoSuccess } from 'types/deposit';

export const DEPOSIT_ADDRESS_LABEL = 'Deposit Address';

export const MINIMUM_DEPOSIT = 'Minimum Deposit';

export const CONTRACT_ADDRESS = 'Contract Address';

export const initDepositInfo = {
  depositAddress: '',
  minAmount: '',
};

export const initialWithdrawInfo: WithdrawInfo = {
  maxAmount: '',
  minAmount: '',
  limitCurrency: 'USDT',
  totalLimit: '',
  remainingLimit: '',
  transactionFee: '',
  transactionUnit: 'USDT',
  expiredTimestamp: 0,
  aelfTransactionFee: '',
  aelfTransactionUnit: 'ELF',
  receiveAmount: '',
  feeList: [],
  receiveAmountUsd: '',
  amountUsd: '',
  feeUsd: '',
};

export const initialNetwork = {
  network: '',
  name: '',
  multiConfirm: '',
  multiConfirmTime: '',
  contractAddress: '',
  explorerUrl: '',
  status: NetworkStatus.Health,
};

export const initialWithdrawSuccessCheck: WithdrawInfoSuccess = {
  symbol: '',
  amount: '',
  receiveAmount: '',
  chainItem: CHAIN_LIST[0],
  network: initialNetwork,
  arriveTime: '',
  receiveAmountUsd: '',
};

export const DepositRetryText = 'The deposit service is busy. Please try again later.';
export const DepositRetryBtnText = 'Retry';
