import React from 'react';
import CommonButton, { CommonButtonProps } from 'components/CommonButton';
import { useCallback } from 'react';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { useQueryAuthToken } from 'hooks/authToken';
import { handleWebLoginErrorMessage } from 'utils/api/error';
import singleMessage from 'components/SingleMessage';
import { LOGIN, UNLOCK } from 'constants/wallet';
import { useIsLogin } from 'hooks/wallet';

export default function ConnectWalletButton(props: CommonButtonProps) {
  const { connectWallet, isLocking } = useConnectWallet();
  const { getAuth } = useQueryAuthToken();
  const isLogin = useIsLogin();

  const handleLogin = useCallback(async () => {
    try {
      if (isLogin) {
        await getAuth();
      }
      if (!isLogin) {
        await connectWallet();
      }
    } catch (error) {
      singleMessage.error(handleWebLoginErrorMessage(error));
    }
  }, [connectWallet, getAuth, isLogin]);

  return (
    <CommonButton {...props} onClick={handleLogin}>
      {isLocking ? UNLOCK : LOGIN}
    </CommonButton>
  );
}
