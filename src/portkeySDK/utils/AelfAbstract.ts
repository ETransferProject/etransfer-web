import { AELFInstances, IAelfAbstract } from 'portkeySDK/types/aelf';
import { AllSupportedELFChainId } from 'constants/chain';
import { getNodeByChainId } from 'utils/aelfBase';

abstract class AelfAbstract implements IAelfAbstract {
  public instances: AELFInstances;
  public rpcUrl?: string;
  public aelfSDK: any;

  // _options?: AelfInstanceOptionsV1
  constructor() {
    this.instances = {
      [AllSupportedELFChainId.AELF]: undefined,
      [AllSupportedELFChainId.tDVV]: undefined,
      [AllSupportedELFChainId.tDVW]: undefined,
    };
  }

  abstract setAelf(): any;

  getInstance = (chainId: AllSupportedELFChainId) => {
    if (this.instances[chainId]) {
      return this.instances[chainId];
    } else {
      const rpcUrl = getNodeByChainId(chainId).rpcUrl;
      const instance = this.aelfSDK.getAelfInstance(rpcUrl);
      this.instances[chainId] = instance;
      return instance;
    }
  };
}

export default AelfAbstract;
