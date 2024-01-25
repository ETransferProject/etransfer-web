import { getNodeByChainId } from './aelfUtils';
import { aelf } from '@portkey/utils';
import { AllSupportedELFChainId } from 'constants/chain';

export type AELFInstancesV2 = {
  [AllSupportedELFChainId.AELF]?: AelfInstanceTypeV2;
  [AllSupportedELFChainId.tDVV]?: AelfInstanceTypeV2;
  [AllSupportedELFChainId.tDVW]?: AelfInstanceTypeV2;
};

export interface IAelfInstanceV2 {
  instances?: AELFInstancesV2;
  rpcUrl?: string;
  aelfSDK?: any;
  getInstance: (chainId: AllSupportedELFChainId) => AelfInstanceTypeV2;
}

export type AelfInstanceTypeV2 = { getAelfInstance: (rpcUrl: string, timeout?: number) => any };

export type AelfInstanceOptionsV2 = {
  chainId: AllSupportedELFChainId;
};

class AelfInstanceV2 implements IAelfInstanceV2 {
  public instances: AELFInstancesV2;
  public rpcUrl?: string;
  public aelfSDK?: any;

  constructor(_options?: AelfInstanceOptionsV2) {
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
      console.log('🌈 🌈 🌈 🌈 🌈 🌈 instance v2', instance);
      this.instances[chainId] = instance;
      return instance;
    }
  };
}

const aelfInstanceV2 = new AelfInstanceV2();

export default aelfInstanceV2;
