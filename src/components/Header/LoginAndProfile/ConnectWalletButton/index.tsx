import React from 'react';
import CommonButton, { CommonButtonProps } from 'components/CommonButton';
import { useCallback } from 'react';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { useQueryAuthToken } from 'hooks/authToken';
import { handleWebLoginErrorMessage } from 'utils/api/error';
import singleMessage from 'components/SingleMessage';
import { LOGIN } from 'constants/wallet';

export default function ConnectWalletButton(props: CommonButtonProps) {
  const { connectWallet, isConnected } = useConnectWallet();
  const { getAuth } = useQueryAuthToken();

  const handleLogin = useCallback(async () => {
    try {
      if (isConnected) {
        await getAuth();
      }
      if (!isConnected) {
        await connectWallet();
      }
    } catch (error) {
      singleMessage.error(handleWebLoginErrorMessage(error));
    }
  }, [connectWallet, getAuth, isConnected]);

  return (
    <CommonButton {...props} onClick={handleLogin}>
      {LOGIN}
    </CommonButton>
  );
}
