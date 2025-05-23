import { TChainId } from '@aelf-web-login/wallet-adapter-base';
import { PortkeyVersion } from 'constants/wallet/index';
import { TFromTransfer, TOrderStatus, TToTransfer } from './records';
import type { Moment } from 'moment';
import { IChainNameItem, TokenType } from 'constants/index';
import { TransferStatusType } from 'constants/infoDashboard';

export enum BusinessType {
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
  Transfer = 'Transfer',
}

export enum AuthTokenSource {
  Portkey = 'portkey',
  NightElf = 'nightElf',
  EVM = 'EVM',
  Solana = 'Solana',
  TRON = 'TRX',
  TON = 'Ton',
}

export type TGetTokenNetworkRelationRequest = {
  networkList?: string[];
  tokenList?: string[];
  address?: string;
  sourceType?: WalletSourceType;
};

export type TGetTokenNetworkRelationResult = Record<
  string,
  Record<string, TGetTokenNetworkRelationItem[]>
>;

export type TGetTokenNetworkRelationItem = {
  network: string;
  name: string;
};

export type TGetTokenListRequest = {
  type: BusinessType;
  chainId?: TChainId;
};

export type TGetTokenListResult = {
  tokenList: TTokenItem[];
};

export type TTokenItem = {
  name: string;
  symbol: string;
  icon: string;
  contractAddress: string;
  decimals: number;
};

export type TGetDepositTokenListRequest = {
  type: BusinessType;
};

export type TGetDepositTokenListResult = {
  tokenList: TDepositTokenItem[];
};

export type TDepositTokenItem = TTokenItem & {
  toTokenList?: TToTokenItem[];
};

export type TToTokenItem = TTokenItem & {
  chainIdList?: TChainId[];
  chainList?: IChainNameItem[];
};

export type TGetNetworkListRequest = {
  type: BusinessType;
  chainId?: TChainId;
  symbol?: string;
  address?: string;
};

export type TGetNetworkListResult = {
  networkList: TNetworkItem[];
};

export type TNetworkItem = {
  network: string;
  name: string;
  multiConfirm: string;
  multiConfirmTime: string;
  contractAddress: string;
  explorerUrl: string;
  status: NetworkStatus;
  multiStatus?: Record<string, NetworkStatus>;
  withdrawFee?: string;
  withdrawFeeUnit?: string;
  specialWithdrawFee?: string;
  specialWithdrawFeeDisplay?: boolean;
};

export enum NetworkStatus {
  Health = 'Health',
  Congesting = 'Congesting',
  Offline = 'Offline',
}

export type TGetDepositInfoRequest = {
  chainId: TChainId;
  network: string;
  symbol?: string;
  toSymbol?: string;
};

export type TGetDepositInfoResult = {
  depositInfo: TDepositInfo;
};

export type TDepositInfo = {
  depositAddress: string;
  minAmount: string;
  extraNotes?: string[];
  minAmountUsd: string;
  extraInfo?: TDepositExtraInfo;
  serviceFee?: string;
  serviceFeeUsd?: string;
  currentThreshold?: string;
};

export type TDepositExtraInfo = {
  slippage: string;
};

export type TGetDepositCalculateRequest = {
  toChainId: TChainId;
  fromSymbol: string;
  toSymbol: string;
  fromAmount: string;
};

export type TGetDepositCalculateResult = {
  conversionRate: TConversionRate;
};

export type TConversionRate = {
  fromSymbol: string;
  toSymbol: string;
  fromAmount: string;
  toAmount: string;
  minimumReceiveAmount: string;
  extraInfo?: TConversionExtraInfo;
};

export type TConversionExtraInfo = TDepositExtraInfo;

export type TGetWithdrawInfoRequest = {
  chainId: TChainId;
  network?: string;
  symbol?: string;
  amount?: string;
  address?: string;
  memo?: string;
  version?: PortkeyVersion;
};

export type TGetWithdrawInfoResult = {
  withdrawInfo: TWithdrawInfo;
};

export type TWithdrawInfo = {
  maxAmount: string;
  minAmount: string;
  limitCurrency: string;
  totalLimit: string;
  remainingLimit: string;
  /** cobo */
  transactionFee: string;
  /** cobo */
  transactionUnit: string;
  /** cobo */
  expiredTimestamp: number;
  /** aelf */
  aelfTransactionFee: string;
  /** aelf */
  aelfTransactionUnit: string;
  receiveAmount: string;
  feeList: TFeeItem[];
  receiveAmountUsd: string;
  amountUsd: string;
  feeUsd: string;
};

