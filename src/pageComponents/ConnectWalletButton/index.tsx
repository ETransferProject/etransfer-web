import React, { useEffect } from 'react';
import CommonButton, { CommonButtonProps } from 'components/CommonButton';
import { useAppDispatch } from 'store/Provider/hooks';
import { useCallback } from 'react';
import {
  WebLoginState,
  useWebLogin,
  useWebLoginEvent,
  WebLoginEvents,
  WalletType,
  PortkeyDid,
} from 'aelf-web-login';
import { PortkeyVersion } from 'constants/wallet';
import { setV2ConnectedInfoAction } from 'store/reducers/portkeyWallet/actions';
// import { Accounts } from '@portkey/provider-types';
import { NETWORK_CONFIG } from 'constants/loginNetwork';
import { GetCAHolderByManagerParams } from '@portkey/services';
import AElf from 'aelf-sdk';
import { AppName } from 'constants/index';
import { recoverPubKey } from 'utils/loginUtils';
import { queryAuthApi } from 'api/utils';

export default function ConnectWalletButton(props: CommonButtonProps) {
  const dispatch = useAppDispatch();
  const { login, logout, loginState, wallet, getSignature, walletType } = useWebLogin();

  const handleLogin = useCallback(async () => {
    login();
  }, [login]);

  useWebLoginEvent(WebLoginEvents.ERROR, (error) => {
    console.log('WebLoginEvents', error);
  });

  const onAccept = useCallback(async () => {
    console.log('wallet', wallet);
    let caHash = '';
    if (!wallet) return;
    if (loginState !== WebLoginState.logined) return;

    const address = wallet.address;
    // const key = `ELF_${address}_${NETWORK_CONFIG.sideChainId}`;
    let originChainId: string = NETWORK_CONFIG.sideChainId;

    if (walletType === WalletType.discover) {
      try {
        const res = await PortkeyDid.did.services.getHolderInfoByManager({
          caAddresses: [address],
        } as unknown as GetCAHolderByManagerParams);
        const caInfo = res[0];
        caHash = caInfo?.caHash || '';
        originChainId = caInfo?.chainId || NETWORK_CONFIG.sideChainId;
        console.log('caHash', caHash);
        console.log('originChainId', originChainId);
      } catch (error) {
        logout();
        console.log('getHolderInfoByManager error', error);
        return;
      }
    }

    if (walletType === WalletType.portkey) {
      caHash = wallet.portkeyInfo?.caInfo?.caHash || '';
      originChainId = wallet.portkeyInfo?.chainId || NETWORK_CONFIG.sideChainId;
    }

    try {
      const plainTextOrigin = `Nonce:${Date.now()}`;
      const plainText: any = Buffer.from(plainTextOrigin).toString('hex').replace('0x', '');
      let signInfo: string;
      if (walletType !== WalletType.portkey) {
        // nightElf or discover
        signInfo = AElf.utils.sha256(plainText);
      } else {
        // portkey sdk
        signInfo = Buffer.from(plainText).toString('hex');
      }

      const result = await getSignature({
        appName: AppName,
        address: wallet.address,
        signInfo,
      });
      if (result.error) throw result.errorMessage;
      const signature = result?.signature || '';
      const pubkey = recoverPubKey(plainText, signature) + '';

      const queryAuthApiRes = await queryAuthApi({
        pubkey,
        signature,
        plain_text: plainText,
        ca_hash: caHash,
        chain_id: originChainId,
        managerAddress: '',
        version: PortkeyVersion.v2,
      });

      console.log(queryAuthApiRes);
      setParams();
    } catch (error) {
      logout();
      console.log('queryAuthApi error', error);
      return;
    }
  }, [logout]);

  const setParams = useCallback(() => {
    if (loginState === WebLoginState.logined) {
      // target: replace queryAuthToken logic
      console.log('login success');
      console.log(loginState, wallet);
      const { name = '', discoverInfo } = wallet;
      // todo accounts depend on walletType
      dispatch(
        setV2ConnectedInfoAction({
          accounts: discoverInfo?.accounts,
          name,
          isActive: true,
        }),
      );
    }
  }, [dispatch, loginState, wallet]);

  useEffect(() => {
    console.log('loginState', loginState);
    onAccept();
  }, [loginState]);

  return (
    <CommonButton {...props} onClick={handleLogin}>
      Login In
    </CommonButton>
  );
}
