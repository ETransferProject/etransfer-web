import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { eTransferInstance } from 'utils/etransferInstance';
import myEvents from 'utils/myEvent';
import { resetLocalJWT } from 'api/utils';
import { useQueryAuthToken } from 'hooks/authToken';
import { TAelfAccounts } from 'types/wallet';
import { SupportedChainId } from 'constants/index';
import { handleWebLoginErrorMessage } from 'utils/api/error';
import { SingleMessage } from '@etransfer/ui-react';
import { useEffectOnce } from 'react-use';

export function useInitWallet() {
  const { isConnected, walletInfo } = useConnectWallet();

  const { getAuth } = useQueryAuthToken();
  const getAuthRef = useRef(getAuth);
  getAuthRef.current = getAuth;
  useEffect(() => {
    console.warn('>>>>>> isConnected', isConnected);
    console.warn('>>>>>> walletInfo', walletInfo);
    if (isConnected && walletInfo) {
      getAuthRef.current();
    }
  }, [isConnected, walletInfo]);

  const { queryAuth } = useQueryAuthToken();
  const onAuthorizationExpired = useCallback(async () => {
    if (!isConnected) {
      console.warn('AuthorizationExpired: Not Logined');
      eTransferInstance.setUnauthorized(false);
      return;
    } else if (isConnected && walletInfo) {
      resetLocalJWT();
      console.log('AuthorizationExpired');
      eTransferInstance.setUnauthorized(true);
      await queryAuth();
    } else {
      eTransferInstance.setUnauthorized(false);
    }
  }, [isConnected, queryAuth, walletInfo]);
  const onAuthorizationExpiredRef = useRef(onAuthorizationExpired);
  onAuthorizationExpiredRef.current = onAuthorizationExpired;

  useEffect(() => {
    const { remove } = myEvents.Unauthorized.addListener(() => {
      console.log('Unauthorized listener', eTransferInstance.unauthorized);
      if (eTransferInstance.unauthorized) return;
      eTransferInstance.setUnauthorized(true);
      onAuthorizationExpiredRef.current?.();
    });
    return () => {
      remove();
    };
  }, []);
}

export function useIsLogin() {
  const { isConnected, walletInfo } = useConnectWallet();
  return useMemo(() => isConnected && !!walletInfo, [isConnected, walletInfo]);
}

export function useLogin() {
  const { connectWallet } = useConnectWallet();
  const isLogin = useIsLogin();

  return useCallback(async () => {
    if (isLogin) return;

    try {
      await connectWallet();
    } catch (error) {
      SingleMessage.error(handleWebLoginErrorMessage(error));
    }
  }, [connectWallet, isLogin]);
}

export function useGetAccount() {
  const { walletInfo } = useConnectWallet();
  const isLogin = useIsLogin();

  // WalletInfo TAelfAccounts ExtraInfoForDiscover | ExtraInfoForPortkeyAA | ExtraInfoForNightElf;
  return useMemo(() => {
    if (!isLogin) return undefined;

    const accounts: TAelfAccounts = {
      [SupportedChainId.mainChain]: 'ELF_' + walletInfo?.address + '_' + SupportedChainId.mainChain,
      [SupportedChainId.sideChain]: 'ELF_' + walletInfo?.address + '_' + SupportedChainId.sideChain,
    };

    return accounts;
  }, [isLogin, walletInfo]);
}

export function useShowLoginButtonLoading() {
  const { isConnected, walletInfo } = useConnectWallet();
  const [loading, setLoading] = useState<boolean>(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stopLoading = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setLoading(false);
      timerRef.current = null;
    }, 3000);
  }, []);

  useEffectOnce(() => {
    if (isConnected && !walletInfo) {
      stopLoading();
    } else {
      setLoading(false);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  });

  return loading;
}
