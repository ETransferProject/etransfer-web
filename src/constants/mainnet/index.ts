import { ContractType } from 'constants/chain';
import * as AELF from '../platform/AELF';
import * as tDVV from '../platform/tDVV';
import { BlockchainNetworkType, NetworkName } from 'constants/network';
import { NetworkEnum } from '@aelf-web-login/wallet-adapter-base';
import { NetworkStatus, TNetworkItem } from 'types/api';

export const TELEGRAM_BOT_ID = '7393968118';

export const NETWORK_NAME = NetworkName.mainnet;

export const NETWORK_TYPE: NetworkEnum = NetworkEnum.MAINNET;

export enum SupportedELFChainId {
  AELF = 'AELF',
  tDVV = 'tDVV',
}

export const SupportedChainId = {
  mainChain: SupportedELFChainId.AELF,
  sideChain: SupportedELFChainId.tDVV,
};

export const CHAIN_NAME: { [chainId in SupportedELFChainId]: string } = {
  [SupportedELFChainId.AELF]: 'aelf MainChain',
  [SupportedELFChainId.tDVV]: 'aelf dAppChain',
};

export enum CHAIN_NAME_ENUM {
  'MainChain' = 'aelf MainChain',
  'SideChain' = 'aelf dAppChain',
}

export interface IChainNameItem {
  key: SupportedELFChainId;
  label: CHAIN_NAME_ENUM;
}

export const CHAIN_LIST: IChainNameItem[] = [
  {
    key: SupportedELFChainId.tDVV,
    label: CHAIN_NAME_ENUM.SideChain,
  },
  {
    key: SupportedELFChainId.AELF,
    label: CHAIN_NAME_ENUM.MainChain,
  },
];

export const CHAIN_LIST_SIDE_CHAIN: IChainNameItem[] = [
  {
    key: SupportedELFChainId.tDVV,
    label: CHAIN_NAME_ENUM.SideChain,
  },
];

export const AelfReact = {
  [SupportedELFChainId.AELF]: {
    chainId: AELF.CHAIN_INFO.chainId,
    rpcUrl: AELF.CHAIN_INFO.rpcUrl,
  },
  [SupportedELFChainId.tDVV]: {
    chainId: tDVV.CHAIN_INFO.chainId,
    rpcUrl: tDVV.CHAIN_INFO.rpcUrl,
  },
};

export const AELF_NODES = {
  AELF: AELF.CHAIN_INFO,
  tDVV: tDVV.CHAIN_INFO,
};

export const ETransferHost = 'https://app.etransfer.exchange';
export const ETransferAuthHost = 'https://app.etransfer.exchange';
export const WebLoginGraphqlUrl = 'https://indexer-api.aefinder.io/api/app/graphql/portkey';
export const WebLoginServiceUrl = 'https://aa-portkey.portkey.finance';
export const WebLoginConnectUrl = 'https://auth-aa-portkey.portkey.finance';

export const ADDRESS_MAP = {
  [SupportedELFChainId.AELF]: {
    [ContractType.CA]: AELF.CA_CONTRACT_V2,
    [ContractType.TOKEN]: AELF.TOKEN_CONTRACT,
    [ContractType.ETRANSFER]: AELF.ETRANSFER_CONTRACT,
  },
  [SupportedELFChainId.tDVV]: {
    [ContractType.CA]: tDVV.CA_CONTRACT_V2,
    [ContractType.TOKEN]: tDVV.TOKEN_CONTRACT,
    [ContractType.ETRANSFER]: tDVV.ETRANSFER_CONTRACT,
  },
};

export const EXPLORE_CONFIG = {
  [SupportedChainId.mainChain]: AELF_NODES.AELF.exploreUrl,
  [SupportedChainId.sideChain]: AELF_NODES.tDVV.exploreUrl,
};

export const SHOW_V_CONSOLE = false;

export enum TransferAllowanceTokens {
  USDT = 'USDT',
  ELF = 'ELF',
  'SGR-1' = 'SGR-1',
  AGENT = 'AGENT',
}

