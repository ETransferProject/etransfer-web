import React, { useEffect } from 'react';
import CommonButton, { CommonButtonProps } from 'components/CommonButton';
import { useAppDispatch, useLoading } from 'store/Provider/hooks';
import { useCallback } from 'react';
import {
  WebLoginState,
  useWebLogin,
  useWebLoginEvent,
  WebLoginEvents,
  WalletType,
  PortkeyDid,
} from 'aelf-web-login';
import { PortkeyVersion } from 'constants/wallet';
import { setV2ConnectedInfoAction } from 'store/reducers/portkeyWallet/actions';
import { setQueryAuthApiParams, setSwitchVersionAction } from 'store/reducers/common/slice';
import { Accounts } from '@portkey/provider-types';
import { NETWORK_CONFIG } from 'constants/loginNetwork';
import { GetCAHolderByManagerParams } from '@portkey/services';
import AElf from 'aelf-sdk';
import { AppName } from 'constants/index';
import { recoverPubKey } from 'utils/loginUtils';
import { queryAuthApi } from 'api/utils';
import { useDebounceCallback } from 'hooks';
// import { useEffectOnce } from 'react-use';
import { SupportedELFChainId } from 'constants/index';

const pubKeyToAddress = (pubKey: string) => {
  const onceSHAResult = Buffer.from(AElf.utils.sha256(Buffer.from(pubKey, 'hex')), 'hex');
  const hash = AElf.utils.sha256(onceSHAResult).slice(0, 64);
  return AElf.utils.encodeAddressRep(hash);
};

export default function ConnectWalletButton(props: CommonButtonProps) {
  const dispatch = useAppDispatch();
  const { login, loginState, wallet, getSignature, walletType } = useWebLogin();
  const { setLoading } = useLoading();

  const handleLogin = useCallback(async () => {
    login();
  }, [login]);

  useWebLoginEvent(WebLoginEvents.ERROR, (error) => {
    console.log('WebLoginEvents', error);
  });

  const onAccept = useDebounceCallback(async () => {
    if (!wallet) return;
    if (loginState !== WebLoginState.logined) return;

    let caHash = '';
    const address = wallet.address;
    let originChainId: string = NETWORK_CONFIG.sideChainId;

    if (walletType === WalletType.discover) {
      try {
        setLoading(true);
        const res = await PortkeyDid.did.services.getHolderInfoByManager({
          caAddresses: [address],
        } as unknown as GetCAHolderByManagerParams);
        const caInfo = res[0];
        caHash = caInfo?.caHash || '';
        originChainId = caInfo?.chainId || NETWORK_CONFIG.sideChainId;
      } catch (error) {
        console.log('getHolderInfoByManager error', error);
        return;
      }
    }

    if (walletType === WalletType.portkey) {
      caHash = wallet.portkeyInfo?.caInfo?.caHash || '';
      originChainId = wallet.portkeyInfo?.chainId || NETWORK_CONFIG.sideChainId;
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
      const queryAuthApiRes = await queryAuthApi(apiParams);
      dispatch(setQueryAuthApiParams(apiParams));
      console.log('queryAuthApiRes', queryAuthApiRes);
      console.log('login success');
      console.log(loginState, wallet);
      const { name = '', discoverInfo } = wallet;
      setLoading(false);
      // todo accounts depend on walletType
      // string or string[] -> string[]
      let accounts: Accounts = {};
      if (walletType === WalletType.discover) {
        accounts = discoverInfo?.accounts || {};
      }
      if (walletType === WalletType.portkey) {
        if (accounts && wallet.portkeyInfo?.accounts?.[SupportedELFChainId.AELF]) {
          accounts[SupportedELFChainId.AELF] = [wallet.portkeyInfo?.accounts?.AELF];
        }
        if (wallet.portkeyInfo?.accounts?.[SupportedELFChainId.tDVW]) {
          accounts[SupportedELFChainId.tDVW] = [wallet.portkeyInfo?.accounts?.tDVW];
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
    } catch (error) {
      console.log('queryAuthApi error', error);
      return;
    }
  }, [loginState]);

  useEffect(() => {
    console.log('loginState', loginState);
    onAccept();
  }, [loginState]);

  return (
    <CommonButton {...props} onClick={handleLogin}>
      Login In
    </CommonButton>
  );
}
