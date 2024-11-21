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

export function useAuthToken() {
  const { fromWalletType } = useCrossChainTransfer();
  const [{ fromWallet, toWallet }] = useWallet();
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

    if (
      !walletSourceType ||
      fromWalletType === WalletTypeEnum.AELF ||
      fromWalletType === WalletTypeEnum.TON
    ) {
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
    async ({ recipientAddress }: { recipientAddress?: string }) => {
      if (!fromWallet?.isConnected || (!toWallet?.isConnected && !!recipientAddress)) return '';

      try {
        setLoading(true);
        const recaptchaResult = await handleReCaptcha();

        const signatureResult = await fromWallet.signMessage();
        console.log('>>>>>> getAuthToken signatureResult', signatureResult);
        if (!signatureResult.signature) throw Error('Signature error');

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
        return '';
      } finally {
        setLoading(false);
      }
    },
    [fromWallet, handleReCaptcha, setLoading, toWallet?.isConnected],
  );

  const getAuthToken = useCallback(
    async ({ recipientAddress }: { recipientAddress?: string }) => {
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
          return await queryAuthToken({ recipientAddress });
        }
      } catch (error) {
        console.log('getAuth error:', error);
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
