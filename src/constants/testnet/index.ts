import { ContractType } from 'constants/chain';
import * as AELF_Test from '../platform/AELF_Test';
import * as tDVW_Test from '../platform/tDVW_Test';
import { BlockchainNetworkType, NetworkName } from 'constants/network';
import { NetworkEnum } from '@aelf-web-login/wallet-adapter-base';

export const TELEGRAM_BOT_ID = '7057631599';

export const NETWORK_NAME: NetworkName = NetworkName.testnet;

export const NETWORK_TYPE: NetworkEnum = NetworkEnum.TESTNET;

export enum SupportedELFChainId {
  AELF = 'AELF',
  tDVW = 'tDVW',
}

export const SupportedChainId = {
  mainChain: SupportedELFChainId.AELF,
  sideChain: SupportedELFChainId.tDVW,
};

export const CHAIN_NAME: { [chainId in SupportedELFChainId]: string } = {
  [SupportedELFChainId.AELF]: 'aelf MainChain Testnet',
  [SupportedELFChainId.tDVW]: 'aelf dAppChain Testnet',
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
    key: SupportedELFChainId.tDVW,
    label: CHAIN_NAME_ENUM.SideChain,
  },
  {
    key: SupportedELFChainId.AELF,
    label: CHAIN_NAME_ENUM.MainChain,
  },
];

export const CHAIN_LIST_SIDE_CHAIN: IChainNameItem[] = [
  {
    key: SupportedELFChainId.tDVW,
    label: CHAIN_NAME_ENUM.SideChain,
  },
];

export const AelfReact = {
  [SupportedELFChainId.AELF]: {
    chainId: AELF_Test.CHAIN_INFO.chainId,
    rpcUrl: AELF_Test.CHAIN_INFO.rpcUrl,
  },
  [SupportedELFChainId.tDVW]: {
    chainId: tDVW_Test.CHAIN_INFO.chainId,
    rpcUrl: tDVW_Test.CHAIN_INFO.rpcUrl,
  },
};

export const AELF_NODES = {
  AELF: AELF_Test.CHAIN_INFO,
  tDVW: tDVW_Test.CHAIN_INFO,
};

// testnet-jenkins
export const ETransferHost = 'https://test-app.etransfer.exchange';
export const ETransferAuthHost = 'https://test-app.etransfer.exchange';
export const WebLoginGraphqlUrl =
  'https://dapp-aa-portkey-test.portkey.finance/aefinder-v2/api/app/graphql/portkey';
// 'https://dapp-aa-portkey-test.portkey.finance/Portkey_V2_DID/PortKeyIndexerCASchema/graphql';
// 'https://dapp-aa-portkey-test.portkey.finance/Portkey_DID/PortKeyIndexerCASchema/graphql';
export const WebLoginServiceUrl = 'https://aa-portkey-test.portkey.finance';
export const WebLoginConnectUrl = 'https://auth-aa-portkey-test.portkey.finance';

export const ADDRESS_MAP = {
  [SupportedELFChainId.AELF]: {
    [ContractType.CA]: AELF_Test.CA_CONTRACT_V2,
    [ContractType.TOKEN]: AELF_Test.TOKEN_CONTRACT,
    [ContractType.ETRANSFER]: AELF_Test.ETRANSFER_CONTRACT,
  },
  [SupportedELFChainId.tDVW]: {
    [ContractType.CA]: tDVW_Test.CA_CONTRACT_V2,
    [ContractType.TOKEN]: tDVW_Test.TOKEN_CONTRACT,
    [ContractType.ETRANSFER]: tDVW_Test.ETRANSFER_CONTRACT,
  },
};

export const EXPLORE_CONFIG = {
  [SupportedChainId.mainChain]: AELF_NODES.AELF.exploreUrl,
  [SupportedChainId.sideChain]: AELF_NODES.tDVW.exploreUrl,
};

export const SHOW_V_CONSOLE = true;

export enum TransferAllowanceTokens {
  USDT = 'USDT',
  ELF = 'ELF',
  'SGR-1' = 'SGR-1',
  Agent = 'Agent',
}

export const TOKEN_NETWORK_RELATIONS = {
  [TransferAllowanceTokens.USDT]: [
    BlockchainNetworkType.AELF,
    BlockchainNetworkType.tDVW,
    BlockchainNetworkType.SETH,
    BlockchainNetworkType.TBinance,
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
    BlockchainNetworkType.tDVW,
    BlockchainNetworkType.SETH,
    BlockchainNetworkType.TBinance,
  ],
  [TransferAllowanceTokens['SGR-1']]: [
    BlockchainNetworkType.AELF,
    BlockchainNetworkType.tDVW,
    BlockchainNetworkType.SETH,
  ],
  [TransferAllowanceTokens.Agent]: [
    BlockchainNetworkType.AELF,
    BlockchainNetworkType.tDVW,
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
  [BlockchainNetworkType.tDVW]: [
    TransferAllowanceTokens.USDT,
    TransferAllowanceTokens.ELF,
    TransferAllowanceTokens['SGR-1'],
    TransferAllowanceTokens.Agent,
  ],
  [BlockchainNetworkType.SETH]: [
    TransferAllowanceTokens.USDT,
    TransferAllowanceTokens.ELF,
    TransferAllowanceTokens['SGR-1'],
  ],
  [BlockchainNetworkType.TBinance]: [TransferAllowanceTokens.USDT, TransferAllowanceTokens.ELF],
  [BlockchainNetworkType.Tron]: [TransferAllowanceTokens.USDT],
  [BlockchainNetworkType.Polygon]: [TransferAllowanceTokens.USDT],
  [BlockchainNetworkType.Solana]: [TransferAllowanceTokens.USDT],
  [BlockchainNetworkType.Avax]: [TransferAllowanceTokens.USDT],
  [BlockchainNetworkType.Arbitrum]: [TransferAllowanceTokens.USDT],
  [BlockchainNetworkType.Optimism]: [TransferAllowanceTokens.USDT],
  [BlockchainNetworkType.TON]: [TransferAllowanceTokens.USDT],
  [BlockchainNetworkType.BASE]: [TransferAllowanceTokens.Agent],
};
