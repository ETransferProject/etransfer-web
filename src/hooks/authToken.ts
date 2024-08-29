import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { QueryAuthApiExtraRequest, getLocalJWT, queryAuthApi } from 'api/utils';
import { APP_NAME } from 'constants/index';
import { PortkeyVersion } from 'constants/wallet';
import { useCallback, useEffect, useState } from 'react';
import { useLoading } from 'store/Provider/hooks';
import AElf from 'aelf-sdk';
import { recoverPubKey } from 'utils/aelf/aelfBase';
import { useDebounceCallback } from 'hooks/debounce';
import service from 'api/axios';
import { eTransferInstance } from 'utils/etransferInstance';
import { getCaHashAndOriginChainIdByWallet, getManagerAddressByWallet } from 'utils/wallet';
import { AuthTokenSource } from 'types/api';
import { ReCaptchaType } from 'components/GoogleRecaptcha/types';
import { checkEOARegistration } from 'utils/api/user';
import myEvents from 'utils/myEvent';
import googleReCaptchaModal from 'utils/modal/googleReCaptchaModal';
import { SingleMessage } from '@etransfer/ui-react';
import { WalletInfo } from 'types/wallet';
import { useIsLogin } from './wallet';

export function useQueryAuthToken() {
  const { getSignature, walletType, walletInfo, disConnectWallet } = useConnectWallet();
  const isLogin = useIsLogin();
  const { setLoading } = useLoading();

  const loginSuccessActive = useCallback(() => {
    console.log('%c login success and emit event', 'color: green');
    myEvents.LoginSuccess.emit();
    // TODO websocket open
  }, []);

  const handleGetSignature = useCallback(async () => {
    if (!walletInfo) return;
    const plainTextOrigin = `Nonce:${Date.now()}`;
    const plainText: any = Buffer.from(plainTextOrigin).toString('hex').replace('0x', '');
    let signInfo: string;
    if (walletType !== WalletTypeEnum.aa) {
      // nightElf or discover
      signInfo = AElf.utils.sha256(plainText);
    } else {
      // portkey sdk
      signInfo = Buffer.from(plainText).toString('hex');
    }
    console.log('getSignature');
    const result = await getSignature({
      appName: APP_NAME,
      address: walletInfo.address,
      signInfo,
    });
    if (result?.error) throw result.errorMessage;

    return { signature: result?.signature || '', plainText };
  }, [getSignature, walletInfo, walletType]);

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
    if (!walletInfo) return;
    if (walletType === WalletTypeEnum.elf) {
      const isRegistered = await checkEOARegistration({ address: walletInfo.address });
      if (!isRegistered.result) {
        // change loading text
        if (isReCaptchaLoading) setLoading(true, { text: 'Captcha Human Verification Loading' });

        const result = await googleReCaptchaModal();
        if (result.type === ReCaptchaType.success) {
          return result.data;
        }
      }
    }
    return undefined;
  }, [isReCaptchaLoading, setLoading, walletInfo, walletType]);

  const queryAuth = useCallback(async () => {
    if (!isLogin) return;
    if (eTransferInstance.obtainingSignature) return;
    try {
      // Mark: only one signature process can be performed at the same time
      eTransferInstance.setObtainingSignature(true);
      setLoading(true);
      const recaptchaResult = await handleReCaptcha();
      setLoading(true); // to change loading text = 'Loading...'
      const { caHash, originChainId } = await getCaHashAndOriginChainIdByWallet(
        walletInfo as WalletInfo,
        walletType,
      );
      const signatureResult = await handleGetSignature();
      if (!signatureResult) throw Error('Signature error');
      const pubkey = recoverPubKey(signatureResult.plainText, signatureResult.signature) + '';
      const managerAddress = await getManagerAddressByWallet(
        walletInfo as WalletInfo,
        walletType,
        pubkey,
      );
      const apiParams: QueryAuthApiExtraRequest = {
        pubkey,
        signature: signatureResult.signature,
        plain_text: signatureResult.plainText,
        version: PortkeyVersion.v2,
        source:
          walletType === WalletTypeEnum.elf ? AuthTokenSource.NightElf : AuthTokenSource.Portkey,
        managerAddress: managerAddress,
        ca_hash: caHash || undefined,
        chain_id: originChainId || undefined,
        recaptchaToken: recaptchaResult || undefined,
      };

      await queryAuthApi(apiParams);
      eTransferInstance.setUnauthorized(false);
      console.log('login status isLogin', isLogin);
      loginSuccessActive();
    } catch (error: any) {
      console.log('queryAuthApi error', error);
      if (
        error?.type === ReCaptchaType.cancel ||
        error?.type === ReCaptchaType.error ||
        error?.type === ReCaptchaType.expire
      ) {
        SingleMessage.error(error?.data);
      }
      await disConnectWallet();

      return;
    } finally {
      setLoading(false);
      eTransferInstance.setUnauthorized(false);
      eTransferInstance.setObtainingSignature(false);
    }
  }, [
    disConnectWallet,
    handleGetSignature,
    handleReCaptcha,
    isLogin,
    loginSuccessActive,
    setLoading,
    walletInfo,
    walletType,
  ]);

  const getAuth = useDebounceCallback(async () => {
    if (!isLogin) return;
    if (eTransferInstance.obtainingSignature) return;
    try {
      const { caHash } = await getCaHashAndOriginChainIdByWallet(
        walletInfo as WalletInfo,
        walletType,
      );
      const managerAddress = await getManagerAddressByWallet(walletInfo as WalletInfo, walletType);
      const source =
        walletType === WalletTypeEnum.elf ? AuthTokenSource.NightElf : AuthTokenSource.Portkey;
      const key = (caHash || source) + managerAddress;
      const data = getLocalJWT(key);
      // 1: local storage has JWT token
      if (data) {
        const token_type = data.token_type;
        const access_token = data.access_token;
        service.defaults.headers.common['Authorization'] = `${token_type} ${access_token}`;
        loginSuccessActive();
      } else {
        // 2: local storage don not has JWT token
        await queryAuth();
      }
    } catch (error) {
      console.log('getAuth error:', error);
    }
  }, [isLogin, walletInfo, walletType]);

  return { getAuth, queryAuth, loginSuccessActive };
}

export function useSetAuthFromStorage() {
  const { walletType, walletInfo } = useConnectWallet();

  return useCallback(async () => {
    if (!walletInfo || walletType === WalletTypeEnum.unknown) return false;

    const { caHash } = await getCaHashAndOriginChainIdByWallet(
      walletInfo as WalletInfo,
      walletType,
    );
    const managerAddress = await getManagerAddressByWallet(walletInfo as WalletInfo, walletType);
    const source =
      walletType === WalletTypeEnum.elf ? AuthTokenSource.NightElf : AuthTokenSource.Portkey;
    const key = (caHash || source) + managerAddress;
    const data = getLocalJWT(key);
    // local storage has JWT token
    if (data) {
      const token_type = data.token_type;
      const access_token = data.access_token;
      service.defaults.headers.common['Authorization'] = `${token_type} ${access_token}`;
      return true;
    }

    return false;
  }, [walletInfo, walletType]);
}
