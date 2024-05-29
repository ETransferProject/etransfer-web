import { SupportedELFChainId } from 'constants/index';
import getPortkeyWallet from 'portkeySDK/portkeyWallet';
import AElf from 'aelf-sdk';
import service from '../../api/axios';
import { PortkeyVersion } from 'constants/wallet';
import { getLocalJWT, queryAuthApi } from 'api/utils';
import { AuthTokenSource } from 'types/api';

export const queryAuthToken = async ({
  chainId,
  version,
}: {
  chainId: SupportedELFChainId;
  version: PortkeyVersion;
}) => {
  const portkeyWallet = getPortkeyWallet(version);
  const managerAddress = await portkeyWallet.getManagerAddress();
  const caHash = await portkeyWallet.getCaHash();

  const key = caHash + managerAddress;
  const localData = getLocalJWT(key);

  if (localData) {
    service.defaults.headers.common[
      'Authorization'
    ] = `${localData.token_type} ${localData.access_token}`;
    return `${localData.token_type} ${localData.access_token}`;
  }

  const plainText = `Nonce:${Date.now()}`;
  const plainTextHex = Buffer.from(plainText).toString('hex');

  const { pubKey, signatureStr } = await portkeyWallet.getManagerPublicKey(
    AElf.utils.sha256(plainTextHex),
  );
  if (!pubKey || !signatureStr) return;
  if (!caHash) return;

  return queryAuthApi({
    pubkey: pubKey,
    signature: signatureStr,
    plain_text: plainTextHex,
    ca_hash: caHash,
    chain_id: chainId,
    managerAddress,
    version: version,
    source: AuthTokenSource.Portkey,
  });
};
