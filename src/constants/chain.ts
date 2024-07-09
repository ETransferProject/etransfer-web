import { ChainId } from '@portkey/types';

export enum AllSupportedELFChainId {
  AELF = 'AELF',
  tDVV = 'tDVV',
  tDVW = 'tDVW',
}

export const AelfChainIdList: ChainId[] = [
  AllSupportedELFChainId.AELF,
  AllSupportedELFChainId.tDVV,
  AllSupportedELFChainId.tDVW,
];

export enum ContractType {
  CA = 'CA_CONTRACT',
  TOKEN = 'TOKEN_CONTRACT',
}

export const SynchronizingAddress = 'Synchronising data on the blockchain…';
