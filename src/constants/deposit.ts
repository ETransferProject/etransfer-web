import { CHAIN_LIST } from 'constants/index';
import { DoubleCheckModalProps } from 'pageComponents/WithdrawContent/DoubleCheckModal';
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
  AElfTransactionFee: '',
  AElfTransactionUnit: 'ELF',
  receiveAmount: '',
  feeList: [],
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

export const initialWithdrawInfoCheck: DoubleCheckModalProps['withdrawInfo'] = {
  receiveAmount: '',
  address: '',
  network: initialNetwork,
  amount: '',
  transactionFee: {
    amount: '',
    currency: '',
    name: '',
  },
  AElfTransactionFee: {
    amount: '',
    currency: '',
    name: '',
  },
  symbol: '',
};

export const initialWithdrawSuccessCheck: WithdrawInfoSuccess = {
  symbol: '',
  amount: '',
  receiveAmount: '',
  chainItem: CHAIN_LIST[0],
  network: initialNetwork,
  arriveTime: '',
};
