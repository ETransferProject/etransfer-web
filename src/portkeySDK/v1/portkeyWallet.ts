import { PortkeyDidV1 } from 'aelf-web-login';
import { NETWORK_TYPE_V1 } from 'constants/index';
import { PortkeyNameVersion, PortkeyVersion } from 'constants/wallet';
import PortkeyWalletAbstract from 'portkeySDK/utils/PortkeyWalletAbstract';

class PortkeyWallet extends PortkeyWalletAbstract {
  constructor() {
    super({
      version: PortkeyVersion.v1,
      providerName: PortkeyNameVersion.v1,
      matchNetworkType: NETWORK_TYPE_V1,
    });
  }

  public getPortkeyDid() {
    return PortkeyDidV1;
  }
}

const portkeyWalletV1 = new PortkeyWallet();

export default portkeyWalletV1;
