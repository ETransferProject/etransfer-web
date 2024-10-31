import { TChainId } from '@aelf-web-login/wallet-adapter-base';

export enum AllSupportedELFChainId {
  AELF = 'AELF',
  tDVV = 'tDVV',
  tDVW = 'tDVW',
}

export const AelfChainIdList: TChainId[] = [
  AllSupportedELFChainId.AELF,
  AllSupportedELFChainId.tDVV,
  AllSupportedELFChainId.tDVW,
];

export const AelfChainNetwork: Record<TChainId, string> = {
  [AllSupportedELFChainId.AELF]: 'aelf MainChain',
  [AllSupportedELFChainId.tDVV]: 'aelf dAppChain',
  [AllSupportedELFChainId.tDVW]: 'aelf dAppChain',
};

export enum ContractType {
  CA = 'CA_CONTRACT',
  TOKEN = 'TOKEN_CONTRACT',
  ETRANSFER = 'ETRANSFER',
}

export const SynchronizingAddress = 'Synchronising data on the blockchain…';
