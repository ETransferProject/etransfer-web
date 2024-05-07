import React, { useEffect } from 'react';
import CommonButton, { CommonButtonProps } from 'components/CommonButton';
import { useCallback } from 'react';
import { WebLoginState, useWebLogin } from 'aelf-web-login';

import { useQueryAuthToken } from 'hooks/authToken';

export default function ConnectWalletButton(props: CommonButtonProps) {
  const { login, loginState } = useWebLogin();
  const { onAccept } = useQueryAuthToken();

  useEffect(() => {
    console.log('loginState', loginState);
    onAccept();
    // Ignore the impact of the change in onAccept, just watch loginState change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginState]);

  const handleLogin = useCallback(async () => {
    if (loginState === WebLoginState.logining) return;
    if (loginState === WebLoginState.logined) {
      onAccept();
    }
    if (loginState === WebLoginState.initial || loginState === WebLoginState.lock) {
      login();
    }
  }, [login, loginState, onAccept]);

  return (
    <CommonButton {...props} onClick={handleLogin}>
      Log In
    </CommonButton>
  );
}
