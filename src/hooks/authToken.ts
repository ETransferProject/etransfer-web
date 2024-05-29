import { Accounts } from '@portkey/provider-types';
import { useWebLogin, WebLoginState, WalletType } from 'aelf-web-login';
import { QueryAuthApiExtraRequest, getLocalJWT, queryAuthApi } from 'api/utils';
import { SupportedChainId, AppName } from 'constants/index';
import { PortkeyVersion } from 'constants/wallet';
import { useCallback } from 'react';
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

export function useQueryAuthToken() {
  const dispatch = useAppDispatch();
  const { loginState, logout, wallet, getSignature, walletType } = useWebLogin();
  const { setLoading } = useLoading();

  const loginSuccessActive = useCallback(() => {
    const { name = '', discoverInfo } = wallet;
    // portkey is string or discover is string[] -> string[]
    let accounts: Accounts = {};
    if (walletType === WalletType.discover) {
      accounts = discoverInfo?.accounts || {};
    }
    if (walletType === WalletType.portkey) {
      // portkey address need manual setup: 'ELF_' + address + '_' + chainId
      const isMainChainAddress = wallet.portkeyInfo?.accounts?.[SupportedChainId.mainChain];
      const istSideChainAddress = wallet.portkeyInfo?.accounts?.[SupportedChainId.sideChain];

      if (accounts && isMainChainAddress && !istSideChainAddress) {
        const baseAddress =
          'ELF_' + wallet.portkeyInfo?.accounts?.[SupportedChainId.mainChain] + '_';
        accounts[SupportedChainId.mainChain] = [baseAddress + SupportedChainId.mainChain];
        accounts[SupportedChainId.sideChain] = [baseAddress + SupportedChainId.sideChain];
      } else if (accounts && !isMainChainAddress && istSideChainAddress) {
        const baseAddress =
          'ELF_' + wallet.portkeyInfo?.accounts?.[SupportedChainId.sideChain] + '_';
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
    }
    dispatch(
      setV2ConnectedInfoAction({
        accounts,
        name,
        isActive: true,
      }),
    );
    dispatch(setSwitchVersionAction(PortkeyVersion.v2));
  }, [dispatch, wallet, walletType]);

  const queryAuth = useCallback(async () => {
    console.log('🌈 🌈 🌈 🌈 🌈 🌈 wallet', wallet);
    if (!wallet) return;
    if (loginState !== WebLoginState.logined) return;

    setLoading(true);
    const { caHash, originChainId } = await getCaHashAndOriginChainIdByWallet(wallet, walletType);
    try {
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
      const signature = result?.signature || '';
      const pubkey = recoverPubKey(plainText, signature) + '';
      const managerAddress = await getManagerAddressByWallet(wallet, walletType, pubkey);
      const apiParams: QueryAuthApiExtraRequest = {
        pubkey,
        signature,
        plain_text: plainText,
        version: PortkeyVersion.v2,
        source: walletType === WalletType.elf ? AuthTokenSource.NightElf : AuthTokenSource.Portkey,
        managerAddress: managerAddress,
        ca_hash: caHash || undefined,
        chain_id: originChainId || undefined,
        recaptchaToken: '' || undefined,
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
  }, [getSignature, loginState, loginSuccessActive, logout, setLoading, wallet, walletType]);

  const getAuth = useDebounceCallback(async () => {
    if (!wallet) return;
    if (loginState !== WebLoginState.logined) return;
    if (eTransferInstance.obtainingSignature) return;
    try {
      // Mark: only one signature process can be performed at the same time
      eTransferInstance.setObtainingSignature(true);
      const { caHash } = await getCaHashAndOriginChainIdByWallet(wallet, walletType);
      const managerAddress = await getManagerAddressByWallet(wallet, walletType);
      const key = caHash + managerAddress;
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
