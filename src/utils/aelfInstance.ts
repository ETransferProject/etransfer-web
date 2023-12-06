import { getNodeByChainId } from './aelfUtils';
import { aelf } from '@portkey/utils';
import { AllSupportedELFChainId } from 'constants/chain';

export type AELFInstances = {
  [AllSupportedELFChainId.AELF]?: AelfInstanceType;
  [AllSupportedELFChainId.tDVV]?: AelfInstanceType;
  [AllSupportedELFChainId.tDVW]?: AelfInstanceType;
};

export interface IAelfInstance {
  instances?: AELFInstances;
  rpcUrl?: string;
  aelfSDK?: any;
  getInstance: (chainId: AllSupportedELFChainId) => AelfInstanceType;
}

export type AelfInstanceType = { getAelfInstance: (rpcUrl: string, timeout?: number) => any };

export type AelfInstanceOptions = {
  chainId: AllSupportedELFChainId;
};

class AelfInstance implements IAelfInstance {
  public instances: AELFInstances;
  public rpcUrl?: string;
  public aelfSDK?: any;

  constructor(_options?: AelfInstanceOptions) {
    this.instances = {
      [AllSupportedELFChainId.AELF]: undefined,
      [AllSupportedELFChainId.tDVV]: undefined,
      [AllSupportedELFChainId.tDVW]: undefined,
    };
  }

  getInstance = (chainId: AllSupportedELFChainId) => {
    if (this.instances[chainId]) {
      return this.instances[chainId];
    } else {
      const rpcUrl = getNodeByChainId(chainId).rpcUrl;
      const instance = aelf.getAelfInstance(rpcUrl);
      console.log('🌈 🌈 🌈 🌈 🌈 🌈 instance', instance);
      this.instances[chainId] = instance;
      return instance;
    }
  };
}

const aelfInstance = new AelfInstance();

export default aelfInstance;
