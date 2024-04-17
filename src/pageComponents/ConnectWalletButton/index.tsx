import React from 'react';
import CommonButton, { CommonButtonProps } from 'components/CommonButton';
import { useAppDispatch } from 'store/Provider/hooks';
import { useCallback } from 'react';
import { WebLoginState, useWebLogin, useWebLoginEvent, WebLoginEvents } from 'aelf-web-login';
import { PortkeyVersion } from 'constants/wallet';
import { setSwitchVersionAction } from 'store/reducers/common/slice';

export default function ConnectWalletButton(props: CommonButtonProps) {
  const dispatch = useAppDispatch();
  const { login, loginState } = useWebLogin();

  const handleLogin = useCallback(() => {
    login();
  }, [login]);

  useWebLoginEvent(WebLoginEvents.ERROR, (error) => {
    console.log('WebLoginEvents', error);
  });

  useWebLoginEvent(WebLoginEvents.LOGINED, () => {
    console.log(loginState);
    if (WebLoginState.logined === loginState) {
      console.log('login success');
      // todo: set active currentVersion ...
      dispatch(setSwitchVersionAction(PortkeyVersion.v2));
    }
  });

  return (
    <CommonButton {...props} onClick={handleLogin}>
      Login In
    </CommonButton>
  );
}
