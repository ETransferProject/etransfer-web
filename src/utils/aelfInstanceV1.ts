import { getNodeByChainId } from './aelfUtils';
import { aelf } from '@portkey-v1/utils';
import { AllSupportedELFChainId } from 'constants/chain';

export type AELFInstancesV1 = {
  [AllSupportedELFChainId.AELF]?: AelfInstanceTypeV1;
  [AllSupportedELFChainId.tDVV]?: AelfInstanceTypeV1;
  [AllSupportedELFChainId.tDVW]?: AelfInstanceTypeV1;
};

export interface IAelfInstanceV1 {
  instances?: AELFInstancesV1;
  rpcUrl?: string;
  aelfSDK?: any;
  getInstance: (chainId: AllSupportedELFChainId) => AelfInstanceTypeV1;
}

export type AelfInstanceTypeV1 = { getAelfInstance: (rpcUrl: string, timeout?: number) => any };

export type AelfInstanceOptionsV1 = {
  chainId: AllSupportedELFChainId;
};

class AelfInstanceV1 implements IAelfInstanceV1 {
  public instances: AELFInstancesV1;
  public rpcUrl?: string;
  public aelfSDK?: any;

  // _options?: AelfInstanceOptionsV1
  constructor() {
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
      this.instances[chainId] = instance;
      return instance;
    }
  };
}

const aelfInstanceV1 = new AelfInstanceV1();

export default aelfInstanceV1;
