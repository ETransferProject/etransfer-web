'use client';
import clsx from 'clsx';
import { useCommonState, usePortkeyWalletState } from 'store/Provider/hooks';
import { CommonButtonSize } from 'components/CommonButton';
import ConnectWalletButton from 'pageComponents/ConnectWalletButton';
import styles from './styles.module.scss';
import { usePortkeyProvider } from 'hooks/usePortkeyProvider';
import CommonImage from 'components/CommonImage';
import { useCallback, useState } from 'react';
import { LargeLogo, Logo } from 'assets/images';
import ConnectWalletVersionModal from 'pageComponents/Modal/ConnectWalletVersionModal';

export default function NotConnectedWalletContent() {
  const { isMobilePX, currentVersion } = useCommonState();
  const { activate } = usePortkeyProvider();
  const [openConnectWalletVersionModal, setOpenConnectWalletVersionModal] = useState(false);

  const connectWallet = useCallback(() => {
    setOpenConnectWalletVersionModal(true);
  }, []);

  const handleCancel = useCallback(async () => {
    // TODO v2
    console.log('currentVersion', currentVersion);
    setOpenConnectWalletVersionModal(false);
  }, []);

  const handleSelect = useCallback(async () => {
    // TODO v2
    console.log('currentVersion', currentVersion);
    setOpenConnectWalletVersionModal(false);
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
      <ConnectWalletVersionModal
        open={openConnectWalletVersionModal}
        onCancel={handleCancel}
        onSelect={handleSelect}
      />
    </div>
  );
}
