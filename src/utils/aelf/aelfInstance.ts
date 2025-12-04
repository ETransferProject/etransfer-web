import { aelf } from '@portkey/utils';
import AelfAbstract from 'utils/aelf/AelfAbstract';

class AelfInstance extends AelfAbstract {
  constructor() {
    super();
    this.aelfSDK = this.setAelf();
  }

  setAelf = () => {
    return aelf;
  };
}

const aelfInstance = new AelfInstance();

export default aelfInstance;
