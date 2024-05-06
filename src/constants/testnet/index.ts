import { ContractType } from 'constants/chain';
import * as AELF_Test from '../platform/AELF_Test';
import * as tDVW_Test from '../platform/tDVW_Test';
import { TNetworkTypeV1, TNetworkTypeV2 } from 'types/index';
import { NetworkName } from 'constants/network';
import { PortkeyVersion } from 'constants/wallet';

export const NETWORK_NAME: NetworkName = NetworkName.testnet;

export const NETWORK_TYPE_V1: TNetworkTypeV1 = 'TESTNET';
export const NETWORK_TYPE_V2: TNetworkTypeV2 = 'TESTNET';

export enum SupportedELFChainId {
  AELF = 'AELF',
  tDVW = 'tDVW',
}

export const SupportedChainId = {
  mainChain: SupportedELFChainId.AELF,
  sideChain: SupportedELFChainId.tDVW,
};

export const CHAIN_NAME: { [chainId in SupportedELFChainId]: string } = {
  [SupportedELFChainId.AELF]: 'MainChain AELF Testnet',
  [SupportedELFChainId.tDVW]: 'SideChain tDVW Testnet',
};

export enum CHAIN_NAME_ENUM {
  'MainChain' = 'MainChain AELF',
  'SideChain' = 'SideChain tDVW',
}

export interface IChainNameItem {
  key: SupportedELFChainId;
  label: CHAIN_NAME_ENUM;
}

export const CHAIN_LIST: IChainNameItem[] = [
  {
    key: SupportedELFChainId.AELF,
    label: CHAIN_NAME_ENUM.MainChain,
  },
  {
    key: SupportedELFChainId.tDVW,
    label: CHAIN_NAME_ENUM.SideChain,
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
export const ETransferHost = 'https://test.etransfer.exchange';
export const ETransferAuthHost = 'https://test.etransfer.exchange';
export const WebLoginGraphqlUrlV1 =
  'https://dapp-portkey-test.portkey.finance/Portkey_DID/PortKeyIndexerCASchema/graphql';
export const WebLoginGraphqlUrlV2 =
  'https://dapp-aa-portkey-test.portkey.finance/Portkey_V2_DID/PortKeyIndexerCASchema/graphql';
export const WebLoginRequestDefaultsUrlV1 = 'https://did-portkey-test.portkey.finance';
export const WebLoginRequestDefaultsUrlV2 = 'https://aa-portkey-test.portkey.finance';
export const WebLoginServiceUrlV1 = 'https://did-portkey-test.portkey.finance';
export const WebLoginServiceUrlV2 = 'https://aa-portkey-test.portkey.finance';
export const WebLoginConnectUrlV2 = 'https://auth-aa-portkey-test.portkey.finance';

export const ADDRESS_MAP = {
  [PortkeyVersion.v1]: {
    [SupportedELFChainId.AELF]: {
      [ContractType.CA]: AELF_Test.CA_CONTRACT,
      [ContractType.TOKEN]: AELF_Test.TOKEN_CONTRACT,
    },
    [SupportedELFChainId.tDVW]: {
      [ContractType.CA]: tDVW_Test.CA_CONTRACT,
      [ContractType.TOKEN]: tDVW_Test.TOKEN_CONTRACT,
    },
  },
  [PortkeyVersion.v2]: {
    [SupportedELFChainId.AELF]: {
      [ContractType.CA]: AELF_Test.CA_CONTRACT_V2,
      [ContractType.TOKEN]: AELF_Test.TOKEN_CONTRACT,
    },
    [SupportedELFChainId.tDVW]: {
      [ContractType.CA]: tDVW_Test.CA_CONTRACT_V2,
      [ContractType.TOKEN]: tDVW_Test.TOKEN_CONTRACT,
    },
  },
};

export const EXPLORE_CONFIG = {
  [SupportedChainId.mainChain]: AELF_NODES.AELF.exploreUrl,
  [SupportedChainId.sideChain]: AELF_NODES.tDVW.exploreUrl,
};
