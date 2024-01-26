import { PortkeyVersion } from 'constants/index';
import portkeyWalletV1 from './portkeyWalletV1';
import portkeyWalletV2 from './portkeyWalletV2';

export default function getPortkeyWallet(version?: PortkeyVersion) {
  console.log('PortkeyWallet version: ', version);
  return version === PortkeyVersion.v1 ? portkeyWalletV1 : portkeyWalletV2;
}
