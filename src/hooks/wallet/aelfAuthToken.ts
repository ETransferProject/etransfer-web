import { WalletTypeEnum as AelfWalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { QueryAuthApiExtraRequest, getLocalJWT, queryAuthApi } from 'api/utils';
import { APP_NAME } from 'constants/index';
import { useCallback, useEffect, useState } from 'react';
import { useLoading } from 'store/Provider/hooks';
import AElf from 'aelf-sdk';
import { recoverPubKey } from 'utils/aelf/aelfBase';
import service from 'api/axios';
import { eTransferInstance } from 'utils/etransferInstance';
import { getCaHashAndOriginChainIdByWallet, getManagerAddressByWallet } from 'utils/wallet/index';
import { AuthTokenSource } from 'types/api';
import { ReCaptchaType } from 'components/GoogleRecaptcha/types';
import { checkEOARegistration } from 'utils/api/user';
import myEvents from 'utils/myEvent';
import googleReCaptchaModal from 'utils/modal/googleReCaptchaModal';
import { SingleMessage } from '@etransfer/ui-react';
import { ExtraInfoForDiscover, WalletInfo } from 'types/wallet';
import useAelf from './useAelf';
import { getAuthPlainText } from 'utils/auth';
import { zeroFill } from '@portkey/utils';

export function useAelfAuthToken() {
  const { account, disconnect, connector, isConnected, signMessage, walletInfo } = useAelf();
  const { setLoading } = useLoading();

  const loginSuccessActive = useCallback(() => {
    console.log('%c login success and emit event', 'color: green');
    myEvents.LoginSuccess.emit();
  }, []);

  const handleSignMessage = useCallback(async () => {
    if (!account) return;
    const plainText = getAuthPlainText();
    const plainTextHex: any = plainText.plainTextHex;
    let signResult: {
      error: number;
      errorMessage: string;
      signature: string;
      from: string;
    } | null;

    if (connector === AelfWalletTypeEnum.discover) {
      // discover
      const discoverInfo = walletInfo?.extraInfo as ExtraInfoForDiscover;
      if ((discoverInfo?.provider as any).methodCheck('wallet_getManagerSignature')) {
        const sin = await discoverInfo?.provider?.request({
          method: 'wallet_getManagerSignature',
          payload: { hexData: plainTextHex },
        });
        const signInfo = [
          zeroFill(sin.r),
          zeroFill(sin.s),
          `0${sin.recoveryParam.toString()}`,
        ].join('');
        signResult = {
          error: 0,
          errorMessage: '',
          signature: signInfo,
          from: AelfWalletTypeEnum.discover,
        };
      } else {
        const signInfo = AElf.utils.sha256(plainTextHex);
        signResult = await signMessage({
          appName: APP_NAME,
          address: account,
          signInfo,
        });
      }
    } else if (connector === AelfWalletTypeEnum.elf) {
      // nightElf
      const signInfo = AElf.utils.sha256(plainTextHex);
      signResult = await signMessage({
        appName: APP_NAME,
        address: account,
        signInfo,
      });
    } else {
      // portkey sdk
      const signInfo = Buffer.from(plainTextHex).toString('hex');
      signResult = await signMessage({
        appName: APP_NAME,
        address: account,
        signInfo,
      });
    }

    if (signResult?.error) throw signResult.errorMessage;

    return { signature: signResult?.signature || '', plainText: plainTextHex };
  }, [account, connector, signMessage, walletInfo?.extraInfo]);

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
    if (!account) return;
    if (connector === AelfWalletTypeEnum.elf) {
      const isRegistered = await checkEOARegistration({ address: account });
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
  }, [account, connector, isReCaptchaLoading, setLoading]);

  const queryAuth = useCallback(
    async (isThrowError: boolean, isAfterErrorDisconnect: boolean): Promise<string | undefined> => {
      if (!isConnected) return;
      if (eTransferInstance.obtainingSignature) return;
      try {
        // Mark: only one signature process can be performed at the same time
        eTransferInstance.setObtainingSignature(true);
        setLoading(true);
        const recaptchaResult = await handleReCaptcha();
        setLoading(true); // to change loading text = 'Loading...'
        const { caHash, originChainId } = await getCaHashAndOriginChainIdByWallet(
          walletInfo as WalletInfo,
          connector,
        );
        const signatureResult = await handleSignMessage();
        if (!signatureResult) throw Error('Signature error');
        const pubkey = recoverPubKey(signatureResult.plainText, signatureResult.signature) + '';
        const managerAddress = await getManagerAddressByWallet(
          walletInfo as WalletInfo,
          connector,
          pubkey,
        );
        const apiParams: QueryAuthApiExtraRequest = {
          pubkey,
          signature: signatureResult.signature,
          plain_text: signatureResult.plainText,
          source:
            connector === AelfWalletTypeEnum.elf
              ? AuthTokenSource.NightElf
              : AuthTokenSource.Portkey,
          managerAddress: managerAddress,
          ca_hash: caHash || undefined,
          chain_id: originChainId || undefined,
          recaptchaToken: recaptchaResult || undefined,
        };

        const authToken = await queryAuthApi(apiParams);
        eTransferInstance.setUnauthorized(false);
        console.log('login status isConnected', isConnected);
        loginSuccessActive();
        return authToken;
      } catch (error: any) {
        console.log('queryAuthApi error', error);
        if (
          error?.type === ReCaptchaType.cancel ||
          error?.type === ReCaptchaType.error ||
          error?.type === ReCaptchaType.expire
        ) {
          SingleMessage.error(error?.data);
        }
        if (isThrowError) throw error;
        if (isAfterErrorDisconnect) await disconnect();

        return;
      } finally {
        eTransferInstance.setUnauthorized(false);
        eTransferInstance.setObtainingSignature(false);
      }
    },
    [
      connector,
      disconnect,
      handleSignMessage,
      handleReCaptcha,
      isConnected,
      loginSuccessActive,
      setLoading,
      walletInfo,
    ],
  );

  const getAuth = useCallback(
    async (isThrowError: boolean, isAfterErrorDisconnect: boolean): Promise<string | undefined> => {
      if (!isConnected) return;
      if (eTransferInstance.obtainingSignature) return;
      try {
        const { caHash } = await getCaHashAndOriginChainIdByWallet(
          walletInfo as WalletInfo,
          connector,
        );
        const managerAddress = await getManagerAddressByWallet(walletInfo as WalletInfo, connector);
        const source =
          connector === AelfWalletTypeEnum.elf ? AuthTokenSource.NightElf : AuthTokenSource.Portkey;
        const key = (caHash || source) + managerAddress;
        const data = getLocalJWT(key);
        // 1: local storage has JWT token
        if (data) {
          const token_type = data.token_type;
          const access_token = data.access_token;

          service.defaults.headers.common['Authorization'] = `${token_type} ${access_token}`;
          loginSuccessActive();
          return `${token_type} ${access_token}`;
        } else {
          // 2: local storage don not has JWT token
          return await queryAuth(isThrowError, isAfterErrorDisconnect);
        }
      } catch (error) {
        console.log('getAuth error:', error);
        if (isThrowError) throw error;
        return;
      }
    },
    [connector, isConnected, loginSuccessActive, queryAuth, walletInfo],
  );

  return { getAuth, queryAuth, loginSuccessActive };
}

export function useSetAuthFromStorage() {
  const { connector, walletInfo } = useAelf();

  return useCallback(async () => {
    if (!walletInfo || connector === AelfWalletTypeEnum.unknown) return false;

    const { caHash } = await getCaHashAndOriginChainIdByWallet(walletInfo as WalletInfo, connector);
    const managerAddress = await getManagerAddressByWallet(walletInfo as WalletInfo, connector);
    const source =
      connector === AelfWalletTypeEnum.elf ? AuthTokenSource.NightElf : AuthTokenSource.Portkey;
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
  }, [connector, walletInfo]);
}
