import { ContractType } from 'constants/chain';
import * as AELF_Test from '../platform/AELF_Test';
import * as tDVW_Test from '../platform/tDVW_Test';
import { NetworkType } from '@portkey/provider-types';

export const NETWORK_TYPE: NetworkType = 'TESTNET';

export enum SupportedELFChainId {
  AELF = 'AELF',
  tDVW = 'tDVW',
}

export enum NETWORK_CHAIN {
  'MAIN' = SupportedELFChainId.AELF,
  'TEST' = SupportedELFChainId.tDVW,
}

export const CHAIN_NAME: { [chainId in SupportedELFChainId]: string } = {
  [SupportedELFChainId.AELF]: 'MainChain AELF Testnet',
  [SupportedELFChainId.tDVW]: 'SideChain tDVW Testnet',
};

export enum CHAIN_NAME_ENUM {
  'MainChain' = 'MainChain AELF',
  'SideChain' = 'SideChain tDVW',
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
    key: SupportedELFChainId.tDVW,
    label: CHAIN_NAME_ENUM.SideChain,
  },
];

export type ChainConstantsType = typeof AELF_Test | typeof tDVW_Test;

export const SupportedELFChain: { [k: string | number]: ChainConstantsType } = {
  [SupportedELFChainId.AELF]: AELF_Test,
  [SupportedELFChainId.tDVW]: tDVW_Test,
};

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

export const ETransferHost = 'https://test.etransfer.exchange';
export const WebLoginGraphqlUrl =
  'https://dapp-portkey-test.portkey.finance/Portkey_DID/PortKeyIndexerCASchema/graphql';
export const WebLoginRequestDefaultsUrl = 'https://did-portkey-test.portkey.finance';

export const ADDRESS_MAP = {
  [SupportedELFChainId.AELF]: {
    [ContractType.CA]: AELF_Test.CA_CONTRACT,
    [ContractType.TOKEN]: AELF_Test.TOKEN_CONTRACT,
    [ContractType.ETRANSFER]: AELF_Test.ETRANSFER_CONTRACT,
  },
  [SupportedELFChainId.tDVW]: {
    [ContractType.CA]: tDVW_Test.CA_CONTRACT,
    [ContractType.TOKEN]: tDVW_Test.TOKEN_CONTRACT,
    [ContractType.ETRANSFER]: tDVW_Test.ETRANSFER_CONTRACT,
  },
};