export type TFeeItem = {
  name: string;
  currency: string;
  amount: string;
};

export type TFeeInfoItem = {
  amount: string;
  unit: string;
};

export type TCreateWithdrawOrderRequest = {
  network: string;
  symbol: string;
  amount: string;
  fromChainId: TChainId;
  toAddress: string;
  memo?: string;
  rawTransaction: string;
};

export type TCreateWithdrawOrderResult = {
  orderId: string;
  transactionId: string;
};

export type TRangeValue = [Moment | null, Moment | null] | null;

export interface TGetRecordsListRequest {
  type: number;
  status: number;
  startTimestamp?: number | null;
  endTimestamp?: number | null;
  skipCount: number;
  maxResultCount: number;
  search?: string | undefined;
  addressList?: string[];
  sorting?: string; // eg: sorting = 'createTime desc'
}

export type TRecordsListItem = {
  id: string;
  orderType: BusinessType;
  status: TOrderStatus;
  arrivalTime: number;
  createTime: number;
  fromTransfer: TFromTransfer;
  toTransfer: TToTransfer;
};

export type TGetRecordsListResult = {
  totalCount: number;
  items: TRecordsListItem[];
};

export type TGetRecordStatusRequest = {
  addressList: string[];
};

export type TCheckEOARegistrationRequest = {
  address: string;
};

export type TCheckEOARegistrationResult = {
  result: boolean;
};

export enum WalletSourceType {
  EVM = 'EVM',
  Solana = 'Solana',
  TRX = 'TRX',
  Ton = 'Ton',
  Portkey = 'Portkey',
}

export type TCheckRegistrationRequest = {
  address: string;
  sourceType: WalletSourceType;
};

export type TCheckRegistrationResult = {
  result: boolean;
};

export type TTokenPricesRequest = {
  symbols: string;
};

export type TTokenPricesResult = {
  items: TTokenPriceItem[];
};

export type TTokenPriceItem = {
  symbol: string;
  priceUsd: number;
};

export type TTransactionOverviewRequest = {
  type: TOverviewTimeType;
  maxResultCount?: number;
};

export enum TOverviewTimeType {
  Day,
  Week,
  Month,
}

export type TTransactionOverviewResult = {
  transaction: TTransactionOverviewData;
};

export type TTransactionOverviewData = {
  totalTx: number;
  latest: string;
  day?: TTransactionOverviewItem[];
  week?: TTransactionOverviewItem[];
  month?: TTransactionOverviewItem[];
};

export type TTransactionOverviewItem = {
  date: string;
  depositTx: number;
  withdrawTx: number;
  transferTx: number;
};

export type TVolumeOverviewRequest = TTransactionOverviewRequest;

export type TVolumeOverviewResult = {
  volume: TVolumeOverviewData;
};

export type TVolumeOverviewData = {
  totalAmountUsd: string;
  latest: string;
  day?: TVolumeOverviewItem[];
  week?: TVolumeOverviewItem[];
  month?: TVolumeOverviewItem[];
};

export type TVolumeOverviewItem = {
  date: string;
  depositAmountUsd: string;
  withdrawAmountUsd: string;
  transferAmountUsd: string;
};

export enum TokensDashboardType {
  All,
  Deposit,
  Transfer,
}

export type TTokenDashboardRequest = {
  type: TokensDashboardType;
};

export type TTokenDashboardResult = {
  [token in TokenType]: TTokenDashboardData;
};

export type TTokenDashboardData = {
  icon: string;
  networks: string[];
  chainIds: TChainId[];
  general: TTokenDashboardItemAmount;
  details: TTokenDashboardDataDetail[];
};

export type TTokenDashboardDataDetail = {
  name: string;
  item: TTokenDashboardItemAmount;
};

export type TTokenDashboardItemAmount = {
  amount24H: string;
  amount24HUsd: string;
  amount7D: string;
  amount7DUsd: string;
  amountTotal: string;
  amountTotalUsd: string;
};

export type TTransferDashboardFilterResult = {
  networkList: TTransferDashboardFilterNetwork[];
  tokenList: TTransferDashboardFilterToken[];
};

export type TTransferDashboardFilterNetwork = {
  key: number;
  name: string;
  network: string;
};

