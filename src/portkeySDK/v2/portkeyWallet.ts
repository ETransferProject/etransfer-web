import { PortkeyDid } from 'aelf-web-login';
import { NETWORK_TYPE_V2 } from 'constants/index';
import { PortkeyNameVersion, PortkeyVersion } from 'constants/wallet';
import PortkeyWalletAbstract from 'portkeySDK/utils/PortkeyWalletAbstract';

class PortkeyWallet extends PortkeyWalletAbstract {
  constructor() {
    super({
      version: PortkeyVersion.v2,
      providerName: PortkeyNameVersion.v2,
      matchNetworkType: NETWORK_TYPE_V2,
    });
  }

  public getPortkeyDid() {
    return PortkeyDid;
  }
}

const portkeyWalletV2 = new PortkeyWallet();

export default portkeyWalletV2;
