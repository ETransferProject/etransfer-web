import { GetCAHolderByManagerParams } from '@portkey/services';
import { Accounts, ChainId } from '@portkey/provider-types';
import { useWebLogin, WebLoginState, WalletType, PortkeyDid } from 'aelf-web-login';
import { getLocalJWT, queryAuthApi } from 'api/utils';
import { SupportedChainId, AppName, SupportedELFChainId } from 'constants/index';
import { PortkeyVersion } from 'constants/wallet';
import { useCallback } from 'react';
import { useAppDispatch, useLoading, useUserActionState } from 'store/Provider/hooks';
import { setUserInfo } from 'store/reducers/userAction/slice';
import AElf from 'aelf-sdk';
import { pubKeyToAddress, recoverPubKey } from 'utils/aelfBase';
import { setSwitchVersionAction } from 'store/reducers/common/slice';
import { setV2ConnectedInfoAction } from 'store/reducers/portkeyWallet/actions';
import { useDebounceCallback } from 'hooks';
import service from 'api/axios';
import { eTransferInstance } from 'utils/etransferInstance';

export function useQueryAuthToken() {
  const dispatch = useAppDispatch();
  const { loginState, logout, wallet, getSignature, walletType } = useWebLogin();
  const { setLoading } = useLoading();
  const { userInfo } = useUserActionState();

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
    if (!wallet) return;
    if (loginState !== WebLoginState.logined) return;
    let caHash = '';
    const address = wallet.address;
    let originChainId: ChainId = SupportedChainId.sideChain;
    setLoading(true);
    if (walletType === WalletType.discover) {
      try {
        const res = await PortkeyDid.did.services.getHolderInfoByManager({
          caAddresses: [address],
        } as unknown as GetCAHolderByManagerParams);
        const caInfo = res[0];
        caHash = caInfo?.caHash || '';
        originChainId = (caInfo?.chainId as ChainId) || SupportedChainId.sideChain;
      } catch (error) {
        console.log('getHolderInfoByManager error', error);
        return;
      }
    }
    if (walletType === WalletType.portkey) {
      caHash = wallet.portkeyInfo?.caInfo?.caHash || '';
      originChainId = wallet.portkeyInfo?.chainId || SupportedChainId.sideChain;
    }
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
      const managerAddress = pubKeyToAddress(pubkey);
      const apiParams = {
        pubkey,
        signature,
        plain_text: plainText,
        ca_hash: caHash,
        chain_id: originChainId,
        managerAddress: managerAddress,
        version: PortkeyVersion.v2,
      };
      await queryAuthApi(apiParams);
      eTransferInstance.setObtainingToken(false);
      dispatch(
        setUserInfo({
          caHash,
          managerAddress,
          originChainId: originChainId as SupportedELFChainId,
        }),
      );
      console.log('login success');
      console.log(loginState, wallet);
      loginSuccessActive();
    } catch (error) {
      console.log('queryAuthApi error', error);
      logout();
      return;
    } finally {
      setLoading(false);
    }
  }, [
    dispatch,
    getSignature,
    loginState,
    loginSuccessActive,
    logout,
    setLoading,
    wallet,
    walletType,
  ]);

  const onAccept = useDebounceCallback(async () => {
    if (!wallet) return;
    if (loginState !== WebLoginState.logined) return;
    // 1 if has logined, get token from local storage
    const { caHash, managerAddress } = userInfo;
    const key = caHash + managerAddress;
    const data = getLocalJWT(key);
    if (data) {
      const token_type = data.token_type;
      const access_token = data.access_token;
      service.defaults.headers.common['Authorization'] = `${token_type} ${access_token}`;
      loginSuccessActive();
      return;
    }
    // 2 if no data -> default queryAuth
    queryAuth();
  }, [loginState]);

  return { onAccept, queryAuth, loginSuccessActive };
}
