import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { eTransferInstance } from 'utils/etransferInstance';
import myEvents from 'utils/myEvent';
import { resetLocalJWT } from 'api/utils';
import { useQueryAuthToken } from 'hooks/authToken';
import { useRouterPush } from 'hooks/route';
import { TAelfAccounts } from 'types/wallet';
import { SupportedChainId } from 'constants/index';

export function useInitWallet() {
  const { isConnected } = useConnectWallet();

  const { getAuth } = useQueryAuthToken();
  const getAuthRef = useRef(getAuth);
  getAuthRef.current = getAuth;
  useEffect(() => {
    console.warn('>>>>>> isConnected', isConnected);
    if (!isConnected) {
      routerPushRef.current('/', true);
    } else {
      getAuthRef.current();
    }
  }, [isConnected]);

  const { queryAuth } = useQueryAuthToken();
  const routerPush = useRouterPush();
  const routerPushRef = useRef(routerPush);
  routerPushRef.current = routerPush;
  const onAuthorizationExpired = useCallback(async () => {
    if (!isConnected) {
      console.log('AuthorizationExpired: Not Logined');
      routerPushRef.current('/', false);
      return;
    }
    resetLocalJWT();
    console.log('AuthorizationExpired');
    eTransferInstance.setUnauthorized(true);
    await queryAuth();
  }, [isConnected, queryAuth]);
  const onAuthorizationExpiredRef = useRef(onAuthorizationExpired);
  onAuthorizationExpiredRef.current = onAuthorizationExpired;

  useEffect(() => {
    const { remove } = myEvents.Unauthorized.addListener(() => {
      if (eTransferInstance.unauthorized) return;
      eTransferInstance.setUnauthorized(true);
      onAuthorizationExpiredRef.current?.();
    });
    return () => {
      remove();
    };
  }, []);
}

export function useGetAccount() {
  const { isConnected, walletInfo } = useConnectWallet();

  // WalletInfo TAelfAccounts ExtraInfoForDiscover | ExtraInfoForPortkeyAA | ExtraInfoForNightElf;
  return useMemo(() => {
    if (!isConnected) return undefined;

    const accounts: TAelfAccounts = {
      [SupportedChainId.mainChain]: 'ELF_' + walletInfo?.address + '_' + SupportedChainId.mainChain,
      [SupportedChainId.sideChain]: 'ELF_' + walletInfo?.address + '_' + SupportedChainId.sideChain,
    };

    return accounts;
  }, [isConnected, walletInfo?.address]);
}