export type TTransferDashboardFilterToken = {
  key: number;
  name: string;
  symbol: string;
  icon: string;
};

export type TTransferDashboardRequest = {
  type: TokensDashboardType;
  fromToken: number;
  fromChainId: number;
  toToken: number;
  toChainId: number;
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
  limit?: number;
};

export type TTransferDashboardResult = {
  totalCount: number;
  items: TTransferDashboardItem[];
};

export type TTransferDashboardItem = {
  id: string;
  orderType: BusinessType;
  secondOrderType: BusinessType;
  status: TOrderStatus;
  createTime: number;
  arrivalTime: number;
  fromTransfer: TTransferDashboardItemFrom;
  toTransfer: TTransferDashboardItemTo;
};

export type TTransferDashboardItemFrom = {
  network: string;
  chainId: TChainId;
  fromAddress: string;
  toAddress: string;
  amount: string;
  amountUsd: string;
  symbol: string;
  txId: string;
  status: TransferStatusType;
  icon?: string;
};

export type TTransferDashboardItemTo = {
  network: string;
  chainId: TChainId;
  toAddress: string;
  fromAddress: string;
  amount: string;
  amountUsd: string;
  symbol: string;
  txId: string;
  status: TransferStatusType;
  feeInfo: TTransferDashboardItemToFee[];
  icon?: string;
};

export type TTransferDashboardItemToFee = {
  symbol: string;
  amount: string;
};

export type TGetRecordDetailResult = {
  id: string;
  orderType: BusinessType;
  secondOrderType: BusinessType;
  status: TOrderStatus;
  arrivalTime: number;
  createTime: number;
  fromTransfer: TFromTransfer & { icon: string };
  toTransfer: TToTransfer & { icon: string };
  step: TRecordDetailStep;
};

export type TRecordDetailStep = {
  currentStep: TransactionRecordStep;
  fromTransfer: {
    confirmingThreshold: number; // total
    confirmedNum: number; // already
  };
};

export enum TransactionRecordStep {
  Submitted,
  FromTransfer,
  ToTransfer,
  ReceivedOrSent,
}

export type TGetTransferInfoRequest = {
  fromNetwork: string;
  toNetwork?: string;
  symbol: string;
  amount?: string;
  toAddress?: string;
  memo?: string;
  version?: PortkeyVersion;
  fromAddress?: string;
  sourceType?: WalletSourceType;
};

export type TGetTransferInfoResult = {
  transferInfo: TCrossChainTransferInfo;
};

export type TCrossChainTransferInfo = {
  contractAddress?: string;
  maxAmount: string;
  minAmount: string;
  limitCurrency: string;
  totalLimit: string;
  remainingLimit: string;
  transactionFee?: string;
  transactionUnit?: string;
  aelfTransactionFee?: string;
  aelfTransactionUnit?: string;
  receiveAmount: string;
  expiredTimestamp: number;
  amountUsd: string;
  receiveAmountUsd: string;
  feeUsd: string;
};

export type TCreateTransferOrderRequest = {
  amount: string;
  fromNetwork: string;
  toNetwork: string;
  fromSymbol: string;
  toSymbol: string;
  fromAddress: string;
  toAddress: string;
  memo?: string;
  rawTransaction?: string;
};

export type TCreateTransferOrderResult = {
  orderId: string;
  address?: string;
  transactionId?: string;
};

export enum UpdateTransferOrderStatus {
  Rejected = 'Rejected',
}

export type TUpdateTransferOrderRequest = {
  amount: string;
  fromNetwork: string;
  toNetwork: string;
  fromSymbol: string;
  toSymbol: string;
  fromAddress: string;
  toAddress: string;
  address: string; // token pool address
  memo?: string;
  txId: string;
  status?: UpdateTransferOrderStatus;
};

export type TUpdateTransferOrderResult = boolean;

export type TGetApplicationTokenListResult = {
  tokenList: TApplicationTokenItem[];
};

export type TApplicationTokenItem = {
  tokenName: string;
  symbol: string;
  tokenImage: string;
  liquidityInUsd: string;
  holders: number;
};

export type TCommitTokenInfoRequest = {
  symbol: string;
  officialWebsite: string;
  officialTwitter: string;
  title: string;
  personName: string;
  telegramHandler: string;
  email: string;
};

export type TCommitTokenInfoResult = boolean;

export type TGetApplicationTokenInfoRequest = {
  symbol: string;
};

