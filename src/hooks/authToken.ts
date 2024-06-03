import { Accounts } from '@portkey/provider-types';
import { useWebLogin, WebLoginState, WalletType } from 'aelf-web-login';
import { QueryAuthApiExtraRequest, getLocalJWT, queryAuthApi } from 'api/utils';
import { SupportedChainId, AppName } from 'constants/index';
import { PortkeyVersion } from 'constants/wallet';
import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useLoading } from 'store/Provider/hooks';
import AElf from 'aelf-sdk';
import { recoverPubKey } from 'utils/aelfBase';
import { setSwitchVersionAction } from 'store/reducers/common/slice';
import { setV2ConnectedInfoAction } from 'store/reducers/portkeyWallet/actions';
import { useDebounceCallback } from 'hooks';
import service from 'api/axios';
import { eTransferInstance } from 'utils/etransferInstance';
import { getCaHashAndOriginChainIdByWallet, getManagerAddressByWallet } from 'utils/wallet';
import { AuthTokenSource } from 'types/api';
import { ReCaptchaType } from 'components/GoogleRecaptcha/types';
import { checkEOARegistration } from 'utils/api/user';
import myEvents from 'utils/myEvent';
import googleReCaptchaModal from 'utils/modal/googleReCaptchaModal';

export function useQueryAuthToken() {
  const dispatch = useAppDispatch();
  const { loginState, logout, wallet, getSignature, walletType } = useWebLogin();
  const { setLoading } = useLoading();

  const handlePortkeyAccount = useCallback(() => {
    const accounts: Accounts = {};
    // portkey address need manual setup: 'ELF_' + address + '_' + chainId
    const isMainChainAddress = wallet.portkeyInfo?.accounts?.[SupportedChainId.mainChain];
    const istSideChainAddress = wallet.portkeyInfo?.accounts?.[SupportedChainId.sideChain];

    if (accounts && isMainChainAddress && !istSideChainAddress) {
      const baseAddress = 'ELF_' + wallet.portkeyInfo?.accounts?.[SupportedChainId.mainChain] + '_';
      accounts[SupportedChainId.mainChain] = [baseAddress + SupportedChainId.mainChain];
      accounts[SupportedChainId.sideChain] = [baseAddress + SupportedChainId.sideChain];
    } else if (accounts && !isMainChainAddress && istSideChainAddress) {
      const baseAddress = 'ELF_' + wallet.portkeyInfo?.accounts?.[SupportedChainId.sideChain] + '_';
      accounts[SupportedChainId.mainChain] = [baseAddress + SupportedChainId.mainChain];
      accounts[SupportedChainId.sideChain] = [baseAddress + SupportedChainId.sideChain];
    }
    if (isMainChainAddress && istSideChainAddress) {
      accounts[SupportedChainId.mainChain] = [
        'ELF_' + isMainChainAddress + '_' + SupportedChainId.mainChain,
      ];
      accounts[SupportedChainId.sideChain] = [
        'ELF_' + istSideChainAddress + '_' + SupportedChainId.sideChain,
      ];
    }
    return accounts;
  }, [wallet.portkeyInfo?.accounts]);

  const handleNightElfAccount = useCallback(() => {
    const accounts: Accounts = {};
    if (wallet.nightElfInfo?.account) {
      accounts[SupportedChainId.mainChain] = [
        'ELF_' + wallet.nightElfInfo?.account + '_' + SupportedChainId.mainChain,
      ];
      accounts[SupportedChainId.sideChain] = [
        'ELF_' + wallet.nightElfInfo?.account + '_' + SupportedChainId.sideChain,
      ];
    }

    return accounts;
  }, [wallet.nightElfInfo?.account]);

  const loginSuccessActive = useCallback(() => {
    const { name = '', discoverInfo } = wallet;
    // portkey is string or discover is string[] -> string[]
    let accounts: Accounts = {};
    if (walletType === WalletType.discover) {
      accounts = discoverInfo?.accounts || {};
    }
    if (walletType === WalletType.portkey) {
      accounts = handlePortkeyAccount();
    }
    if (walletType === WalletType.elf) {
      accounts = handleNightElfAccount();
    }
    dispatch(
      setV2ConnectedInfoAction({
        accounts,
        name,
        isActive: true,
      }),
    );
    dispatch(setSwitchVersionAction(PortkeyVersion.v2));
  }, [dispatch, handleNightElfAccount, handlePortkeyAccount, wallet, walletType]);

  const handleGetSignature = useCallback(async () => {
    const plainTextOrigin = `Nonce:${Date.now()}`;
    const plainText: any = Buffer.from(plainTextOrigin).toString('hex').replace('0x', '');
    let signInfo: string;
    if (walletType !== WalletType.portkey) {
      // nightElf or discover
      signInfo = AElf.utils.sha256(plainText);
    } else {
      // portkey sdk
      signInfo = Buffer.from(plainText).toString('hex');
    }
    console.log('getSignature');
    const result = await getSignature({
      appName: AppName,
      address: wallet.address,
      signInfo,
    });
    if (result.error) throw result.errorMessage;

    return { signature: result?.signature || '', plainText };
  }, [getSignature, wallet.address, walletType]);

  const [isReCaptchaLoading, setIsReCaptchaLoading] = useState(true);
  useEffect(() => {
    const { remove } = myEvents.GoogleReCaptcha.addListener(() => {
      setIsReCaptchaLoading(false);
    });
    return () => {
      remove();
    };
  }, [setLoading]);

  const handleReCaptcha = useCallback(async (): Promise<string | undefined> => {
    if (walletType === WalletType.elf) {
      const isRegistered = await checkEOARegistration({ address: wallet.address });
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
  }, [isReCaptchaLoading, setLoading, wallet.address, walletType]);

  const queryAuth = useCallback(async () => {
    if (!wallet) return;
    if (loginState !== WebLoginState.logined) return;
    try {
      setLoading(true);
      const recaptchaResult = await handleReCaptcha();
      setLoading(true); // to change loading text = 'Loading...'
      const { caHash, originChainId } = await getCaHashAndOriginChainIdByWallet(wallet, walletType);
      const signatureResult = await handleGetSignature();
      const pubkey = recoverPubKey(signatureResult.plainText, signatureResult.signature) + '';
      const managerAddress = await getManagerAddressByWallet(wallet, walletType, pubkey);
      const apiParams: QueryAuthApiExtraRequest = {
        pubkey,
        signature: signatureResult.signature,
        plain_text: signatureResult.plainText,
        version: PortkeyVersion.v2,
        source: walletType === WalletType.elf ? AuthTokenSource.NightElf : AuthTokenSource.Portkey,
        managerAddress: managerAddress,
        ca_hash: caHash || undefined,
        chain_id: originChainId || undefined,
        recaptchaToken: recaptchaResult || undefined,
      };

      await queryAuthApi(apiParams);
      eTransferInstance.setObtainingToken(false);
      console.log('login success');
      console.log(loginState, wallet);
      loginSuccessActive();
    } catch (error) {
      console.log('queryAuthApi error', error);
      logout();
      return;
    } finally {
      setLoading(false);
      eTransferInstance.setObtainingToken(false);
    }
  }, [
    handleGetSignature,
    handleReCaptcha,
    loginState,
    loginSuccessActive,
    logout,
    setLoading,
    wallet,
    walletType,
  ]);

  const getAuth = useDebounceCallback(async () => {
    if (!wallet) return;
    if (loginState !== WebLoginState.logined) return;
    if (eTransferInstance.obtainingSignature) return;
    try {
      // Mark: only one signature process can be performed at the same time
      eTransferInstance.setObtainingSignature(true);
      const { caHash } = await getCaHashAndOriginChainIdByWallet(wallet, walletType);
      const managerAddress = await getManagerAddressByWallet(wallet, walletType);
      const source =
        walletType === WalletType.elf ? AuthTokenSource.NightElf : AuthTokenSource.Portkey;
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
    } finally {
      eTransferInstance.setObtainingSignature(false);
    }
  }, [loginState]);

  return { getAuth, queryAuth, loginSuccessActive };
}
