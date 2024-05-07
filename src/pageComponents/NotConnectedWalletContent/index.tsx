'use client';
import clsx from 'clsx';
import { useCommonState } from 'store/Provider/hooks';
import { CommonButtonSize } from 'components/CommonButton';
import ConnectWalletButton from 'pageComponents/LoginAndProfile/ConnectWalletButton';
import styles from './styles.module.scss';
import CommonImage from 'components/CommonImage';
import { LargeLogo, Logo } from 'assets/images';

export default function NotConnectedWalletContent() {
  const { isMobilePX } = useCommonState();

  return (
    <div className={clsx(styles['container'], styles['container-safe-area'])}>
      <div className={clsx('flex-column-center')}>
        {isMobilePX && <Logo className={styles['logo']} />}
        <CommonImage className={styles['large-logo']} src={LargeLogo} alt="logo" />
        <div className={styles['primary-text']}>Deposit/Withdraw Digital Assets</div>
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
          />
        </div>
      </div>
    </div>
  );
}
