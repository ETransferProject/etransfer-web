import { ContractType } from 'constants/chain';
import * as AELF from '../platform/AELF_test3';
import * as tDVV from '../platform/tDVV_test3';
import { NetworkType } from '@portkey/provider-types';

export const NETWORK_TYPE: NetworkType = 'MAIN';

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

export interface ChainNameItem {
  key: SupportedELFChainId;
  label: CHAIN_NAME_ENUM;
}

export const CHAIN_LIST: ChainNameItem[] = [
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

export const ETransferHost = 'http://192.168.64.151:'; // TODO
export const WebLoginGraphqlUrl =
  'http://192.168.66.203:8083/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql';
export const WebLoginRequestDefaultsUrl = 'http://192.168.66.203:5001';

export const ADDRESS_MAP = {
  [SupportedELFChainId.AELF]: {
    [ContractType.CA]: AELF.CA_CONTRACT,
    [ContractType.TOKEN]: AELF.TOKEN_CONTRACT,
    [ContractType.ETRANSFER]: AELF.ETRANSFER_CONTRACT,
  },
  [SupportedELFChainId.tDVV]: {
    [ContractType.CA]: tDVV.CA_CONTRACT,
    [ContractType.TOKEN]: tDVV.TOKEN_CONTRACT,
    [ContractType.ETRANSFER]: tDVV.ETRANSFER_CONTRACT,
  },
};