const USDT_NETWORK_LIST = [
  BlockchainNetworkType.AELF,
  BlockchainNetworkType.tDVV,
  BlockchainNetworkType.Ethereum,
  BlockchainNetworkType.Binance,
  BlockchainNetworkType.Solana,
  BlockchainNetworkType.Tron,
  BlockchainNetworkType.Polygon,
  BlockchainNetworkType.Avax,
  BlockchainNetworkType.Arbitrum,
  BlockchainNetworkType.Optimism,
  BlockchainNetworkType.TON,
];

const ELF_NETWORK_LIST = [
  BlockchainNetworkType.AELF,
  BlockchainNetworkType.tDVV,
  BlockchainNetworkType.Ethereum,
  BlockchainNetworkType.Binance,
];

export const NETWORK_TOKEN_RELATIONS = {
  [BlockchainNetworkType.AELF]: {
    [TransferAllowanceTokens.USDT]: USDT_NETWORK_LIST, // does not include itself
    [TransferAllowanceTokens.ELF]: ELF_NETWORK_LIST, // does not include itself
    [TransferAllowanceTokens['SGR-1']]: [BlockchainNetworkType.Ethereum],
    [TransferAllowanceTokens.AGENT]: [BlockchainNetworkType.BASE],
  },
  [BlockchainNetworkType.tDVV]: {
    [TransferAllowanceTokens.USDT]: USDT_NETWORK_LIST, // does not include itself
    [TransferAllowanceTokens.ELF]: ELF_NETWORK_LIST, // does not include itself
    [TransferAllowanceTokens['SGR-1']]: [BlockchainNetworkType.Ethereum],
    [TransferAllowanceTokens.AGENT]: [BlockchainNetworkType.BASE],
  },
  [BlockchainNetworkType.Ethereum]: {
    [TransferAllowanceTokens.USDT]: USDT_NETWORK_LIST, // does not include itself
    [TransferAllowanceTokens.ELF]: ELF_NETWORK_LIST, // does not include itself
    [TransferAllowanceTokens['SGR-1']]: [BlockchainNetworkType.tDVV],
  },
  [BlockchainNetworkType.Binance]: {
    [TransferAllowanceTokens.USDT]: USDT_NETWORK_LIST, // does not include itself
    [TransferAllowanceTokens.ELF]: ELF_NETWORK_LIST, // does not include itself
  },
  [BlockchainNetworkType.Solana]: {
    [TransferAllowanceTokens.USDT]: USDT_NETWORK_LIST, // does not include itself
  },
  [BlockchainNetworkType.Tron]: {
    [TransferAllowanceTokens.USDT]: USDT_NETWORK_LIST, // does not include itself
  },
  [BlockchainNetworkType.Polygon]: {
    [TransferAllowanceTokens.USDT]: USDT_NETWORK_LIST, // does not include itself
  },
  [BlockchainNetworkType.Avax]: {
    [TransferAllowanceTokens.USDT]: USDT_NETWORK_LIST, // does not include itself
  },
  [BlockchainNetworkType.Arbitrum]: {
    [TransferAllowanceTokens.USDT]: USDT_NETWORK_LIST, // does not include itself
  },
  [BlockchainNetworkType.Optimism]: {
    [TransferAllowanceTokens.USDT]: USDT_NETWORK_LIST, // does not include itself
  },
  [BlockchainNetworkType.TON]: {
    [TransferAllowanceTokens.USDT]: USDT_NETWORK_LIST, // does not include itself
  },
  [BlockchainNetworkType.BASE]: {
    [TransferAllowanceTokens.AGENT]: [BlockchainNetworkType.tDVV],
  },
};

export const TRANSFER_DEFAULT_FROM_NETWORK: TNetworkItem = {
  contractAddress: '',
  explorerUrl: '',
  multiConfirm: '64 confirmations',
  multiConfirmTime: '4 mins',
  name: 'Ethereum (ERC20)',
  network: 'ETH',
  specialWithdrawFee: '',
  specialWithdrawFeeDisplay: false,
  status: NetworkStatus.Health,
};

export const TRANSFER_DEFAULT_TO_NETWORK: TNetworkItem = {
  contractAddress: '',
  explorerUrl: '',
  multiConfirm: '16 confirmations',
  multiConfirmTime: '4 mins',
  name: 'aelf dAppChain',
  network: 'tDVV',
  specialWithdrawFee: '',
  specialWithdrawFeeDisplay: false,
  status: NetworkStatus.Health,
};
