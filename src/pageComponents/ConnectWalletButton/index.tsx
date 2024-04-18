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
    await login();
  }, [login]);

  useWebLoginEvent(WebLoginEvents.ERROR, (error) => {
    console.log('WebLoginEvents', error);
  });

  useEffect(() => {
    if (loginState === WebLoginState.logined) {
      // target: replace queryAuthToken logic
      // await queryAuthToken({
      //   chainId: SupportedELFChainId.AELF,
      //   version: PortkeyVersion.v2,
      // });
      console.log('login success');
      console.log(loginState, wallet);
      const { name = '', discoverInfo } = wallet;

      dispatch(
        setV2ConnectedInfoAction({
          accounts: discoverInfo?.accounts,
          name,
          isActive: true,
        }),
      );
    }
  }, [loginState]);

  return (
    <CommonButton {...props} onClick={handleLogin}>
      Login In
    </CommonButton>
  );
}
