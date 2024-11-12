// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { API_REQ_FUNCTION } from './types';

export const DEFAULT_METHOD = 'GET';

/**
 * api request configuration directory
 * @example
 *    upload: {
 *      target: '/api/file-management/file-descriptor/upload',
 *      baseConfig: { method: 'POST', },
 *    },
 * or:
 *    upload:'/api/file-management/file-descriptor/upload'
 *
 * @description api configuration default method is from DEFAULT_METHOD
 * @type {UrlObj}  // The type of this object from UrlObj.
 */

const AuthList = {
  token: {
    target: '/connect/token',
    baseConfig: { method: 'POST' },
  },
};

const DepositApiList = {
  getDepositTokenList: '/api/etransfer/token/option',
  getDepositInfo: '/api/etransfer/deposit/info',
  depositCalculator: '/api/etransfer/deposit/calculator',
};

const WithdrawApiList = {
  getWithdrawInfo: '/api/etransfer/withdraw/info',
  createWithdrawOrder: {
    target: '/api/etransfer/withdraw/order',
    baseConfig: { method: 'POST' },
  },
};

const TransferApiList = {
  getTokenList: '/api/etransfer/token/list',
  getNetworkList: '/api/etransfer/network/list',
  getTransferInfo: '/api/etransfer/transfer/info',
  createTransferOrder: {
    target: '/api/etransfer/transfer/order',
    baseConfig: { method: 'POST' },
  },
  updateTransferOrder: {
    target: '/api/etransfer/transfer',
    baseConfig: { method: 'PUT' },
  },
};

const HistoryApiList = {
  getRecordsList: '/api/etransfer/record/list',
  getRecordStatus: '/api/etransfer/record/status',
  getRecordDetail: '/api/etransfer/record',
};

const InfoDashboard = {
  getTransactionOverview: '/api/etransfer/info/transaction-overview',
  getVolumeOverview: '/api/etransfer/info/volume-overview',
  getTokens: '/api/etransfer/info/tokens',
  getNetworkOption: '/api/etransfer/info/network/option',
  geTransfers: '/api/etransfer/info/transfers',
};

const UserApiList = {
  checkEOARegistration: '/api/etransfer/user/check-eoa-registration',
  getTokenPrices: '/api/etransfer/token/price',
  checkRegistration: '/api/etransfer/user/check-registration',
};

/**
 * api request extension configuration directory
 * @description object.key // The type of this object key comes from from @type {UrlObj}
 */
export const EXPAND_APIS = {
  deposit: DepositApiList,
  withdraw: WithdrawApiList,
  transfer: TransferApiList,
  auth: AuthList,
  records: HistoryApiList,
  user: UserApiList,
  infoDashboard: InfoDashboard,
};

export type EXPAND_REQ_TYPES = {
  [X in keyof typeof EXPAND_APIS]: {
    [K in keyof (typeof EXPAND_APIS)[X]]: API_REQ_FUNCTION;
  };
};
