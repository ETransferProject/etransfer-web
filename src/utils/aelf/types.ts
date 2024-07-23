import { AllSupportedELFChainId } from 'constants/chain';

export type AELFInstances = {
  [AllSupportedELFChainId.AELF]?: AelfInstanceType;
  [AllSupportedELFChainId.tDVV]?: AelfInstanceType;
  [AllSupportedELFChainId.tDVW]?: AelfInstanceType;
};

export type AelfInstanceType = { getAelfInstance: (rpcUrl: string, timeout?: number) => any };

export interface IAelfAbstract {
  instances?: AELFInstances;
  rpcUrl?: string;
  aelfSDK?: any;
  setAelf: () => any;
  getInstance: (chainId: AllSupportedELFChainId) => AelfInstanceType;
}

export type AelfInstanceOptions = {
  chainId: AllSupportedELFChainId;
};
