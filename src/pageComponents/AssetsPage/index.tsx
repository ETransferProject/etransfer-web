'use client';
import { Asset, PortkeyAssetProvider } from '@portkey/did-ui-react';
import { WalletType, useWebLogin } from 'aelf-web-login';
import { ChainId } from '@portkey/types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { LeftOutlined } from '@ant-design/icons';
import styles from './styles.module.scss';
import { useClearStore } from 'hooks/common';

export default function MyAsset() {
  const router = useRouter();
  const { wallet, walletType } = useWebLogin();
  const clearStore = useClearStore();

  const handleDeleteAccount = useCallback(() => {
    clearStore();
    localStorage.clear();
  }, [clearStore]);

  useEffect(() => {
    if (walletType !== WalletType.portkey) {
      router.push('/');
    }
  }, [walletType, router]);

  if (walletType !== WalletType.portkey) {
    return null;
  }

  return (
    <div className={styles['my-asset-wrapper']}>
      <PortkeyAssetProvider
        originChainId={wallet?.portkeyInfo?.chainId as ChainId}
        pin={wallet?.portkeyInfo?.pin}>
        <Asset
          isShowRamp={false}
          isShowRampBuy={false}
          isShowRampSell={false}
          backIcon={<LeftOutlined rev={undefined} />}
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
