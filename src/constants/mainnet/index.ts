import { ContractType } from 'constants/chain';
import * as AELF from '../platform/AELF';
import * as tDVV from '../platform/tDVV';
import { BlockchainNetworkType, NetworkName } from 'constants/network';
import { NetworkEnum } from '@aelf-web-login/wallet-adapter-base';

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
export const WebLoginGraphqlUrl =
  'https://dapp-aa-portkey.portkey.finance/aefinder-v2/api/app/graphql/portkey';
// 'https://dapp-aa-portkey.portkey.finance/Portkey_V2_DID/PortKeyIndexerCASchema/graphql';
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
  Agent = 'Agent',
}

export const TOKEN_NETWORK_RELATIONS = {
  [TransferAllowanceTokens.USDT]: [
    BlockchainNetworkType.AELF,
    BlockchainNetworkType.tDVV,
    BlockchainNetworkType.Ethereum,
    BlockchainNetworkType.Binance,
    BlockchainNetworkType.Tron,
    BlockchainNetworkType.Polygon,
    BlockchainNetworkType.Solana,
    BlockchainNetworkType.Avax,
    BlockchainNetworkType.Arbitrum,
    BlockchainNetworkType.Optimism,
    BlockchainNetworkType.TON,
  ],
  [TransferAllowanceTokens.ELF]: [
    BlockchainNetworkType.AELF,
    BlockchainNetworkType.tDVV,
    BlockchainNetworkType.Ethereum,
    BlockchainNetworkType.Binance,
  ],
  [TransferAllowanceTokens['SGR-1']]: [
    BlockchainNetworkType.AELF,
    BlockchainNetworkType.tDVV,
    BlockchainNetworkType.Ethereum,
  ],
  [TransferAllowanceTokens.Agent]: [
    BlockchainNetworkType.AELF,
    BlockchainNetworkType.tDVV,
    BlockchainNetworkType.BASE,
  ],
};

export const TO_NETWORK_TOKEN_CONFIG = {
  [BlockchainNetworkType.AELF]: [
    TransferAllowanceTokens.USDT,
    TransferAllowanceTokens.ELF,
    TransferAllowanceTokens['SGR-1'],
    TransferAllowanceTokens.Agent,
  ],
  [BlockchainNetworkType.tDVV]: [
    TransferAllowanceTokens.USDT,
    TransferAllowanceTokens.ELF,
    TransferAllowanceTokens['SGR-1'],
    TransferAllowanceTokens.Agent,
  ],
  [BlockchainNetworkType.Ethereum]: [
    TransferAllowanceTokens.USDT,
    TransferAllowanceTokens.ELF,
    TransferAllowanceTokens['SGR-1'],
  ],
  [BlockchainNetworkType.Binance]: [TransferAllowanceTokens.USDT, TransferAllowanceTokens.ELF],
  [BlockchainNetworkType.Tron]: [TransferAllowanceTokens.USDT],
  [BlockchainNetworkType.Polygon]: [TransferAllowanceTokens.USDT],
  [BlockchainNetworkType.Solana]: [TransferAllowanceTokens.USDT],
  [BlockchainNetworkType.Avax]: [TransferAllowanceTokens.USDT],
  [BlockchainNetworkType.Arbitrum]: [TransferAllowanceTokens.USDT],
  [BlockchainNetworkType.Optimism]: [TransferAllowanceTokens.USDT],
  [BlockchainNetworkType.TON]: [TransferAllowanceTokens.USDT],
  [BlockchainNetworkType.BASE]: [TransferAllowanceTokens.Agent],
};
