import React, { useEffect } from 'react';
import CommonButton, { CommonButtonProps } from 'components/CommonButton';
import { useAppDispatch } from 'store/Provider/hooks';
import { useCallback } from 'react';
import { WebLoginState, useWebLogin, useWebLoginEvent, WebLoginEvents } from 'aelf-web-login';
import { PortkeyVersion } from 'constants/wallet';
import { setV2ConnectedInfoAction } from 'store/reducers/portkeyWallet/actions';
import { SupportedELFChainId } from 'constants/index';
import { Accounts } from '@portkey/provider-types';
import { queryAuthToken } from 'api/utils';

export default function ConnectWalletButton(props: CommonButtonProps) {
  const dispatch = useAppDispatch();
  const { login, loginState, wallet } = useWebLogin();

  const handleLogin = useCallback(async () => {
    login();
  }, [login]);

  useWebLoginEvent(WebLoginEvents.ERROR, (error) => {
    console.log('WebLoginEvents', error);
  });

  const myQueryAuthToken = useCallback(async () => {
    if (loginState === WebLoginState.logined) {
      await queryAuthToken({
        chainId: SupportedELFChainId.AELF,
        version: PortkeyVersion.v2,
      });
      console.log('login success');
      console.log(loginState, wallet);
      const { name = '', discoverInfo } = wallet;

      const chainIdList: Accounts = {};
      if (discoverInfo?.accounts.AELF) {
        chainIdList[SupportedELFChainId.AELF] = discoverInfo?.accounts.AELF;
      }
      if (discoverInfo?.accounts.tDVW) {
        chainIdList[SupportedELFChainId.tDVW] = discoverInfo?.accounts.tDVW;
      }
      dispatch(
        setV2ConnectedInfoAction({
          accounts: chainIdList,
          name,
          isActive: true,
        }),
      );
    }
  }, [dispatch, loginState, wallet]);

  useEffect(() => {
    myQueryAuthToken();
  }, [myQueryAuthToken, loginState, wallet]);

  return (
    <CommonButton {...props} onClick={handleLogin}>
      Login In
    </CommonButton>
  );
}
