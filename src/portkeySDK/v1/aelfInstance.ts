import { aelf } from '@portkey-v1/utils';
import AelfAbstract from 'portkeySDK/utils/AelfAbstract';

class AelfInstanceV1 extends AelfAbstract {
  constructor() {
    super();
    this.aelfSDK = this.setAelf();
  }

  setAelf = () => {
    return aelf;
  };
}

const aelfInstanceV1 = new AelfInstanceV1();

export default aelfInstanceV1;
