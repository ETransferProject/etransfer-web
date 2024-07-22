import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { eTransferInstance } from 'utils/etransferInstance';
import myEvents from 'utils/myEvent';
import { resetLocalJWT } from 'api/utils';
import { useQueryAuthToken } from 'hooks/authToken';
import { useRouterPush } from 'hooks/route';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { ExtraInfoForDiscover, ExtraInfoForPortkeyAA, TAelfAccounts } from 'types/wallet';
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
  const { isConnected, walletInfo, walletType } = useConnectWallet();

  // WalletInfo TAelfAccounts ExtraInfoForDiscover | ExtraInfoForPortkeyAA | ExtraInfoForNightElf;
  return useMemo(() => {
    if (!isConnected) return undefined;

    let accounts: TAelfAccounts = {};
    let info;
    switch (walletType) {
      case WalletTypeEnum.aa:
        info = walletInfo?.extraInfo as ExtraInfoForPortkeyAA;
        accounts = info.portkeyInfo.accounts;
        break;

      case WalletTypeEnum.discover:
        info = walletInfo?.extraInfo as ExtraInfoForDiscover;
        if (info.accounts[SupportedChainId.mainChain]?.[0]) {
          accounts[SupportedChainId.mainChain] =
            'ELF_' +
            info.accounts[SupportedChainId.mainChain]?.[0] +
            '_' +
            SupportedChainId.mainChain;
        }

        if (info.accounts[SupportedChainId.sideChain]?.[0]) {
          accounts[SupportedChainId.sideChain] =
            'ELF_' +
            info.accounts[SupportedChainId.sideChain]?.[0] +
            '_' +
            SupportedChainId.sideChain;
        }
        break;

      default:
        accounts[SupportedChainId.mainChain] =
          'ELF_' + walletInfo?.address + '_' + SupportedChainId.mainChain;
        accounts[SupportedChainId.sideChain] =
          'ELF_' + walletInfo?.address + '_' + SupportedChainId.sideChain;

        break;
    }

    return accounts;
  }, [isConnected, walletInfo?.address, walletInfo?.extraInfo, walletType]);
}
