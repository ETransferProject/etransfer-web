import { ContractType } from 'constants/chain';
import * as AELF from '../platform/AELF_test3';
import * as tDVV from '../platform/tDVV_test3';
import { TNetworkTypeV1, TNetworkTypeV2 } from 'types/index';
import { NetworkName } from 'constants/network';
import { PortkeyVersion } from 'constants/wallet';

export const NETWORK_NAME = NetworkName.test3 as NetworkName;

export const NETWORK_TYPE_V1: TNetworkTypeV1 = 'MAIN';
export const NETWORK_TYPE_V2: TNetworkTypeV2 = 'MAINNET';
export const connectUrl = 'https://auth-portkey-test.portkey.finance';
export const mainChainId = 'AELF';
export const sideChainId = 'tDVW';

export enum SupportedELFChainId {
  AELF = 'AELF',
  tDVV = 'tDVV',
}

export enum NETWORK_CHAIN {
  'MAIN' = SupportedELFChainId.AELF,
  'TEST' = SupportedELFChainId.tDVV,
}

export const CHAIN_NAME: { [chainId in SupportedELFChainId]: string } = {
  [SupportedELFChainId.AELF]: 'MainChain AELF',
  [SupportedELFChainId.tDVV]: 'SideChain tDVV',
};

export enum CHAIN_NAME_ENUM {
  'MainChain' = 'MainChain AELF',
  'SideChain' = 'SideChain tDVV',
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
    key: SupportedELFChainId.tDVV,
    label: CHAIN_NAME_ENUM.SideChain,
  },
];

export type ChainConstantsType = typeof AELF | typeof tDVV;

export const SupportedELFChain: { [k: string | number]: ChainConstantsType } = {
  [SupportedELFChainId.AELF]: AELF,
  [SupportedELFChainId.tDVV]: tDVV,
};

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

// test3-jenkins
export const ETransferHost = 'http://192.168.64.151:5011';
export const ETransferAuthHost = '';
export const WebLoginGraphqlUrlV1 = '/v1/graphql';
export const WebLoginGraphqlUrlV2 = '/v2/graphql';
export const WebLoginRequestDefaultsUrlV1 = 'http://192.168.66.203:5001';
export const WebLoginRequestDefaultsUrlV2 = 'http://192.168.67.127:5001';

// test3-dev
// export const ETransferHost = 'http://192.168.64.151:5011';
// export const ETransferAuthHost = '';
// export const WebLoginGraphqlUrl = '/graphql';
// export const WebLoginRequestDefaultsUrl = '';

export const ADDRESS_MAP = {
  [PortkeyVersion.v1]: {
    [SupportedELFChainId.AELF]: {
      [ContractType.CA]: AELF.CA_CONTRACT,
      [ContractType.TOKEN]: AELF.TOKEN_CONTRACT,
    },
    [SupportedELFChainId.tDVV]: {
      [ContractType.CA]: tDVV.CA_CONTRACT,
      [ContractType.TOKEN]: tDVV.TOKEN_CONTRACT,
    },
  },
  [PortkeyVersion.v2]: {
    [SupportedELFChainId.AELF]: {
      [ContractType.CA]: AELF.CA_CONTRACT_V2,
      [ContractType.TOKEN]: AELF.TOKEN_CONTRACT,
    },
    [SupportedELFChainId.tDVV]: {
      [ContractType.CA]: tDVV.CA_CONTRACT_V2,
      [ContractType.TOKEN]: tDVV.TOKEN_CONTRACT,
    },
  },
};

export const EXPLORE_CONFIG = {
  AELF: 'https://explorer-test.aelf.io/',
  TDVV: 'https://explorer-test-side02.aelf.io/',
  TDVW: 'https://explorer-test-side02.aelf.io/',
};
