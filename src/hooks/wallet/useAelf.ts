import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { WalletTypeEnum as AelfWalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { IGetAelfBalanceRequest, IGetBalanceResult, WalletTypeEnum } from 'context/Wallet/types';
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
import { useSetWalletType } from 'hooks/crossChainTransfer';
import { getBalance as getAelfBalance } from 'utils/contract';

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

  const onGetBalance = useCallback(
    async ({
      tokenSymbol,
      chainId,
      address,
    }: IGetAelfBalanceRequest): Promise<IGetBalanceResult> => {
      const res = await getAelfBalance({ symbol: tokenSymbol, chainId, caAddress: address });
      return { value: res };
    },
    [],
  );
  const isConnectedTransform = useMemo(
    () => isConnected && !!walletInfo,
    [isConnected, walletInfo],
  );

  // WalletInfo TAelfAccounts ExtraInfoForDiscover | ExtraInfoForPortkeyAA | ExtraInfoForNightElf;
  const accounts = useMemo(() => {
    if (!isConnectedTransform) return undefined;

    const accounts: TAelfAccounts = {
      [SupportedChainId.mainChain]: 'ELF_' + walletInfo?.address + '_' + SupportedChainId.mainChain,
      [SupportedChainId.sideChain]: 'ELF_' + walletInfo?.address + '_' + SupportedChainId.sideChain,
    };

    return accounts;
  }, [isConnectedTransform, walletInfo]);

  const aelfContext = useMemo(() => {
    return {
      ...props,
      isConnecting: connecting,
      isConnected: isConnectedTransform,
      walletType: WalletTypeEnum.AELF,
      walletInfo: walletInfo,
      provider: walletInfo?.extraInfo?.provider,
      account: walletInfo?.address,
      accounts: accounts,
      connector: walletType,
      connect: connectWallet,
      disconnect: async () => await disConnectWallet(),
      getAccountInfo: () => walletInfo?.extraInfo,
      signMessage: getSignature,
      getBalance: onGetBalance,
      // sendTransaction: null,
    };
  }, [
    accounts,
    connectWallet,
    connecting,
    disConnectWallet,
    getSignature,
    isConnectedTransform,
    onGetBalance,
    props,
    walletInfo,
    walletType,
  ]);

  return aelfContext;
}

export function useInitAelfWallet() {
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

export function useAelfLogin() {
  const { connectWallet } = useConnectWallet();
  const { isConnected } = useAelf();
  const setWalletType = useSetWalletType();
  const { setLoading } = useLoading();

  const { getAuth } = useAelfAuthToken();
  const getAuthRef = useRef(getAuth);
  getAuthRef.current = getAuth;

  return useCallback(
    async (
      isNeedGetJWT = false,
      handleConnectedCallback?: () => Promise<void> | void,
      isStopLoading = false,
    ) => {
      try {
        if (isConnected) {
          setWalletType(WalletTypeEnum.AELF);
          if (isNeedGetJWT) {
            await getAuthRef.current(true, false);
          }
          await handleConnectedCallback?.();
          return;
        }
        if (isStopLoading) {
          setLoading(false);
        }
        await connectWallet();
        setWalletType(WalletTypeEnum.AELF);
        if (isNeedGetJWT) {
          await getAuthRef.current(true, false);
        }
        await handleConnectedCallback?.();
      } catch (error) {
        SingleMessage.error(handleWebLoginErrorMessage(error));
      } finally {
        setLoading(false);
      }
    },
    [connectWallet, isConnected, setLoading, setWalletType],
  );
}

export function useGetAelfAccount() {
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
