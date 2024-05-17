import React from 'react';
import CommonButton, { CommonButtonProps } from 'components/CommonButton';
import { useCallback } from 'react';
import { WebLoginState, useWebLogin } from 'aelf-web-login';
import { useQueryAuthToken } from 'hooks/authToken';

export default function ConnectWalletButton(props: CommonButtonProps) {
  const { login, loginState } = useWebLogin();
  const { getAuth } = useQueryAuthToken();

  const handleLogin = useCallback(async () => {
    if (loginState === WebLoginState.logining) return;
    if (loginState === WebLoginState.logined) {
      getAuth();
    }
    if (loginState === WebLoginState.initial || loginState === WebLoginState.lock) {
      login();
    }
  }, [getAuth, login, loginState]);

  return (
    <CommonButton {...props} onClick={handleLogin}>
      Log In
    </CommonButton>
  );
}
