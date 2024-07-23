'use client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { LeftOutlined } from '@ant-design/icons';
import styles from './styles.module.scss';
import { useClearStore } from 'hooks/common';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { PortkeyDid } from '@aelf-web-login/wallet-adapter-bridge';

export default function MyAsset() {
  const router = useRouter();
  const { walletType } = useConnectWallet();
  const clearStore = useClearStore();

  const handleDeleteAccount = useCallback(() => {
    clearStore();
    localStorage.clear();
  }, [clearStore]);

  useEffect(() => {
    if (walletType !== WalletTypeEnum.aa) {
      router.push('/');
    }
  }, [walletType, router]);

  if (walletType !== WalletTypeEnum.aa) {
    return null;
  }

  return (
    <div className={styles['my-asset-wrapper']}>
      <PortkeyDid.PortkeyAssetProvider
        originChainId="tDVW" // {wallet?.portkeyInfo?.chainId as ChainId}
        pin="111111" // {wallet?.portkeyInfo?.pin}
      >
        <PortkeyDid.Asset
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
      </PortkeyDid.PortkeyAssetProvider>
    </div>
  );
}