export type TGetApplicationTokenInfoResult = {
  symbol: string;
  userAddress: string;
  officialWebsite: string;
  officialTwitter: string;
  title: string;
  personName: string;
  telegramHandler: string;
  email: string;
};

export type TGetApplicationChainStatusListRequest = {
  symbol: string;
};

export type TGetApplicationChainStatusListResult = {
  chainList: TApplicationChainStatusItem[];
  otherChainList: TApplicationChainStatusItem[];
};

export type TApplicationChainStatusItem = {
  chainId: string;
  chainName: string;
  status: ApplicationChainStatusEnum;
  checked: boolean;
  totalSupply: number;
  contractAddress: string;
  symbol: string;
  tokenName: string;
  icon: string;
  bindingId?: string;
  thirdTokenId?: string;
  rejectedTime?: number;
};

export enum ApplicationChainStatusEnum {
  Unissued = 'Unissued',
  Issuing = 'Issuing',
  Issued = 'Issued',
  Reviewing = 'Reviewing',
  Rejected = 'Rejected',
  Reviewed = 'Reviewed',
  PoolInitializing = 'PoolInitializing',
  PoolInitialized = 'PoolInitialized',
  Integrating = 'Integrating',
  Complete = 'Complete',
  Failed = 'Failed',
}

export type TAddApplicationChainRequest = {
  chainIds?: string[];
  otherChainIds?: string[];
  symbol: string;
};

export type TAddApplicationChainResult = {
  chainList?: TAddApplicationChainResultChainItem[];
  otherChainList?: TAddApplicationChainResultChainItem[];
};

export type TAddApplicationChainResultChainItem = {
  id: string;
  chainId: string;
};

export type TPrepareBindIssueRequest = {
  address: string;
  symbol: string;
  chainId: string;
  otherChainId?: string;
  contractAddress: string;
  supply: string;
};

export type TPrepareBindIssueResult = {
  bindingId: string;
  thirdTokenId: string;
};

export type TGetApplicationIssueRequest = {
  bindingId: string;
  thirdTokenId: string;
};

export type TGetApplicationIssueResult = boolean;

export type TGetMyApplicationListRequest = {
  skipCount?: number;
  maxResultCount?: number;
};

export type TGetMyApplicationListResult = {
  items: TMyApplicationItem[];
  totalCount: number;
};

export type TMyApplicationItem = {
  id: string;
  symbol: string;
  status: ApplicationChainStatusEnum;
  updateTime: number;
  rejectedTime?: number; // status === ApplicationChainStatusEnum.Rejected
  rejectedReason?: string; // status === ApplicationChainStatusEnum.Rejected
  failedTime?: number; // status === ApplicationChainStatusEnum.Failed
  failedReason?: string; // status === ApplicationChainStatusEnum.Failed
  chainTokenInfo?: TMyApplicationChainTokenInfo[];
  otherChainTokenInfo?: TMyApplicationChainTokenInfo;
};

export type TMyApplicationChainTokenInfo = {
  chainId: string;
  chainName: string;
  tokenName: string;
  icon: string;
  poolAddress: string;
  status: ApplicationChainStatusEnum;
};

export type TGetApplicationDetailRequest = {
  symbol: string;
  id?: string;
  network?: string;
};

export type TGetApplicationDetailResult = TApplicationDetailItem[];

export type TApplicationDetailItem = {
  id: string;
  symbol: string;
  userAddress: string;
  status: ApplicationChainStatusEnum;
  createTime: number;
  updateTime: number;
  chainTokenInfo?: TApplicationDetailItemChainTokenInfo[];
  otherChainTokenInfo?: TApplicationDetailItemChainTokenInfo;
};

export type TApplicationDetailItemChainTokenInfo = {
  chainId: string;
  chainName: string;
  tokenName: string;
  symbol: string;
  totalSupply: number;
  decimals: number;
  icon: string;
  poolAddress: string;
  contractAddress: string;
  tokenContractAddress: string;
  status: ApplicationChainStatusEnum;
  balanceAmount: string;
  minAmount: string;
  limit24HInUsd: string;
  rejectedTime: number;
};

export type TGetTokenConfigRequest = {
  symbol: string;
};

export type TGetTokenConfigResult = {
  liquidityInUsd: string;
  holders: number;
};

export type TChangeApplicationStatusRequest = {
  symbol: string;
  id?: string;
  chainId?: string;
};

export type TChangeApplicationStatusResult = boolean;
