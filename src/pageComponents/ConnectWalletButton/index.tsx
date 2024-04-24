import React, { useEffect } from 'react';
import CommonButton, { CommonButtonProps } from 'components/CommonButton';
import { useAppDispatch, useLoading } from 'store/Provider/hooks';
import { useCallback } from 'react';
import { WebLoginState, useWebLogin, WalletType, PortkeyDid } from 'aelf-web-login';
import { PortkeyVersion } from 'constants/wallet';
import { setV2ConnectedInfoAction } from 'store/reducers/portkeyWallet/actions';
import { setSwitchVersionAction } from 'store/reducers/common/slice';
import { setUserInfo } from 'store/reducers/userAction/slice';
import { Accounts } from '@portkey/provider-types';
import { AppName, SupportedChainId, SupportedELFChainId } from 'constants/index';
import { GetCAHolderByManagerParams } from '@portkey/services';
import AElf from 'aelf-sdk';
import { recoverPubKey } from 'utils/loginUtils';
import { queryAuthApi } from 'api/utils';
import { useDebounceCallback } from 'hooks';
import { ChainId } from '@portkey/types';

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

  const onAccept = useDebounceCallback(async () => {
    if (!wallet) return;
    if (loginState !== WebLoginState.logined) return;

    let caHash = '';
    const address = wallet.address;
    let originChainId: ChainId = SupportedChainId.sideChain;

    if (walletType === WalletType.discover) {
      try {
        setLoading(true);
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
      dispatch(
        setUserInfo({
          caHash,
          managerAddress,
          originChainId: originChainId as SupportedELFChainId,
        }),
      );
      console.log('login success');
      console.log(loginState, wallet);
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
    } catch (error) {
      console.log('queryAuthApi error', error);
      return;
    } finally {
      setLoading(false);
    }
  }, [loginState]);

  useEffect(() => {
    console.log('loginState', loginState);
    onAccept();
    // Ignore the impact of the change in onAccept, just watch loginState change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginState]);

  return (
    <CommonButton {...props} onClick={handleLogin}>
      Log In
    </CommonButton>
  );
}
