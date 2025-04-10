'use client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import { LeftOutlined } from '@ant-design/icons';
import styles from './styles.module.scss';
import { useClearStore } from 'hooks/common';
import { WalletTypeEnum as AelfWalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import useAelf from 'hooks/wallet/useAelf';
import { Asset, PortkeyAssetProvider } from '@portkey/did-ui-react';
// import { LoginStatusEnum } from '@portkey/types';
// import { SingleMessage } from '@etransfer/ui-react';

export default function MyAsset() {
  const router = useRouter();
  const { connector } = useAelf();
  const clearStore = useClearStore();
  const portkeyWebInfo = useMemo(() => {
    let chainId, pin;
    const _sdkWalletInfoString = localStorage.getItem('PortkeyWebWalletWalletInfo');
    if (_sdkWalletInfoString) {
      const _sdkWalletInfo = JSON.parse(_sdkWalletInfoString);
      chainId = _sdkWalletInfo.originChainId;
    }
    return {
      chainId,
      pin,
    };
  }, []);

  const handleDeleteAccount = useCallback(() => {
    clearStore();
    localStorage.clear();
  }, [clearStore]);

  useEffect(() => {
    if (connector !== AelfWalletTypeEnum.web) {
      router.push('/');
    }
  }, [connector, router]);

  // const loginOnChainStatus = PortkeyDid.did.didWallet.isLoginStatus;
  // console.log('>>>>>> loginOnChainStatus', loginOnChainStatus === LoginStatusEnum.SUCCESS);

  // useEffect(() => {
  //   if (loginOnChainStatus === LoginStatusEnum.FAIL) {
  //     SingleMessage.error(
  //       'Synchronization failed. Please check your connection status or log in again.',
  //     );
  //   }
  // }, [loginOnChainStatus]);

  if (connector !== AelfWalletTypeEnum.web || !portkeyWebInfo?.pin || !portkeyWebInfo?.chainId) {
    return null;
  }

  return (
    <div className={styles['my-asset-wrapper']}>
      <PortkeyAssetProvider
        originChainId={portkeyWebInfo?.chainId}
        pin={portkeyWebInfo?.pin}
        isLoginOnChain={true}>
        <Asset
          isShowRamp={false}
          isShowRampBuy={false}
          isShowRampSell={false}
          backIcon={<LeftOutlined />}
          onOverviewBack={() => router.back()}
          onLifeCycleChange={(lifeCycle) => {
            console.log(lifeCycle, 'onLifeCycleChange');
          }}
          onDeleteAccount={handleDeleteAccount}
        />
      </PortkeyAssetProvider>
    </div>
  );
}
