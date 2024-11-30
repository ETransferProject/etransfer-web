import { SingleMessage } from '@etransfer/ui-react';
import { getLocalJWT, QueryAuthApiExtraRequestV3, queryAuthApiV3 } from 'api/utils';
import { ReCaptchaType } from 'components/GoogleRecaptcha/types';
import { useWallet } from 'context/Wallet';
import { WalletTypeEnum } from 'context/Wallet/types';
import { useCallback, useEffect, useState } from 'react';
import { useCrossChainTransfer, useLoading } from 'store/Provider/hooks';
import { checkRegistration } from 'utils/api/user';
import googleReCaptchaModal from 'utils/modal/googleReCaptchaModal';
import myEvents from 'utils/myEvent';
import {
  getCaHashAndOriginChainIdByWallet,
  getManagerAddressByWallet,
  getWalletSourceType,
} from 'utils/wallet';
import useAelf from './useAelf';
import { WalletTypeEnum as AelfWalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { WalletInfo } from 'types/wallet';
import { AuthTokenSource } from 'types/api';
import { stringToHex } from 'utils/format';
import useEVM from './useEVM';
import useSolana from './useSolana';
import useTON from './useTON';
import useTRON from './useTRON';

export function useAuthToken() {
  const { fromWalletType } = useCrossChainTransfer();
  const [{ fromWallet }] = useWallet();
  const { setLoading } = useLoading();

  const [isReCaptchaLoading, setIsReCaptchaLoading] = useState(true);
  useEffect(() => {
    const { remove } = myEvents.GoogleReCaptcha.addListener((res) => {
      if (res === 'onLoad') {
        setIsReCaptchaLoading(false);
      }
    });
    return () => {
      remove();
    };
  }, [setLoading]);

  const handleReCaptcha = useCallback(async (): Promise<string | undefined> => {
    if (!fromWallet?.account || !fromWalletType) return undefined;
    const walletSourceType = getWalletSourceType(fromWalletType);
    if (!walletSourceType || fromWalletType === WalletTypeEnum.AELF) {
      return undefined;
    }

    const isRegistered = await checkRegistration({
      address: fromWallet?.account,
      sourceType: walletSourceType,
    });
    if (!isRegistered.result) {
      // change loading text
      if (isReCaptchaLoading) setLoading(true, { text: 'Captcha Human Verification Loading' });

      const result = await googleReCaptchaModal();
      if (result.type === ReCaptchaType.success) {
        return result.data;
      }
    }

    return undefined;
  }, [fromWallet?.account, fromWalletType, isReCaptchaLoading, setLoading]);

  const queryAuthToken = useCallback(
    async (isThrowError: boolean) => {
      if (!fromWallet?.isConnected) return '';

      try {
        setLoading(true);
        const recaptchaResult = await handleReCaptcha();

        const signatureResult = await fromWallet.signMessage();
        console.log('>>>>>> getAuthToken signatureResult', signatureResult);
        if (fromWallet.walletType !== WalletTypeEnum.TON && !signatureResult.signature) {
          throw Error('Signature error');
        }

        const apiParams: QueryAuthApiExtraRequestV3 = {
          pubkey: signatureResult.publicKey,
          signature: signatureResult.signature,
          plain_text: signatureResult.plainTextHex,
          sourceType: signatureResult.sourceType,
          recaptchaToken: recaptchaResult || undefined,
        };
        return await queryAuthApiV3(apiParams);
      } catch (error: any) {
        if (
          error?.type === ReCaptchaType.cancel ||
          error?.type === ReCaptchaType.error ||
          error?.type === ReCaptchaType.expire
        ) {
          SingleMessage.error(error?.data);
        }
        if (isThrowError) throw error;
        return '';
      }
    },
    [fromWallet, handleReCaptcha, setLoading],
  );

  const getAuthToken = useCallback(
    async (isThrowError: boolean) => {
      try {
        if (!fromWallet?.account || !fromWallet?.walletType) return '';

        // 1: local storage has JWT token
        const key = stringToHex(fromWallet?.account) + getWalletSourceType(fromWallet?.walletType);
        const data = getLocalJWT(key);
        if (data) {
          const token_type = data.token_type;
          const access_token = data.access_token;

          return `${token_type} ${access_token}`;
        } else {
          // 2: local storage don not has JWT token
          return await queryAuthToken(isThrowError);
        }
      } catch (error) {
        console.log('getAuth error:', error);
        if (isThrowError) throw error;
        return '';
      }
    },
    [fromWallet?.account, fromWallet?.walletType, queryAuthToken],
  );

  return {
    getAuthToken,
    queryAuthToken,
  };
}

export function useGetAuthTokenFromStorage() {
  const { isConnected: isAelfConnected, connector: aelfConnector, walletInfo } = useAelf();
  const [{ fromWallet }] = useWallet();

  return useCallback(
    async (walletType?: WalletTypeEnum): Promise<string> => {
      if (!walletType) return '';

      if (walletType === WalletTypeEnum.AELF) {
        if (isAelfConnected) {
          const { caHash } = await getCaHashAndOriginChainIdByWallet(
            walletInfo as WalletInfo,
            aelfConnector,
          );
          const managerAddress = await getManagerAddressByWallet(
            walletInfo as WalletInfo,
            aelfConnector,
          );
          const source =
            aelfConnector === AelfWalletTypeEnum.elf
              ? AuthTokenSource.NightElf
              : AuthTokenSource.Portkey;
          const key = (caHash || source) + managerAddress;
          const data = getLocalJWT(key);
          // 1: local storage has JWT token
          if (data) {
            const token_type = data.token_type;
            const access_token = data.access_token;
            return `${token_type} ${access_token}`;
          }
        }
      } else {
        if (
          fromWallet &&
          fromWallet?.isConnected &&
          fromWallet?.account &&
          fromWallet?.walletType &&
          fromWallet?.walletType === walletType
        ) {
          // get JWT token from local storage
          const key =
            stringToHex(fromWallet?.account) + getWalletSourceType(fromWallet?.walletType);
          const data = getLocalJWT(key);
          if (data) {
            const token_type = data.token_type;
            const access_token = data.access_token;

            return `${token_type} ${access_token}`;
          }
        }
      }

      return '';
    },
    [aelfConnector, fromWallet, isAelfConnected, walletInfo],
  );
}

export function useGetAnyoneAuthTokenFromStorage() {
  const { queryAuthToken } = useAuthToken();
  const getAuthTokenFromStorage = useGetAuthTokenFromStorage();
  const [{ fromWallet }] = useWallet();
  const { isConnected: isEVMConnected, account: evmAccount, walletType: evmWalletType } = useEVM();
  const {
    isConnected: isSolanaConnected,
    account: solanaAccount,
    walletType: solanaWalletType,
  } = useSolana();
  const { isConnected: isTONConnected, account: tonAccount, walletType: tonWalletType } = useTON();
  const {
    isConnected: isTRONConnected,
    account: tronAccount,
    walletType: tronWalletType,
  } = useTRON();

  const getStorageToken = useCallback((account: string, walletType: WalletTypeEnum) => {
    const key = stringToHex(account) + getWalletSourceType(walletType);
    const data = getLocalJWT(key);
    if (data) {
      const token_type = data.token_type;
      const access_token = data.access_token;

      return `${token_type} ${access_token}`;
    }
    return '';
  }, []);

  return useCallback(async () => {
    let authToken = '';

    // 1. has connected wallet, and has auth token in storage
    if (isEVMConnected && evmAccount && evmWalletType) {
      authToken = getStorageToken(evmAccount, evmWalletType);
      if (authToken) return authToken;
    }
    if (isSolanaConnected && solanaAccount && solanaWalletType) {
      authToken = getStorageToken(solanaAccount, solanaWalletType);
      if (authToken) return authToken;
    }
    if (isTONConnected && tonAccount && tonWalletType) {
      authToken = getStorageToken(tonAccount, tonWalletType);
      if (authToken) return authToken;
    }
    if (isTRONConnected && tronAccount && tronWalletType) {
      authToken = getStorageToken(tronAccount, tronWalletType);
      if (authToken) return authToken;
    }
    authToken = await getAuthTokenFromStorage(WalletTypeEnum.AELF);
    if (authToken) return authToken;

    // 2. has fromWallet, but not auth token in storage, get new auth token.
    if (fromWallet?.isConnected && fromWallet?.account) {
      authToken = await queryAuthToken(true);
    }

    // 3. not connected wallet, need click 'Connect Wallet' button to connect wallet
    return authToken;
  }, [
    evmAccount,
    evmWalletType,
    fromWallet?.account,
    fromWallet?.isConnected,
    getAuthTokenFromStorage,
    getStorageToken,
    isEVMConnected,
    isSolanaConnected,
    isTONConnected,
    isTRONConnected,
    queryAuthToken,
    solanaAccount,
    solanaWalletType,
    tonAccount,
    tonWalletType,
    tronAccount,
    tronWalletType,
  ]);
}
