'use client';
import clsx from 'clsx';
import { useAppDispatch, useCommonState } from 'store/Provider/hooks';
import { CommonButtonSize } from 'components/CommonButton';
import ConnectWalletButton from 'pageComponents/ConnectWalletButton';
import styles from './styles.module.scss';
import { usePortkeyProvider } from 'hooks/usePortkeyProvider';
import CommonImage from 'components/CommonImage';
import { useCallback, useState } from 'react';
import { LargeLogo, Logo } from 'assets/images';
import ConnectWalletVersionModal from 'pageComponents/Modal/ConnectWalletVersionModal';
import { PortkeyVersion } from 'constants/wallet';
import { isPortkeyV1, isPortkeyV2 } from 'utils/portkey';
import { setSwitchVersionAction } from 'store/reducers/common/slice';

export default function NotConnectedWalletContent() {
  const { isMobilePX } = useCommonState();
  const dispatch = useAppDispatch();
  const { activate } = usePortkeyProvider();
  const [openConnectWalletVersionModal, setOpenConnectWalletVersionModal] = useState(false);

  const connectWallet = useCallback(async () => {
    if (isPortkeyV1()) {
      dispatch(setSwitchVersionAction(PortkeyVersion.v1));
      await activate(PortkeyVersion.v1);
    } else if (isPortkeyV2()) {
      dispatch(setSwitchVersionAction(PortkeyVersion.v2));
      await activate(PortkeyVersion.v2);
    } else {
      setOpenConnectWalletVersionModal(true);
    }
  }, [activate, dispatch]);

  const handleCancel = useCallback(async () => {
    setOpenConnectWalletVersionModal(false);
  }, []);

  const handleSelect = useCallback(
    async (version: PortkeyVersion) => {
      setOpenConnectWalletVersionModal(false);
      await activate(version);
    },
    [activate],
  );

  return (
    <div className={clsx(styles['container'], styles['container-safe-area'])}>
      <div className={clsx('flex-column-center')}>
        {isMobilePX && <Logo className={styles['logo']} />}
        <CommonImage className={styles['large-logo']} src={LargeLogo} alt="logo" />
        <div className={styles['primary-text']}>Deposit/Withdraw Tokens</div>
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
