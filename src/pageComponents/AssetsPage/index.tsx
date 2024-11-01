'use client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import { LeftOutlined } from '@ant-design/icons';
import styles from './styles.module.scss';
import { useClearStore } from 'hooks/common';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { PortkeyDid } from '@aelf-web-login/wallet-adapter-bridge';
import { ExtraInfoForPortkeyAA } from 'types/wallet';
import { LoginStatusEnum } from '@portkey/types';
import { SingleMessage } from '@etransfer/ui-react';

export default function MyAsset() {
  const router = useRouter();
  const { walletType, walletInfo } = useConnectWallet();
  const clearStore = useClearStore();
  const portkeyAAInfo = useMemo(() => {
    return walletInfo?.extraInfo as ExtraInfoForPortkeyAA;
  }, [walletInfo?.extraInfo]);

  const handleDeleteAccount = useCallback(() => {
    clearStore();
    localStorage.clear();
  }, [clearStore]);

  useEffect(() => {
    if (walletType !== WalletTypeEnum.aa) {
      router.push('/');
    }
  }, [walletType, router]);

  const loginOnChainStatus = PortkeyDid.did.didWallet.isLoginStatus;
  console.log('>>>>>> loginOnChainStatus', loginOnChainStatus === LoginStatusEnum.SUCCESS);

  useEffect(() => {
    if (loginOnChainStatus === LoginStatusEnum.FAIL) {
      SingleMessage.error(
        'Synchronization failed. Please check your connection status or log in again.',
      );
    }
  }, [loginOnChainStatus]);

  if (
    walletType !== WalletTypeEnum.aa ||
    !portkeyAAInfo?.portkeyInfo?.pin ||
    !portkeyAAInfo?.portkeyInfo?.chainId
  ) {
    return null;
  }

  return (
    <div className={styles['my-asset-wrapper']}>
      <PortkeyDid.PortkeyAssetProvider
        originChainId={portkeyAAInfo?.portkeyInfo?.chainId}
        pin={portkeyAAInfo?.portkeyInfo?.pin}
        isLoginOnChain={loginOnChainStatus === LoginStatusEnum.SUCCESS}>
        <PortkeyDid.Asset
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
      </PortkeyDid.PortkeyAssetProvider>
    </div>
  );
}
