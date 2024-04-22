'use client';
import { Asset, PortkeyAssetProvider } from '@portkey/did-ui-react';
import { WalletType, useWebLogin, WebLoginState } from 'aelf-web-login';
import { Chain } from 'constants/index';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { LeftOutlined } from '@ant-design/icons';
import styles from './styles.module.scss';

export default function MyAsset() {
  const router = useRouter();
  const { wallet, walletType, login, loginState } = useWebLogin();

  useEffect(() => {
    if (loginState !== WebLoginState.logined) {
      login();
    } else if (walletType !== WalletType.portkey) {
      router.push('/');
    }
  }, [loginState, walletType]);

  if (walletType !== WalletType.portkey) {
    return <></>;
  }

  console.log(wallet?.portkeyInfo?.chainId, wallet?.portkeyInfo?.pin);
  return (
    <div className={styles['my-asset-wrapper']}>
      <PortkeyAssetProvider
        originChainId={wallet?.portkeyInfo?.chainId as Chain}
        pin={wallet?.portkeyInfo?.pin}>
        <Asset
          // faucet={{
          //   faucetContractAddress: configInfo?.faucetContractAddress,
          // }}
          isShowRamp={false}
          isShowRampBuy={false}
          isShowRampSell={false}
          backIcon={<LeftOutlined rev={undefined} />}
          onOverviewBack={() => router.back()}
          onLifeCycleChange={(lifeCycle) => {
            console.log(lifeCycle, 'onLifeCycleChange');
          }}
        />
      </PortkeyAssetProvider>
    </div>
  );
}
