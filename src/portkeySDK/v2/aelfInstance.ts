import { aelf } from '@portkey/utils';
import AelfAbstract from 'portkeySDK/utils/AelfAbstract';

class AelfInstanceV2 extends AelfAbstract {
  constructor() {
    super();
    this.aelfSDK = this.setAelf();
  }

  setAelf = () => {
    return aelf;
  };
}

const aelfInstanceV2 = new AelfInstanceV2();

export default aelfInstanceV2;
