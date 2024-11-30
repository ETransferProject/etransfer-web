import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { WalletTypeEnum as AelfWalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { WalletTypeEnum } from 'context/Wallet/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { eTransferInstance } from 'utils/etransferInstance';
import myEvents from 'utils/myEvent';
import { useAelfAuthToken } from 'hooks/wallet/aelfAuthToken';
import { TAelfAccounts, WalletInfo } from 'types/wallet';
import { SupportedChainId } from 'constants/index';
import { handleWebLoginErrorMessage } from 'utils/api/error';
import { SingleMessage } from '@etransfer/ui-react';
import { useEffectOnce } from 'react-use';
import { getCaHashAndOriginChainIdByWallet, getManagerAddressByWallet } from 'utils/wallet';
import { AuthTokenSource } from 'types/api';
import { removeOneLocalJWT } from 'api/utils';
import { useLoading } from 'store/Provider/hooks';

export default function useAelf() {
  const {
    walletInfo,
    walletType,
    isConnected,
    connecting,
    connectWallet,
    disConnectWallet,
    getSignature,
    ...props
  } = useConnectWallet();

  const aelfContext = useMemo(() => {
    return {
      ...props,
      isConnecting: connecting,
      isConnected: isConnected && !!walletInfo,
      walletType: WalletTypeEnum.AELF,
      walletInfo: walletInfo,
      provider: walletInfo?.extraInfo?.provider,
      account: walletInfo?.address,
      accounts: [walletInfo?.address],
      connector: walletType,
      connect: connectWallet,
      disconnect: async () => await disConnectWallet(),
      getAccountInfo: () => walletInfo?.extraInfo,
      signMessage: getSignature,
    };
  }, [
    connectWallet,
    connecting,
    disConnectWallet,
    getSignature,
    isConnected,
    props,
    walletInfo,
    walletType,
  ]);

  return aelfContext;
}

export function useInitWallet() {
  const { setLoading } = useLoading();
  const { isConnected, walletInfo, walletType } = useConnectWallet();

  const { queryAuth } = useAelfAuthToken();
  // const getAuthRef = useRef(getAuth);
  // getAuthRef.current = getAuth;

  // useEffect(() => {
  //   console.warn('>>>>>> isConnected', isConnected);
  //   console.warn('>>>>>> walletInfo', walletInfo);
  //   if (isConnected && walletInfo) {
  //     getAuthRef.current(false, true);
  //   }
  // }, [isConnected, walletInfo]);

  const onAuthorizationExpired = useCallback(async () => {
    if (!isConnected) {
      console.warn('AuthorizationExpired: Not Logined');
      eTransferInstance.setUnauthorized(false);
      return;
    } else if (isConnected && walletInfo) {
      const { caHash } = await getCaHashAndOriginChainIdByWallet(
        walletInfo as WalletInfo,
        walletType,
      );
      const managerAddress = await getManagerAddressByWallet(walletInfo as WalletInfo, walletType);
      const source =
        walletType === AelfWalletTypeEnum.elf ? AuthTokenSource.NightElf : AuthTokenSource.Portkey;
      const key = (caHash || source) + managerAddress;
      removeOneLocalJWT(key);

      console.log('AuthorizationExpired');
      eTransferInstance.setUnauthorized(true);
      await queryAuth(false, true);
    } else {
      eTransferInstance.setUnauthorized(false);
    }
    setLoading(false);
  }, [isConnected, queryAuth, setLoading, walletInfo, walletType]);
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

export function useLogin() {
  const { connectWallet } = useConnectWallet();
  const { isConnected } = useAelf();

  return useCallback(async () => {
    if (isConnected) return;

    try {
      await connectWallet();
    } catch (error) {
      SingleMessage.error(handleWebLoginErrorMessage(error));
    }
  }, [connectWallet, isConnected]);
}

export function useGetAccount() {
  const { walletInfo } = useConnectWallet();
  const { isConnected } = useAelf();

  // WalletInfo TAelfAccounts ExtraInfoForDiscover | ExtraInfoForPortkeyAA | ExtraInfoForNightElf;
  return useMemo(() => {
    if (!isConnected) return undefined;

    const accounts: TAelfAccounts = {
      [SupportedChainId.mainChain]: 'ELF_' + walletInfo?.address + '_' + SupportedChainId.mainChain,
      [SupportedChainId.sideChain]: 'ELF_' + walletInfo?.address + '_' + SupportedChainId.sideChain,
    };

    return accounts;
  }, [isConnected, walletInfo]);
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
