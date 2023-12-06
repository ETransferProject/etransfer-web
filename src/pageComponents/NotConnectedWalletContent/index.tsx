'use client';
import clsx from 'clsx';
import { useCommonState } from 'store/Provider/hooks';
import { CommonButtonSize } from 'components/CommonButton';
import ConnectWalletButton from 'pageComponents/ConnectWalletButton';
import styles from './styles.module.scss';
import { usePortkeyProvider } from 'hooks/usePortkeyProvider';
import CommonImage from 'components/CommonImage';
import { useCallback } from 'react';
import { LargeLogo, Logo } from 'assets/images';

export default function NotConnectedWalletContent() {
  const { isMobilePX } = useCommonState();
  const { activate } = usePortkeyProvider();
  const connectWallet = useCallback(async () => {
    await activate();
  }, [activate]);

  return (
    <div className={clsx(styles['container'], styles['container-safe-area'])}>
      <div className={clsx('flex-column-center')}>
        {isMobilePX && <Logo className={styles['logo']} />}
        <CommonImage className={styles['large-logo']} src={LargeLogo} alt="logo" />
        <div className={styles['primary-text']}>Deposit/Withdraw USDT</div>
        <div className={styles['secondary-text']}>
          <p className={clsx('text-center', styles['secondary-text-item'])}>
            {!isMobilePX && 'ETransfer - '}Your Universal Gateway to Seamless Transfers.
          </p>
          <p className={clsx('text-center', styles['secondary-text-item'])}>
            Securely between aelf and other popular networks.
          </p>
        </div>
        <div
          className={clsx(
            styles['connect-wallet-button-wrapper'],
            styles['connect-wallet-button-wrapper-safe-area'],
          )}>
          <ConnectWalletButton
            className={styles['connect-wallet-button']}
            size={CommonButtonSize.Large}
            onClick={connectWallet}
          />
        </div>
      </div>
    </div>
  );
}
