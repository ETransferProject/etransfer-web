import { PortkeyVersion } from 'constants/wallet';
import portkeyWalletV1 from './v1/portkeyWallet';
import portkeyWalletV2 from './v2/portkeyWallet';

export default function getPortkeyWallet(version: PortkeyVersion) {
  console.log('PortkeyWallet version: ', version);
  return version === PortkeyVersion.v1 ? portkeyWalletV1 : portkeyWalletV2;
}
