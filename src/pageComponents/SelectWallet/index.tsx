import React, { useCallback, useState } from 'react';
import { useCommonState } from 'store/Provider/hooks';
import ConnectWalletButton from 'pageComponents/ConnectWalletButton';
import MobileSelectWallet from './MobileSelectWallet';
import WebSelectWallet from './WebSelectWallet';
import { CommonButtonSize } from 'components/CommonButton';
import styles from './styles.module.scss';
import { usePortkeyProvider } from 'hooks/usePortkeyProvider';
import { useIsActive } from 'hooks/portkeyWallet';
import ConnectWalletVersionModal from 'pageComponents/Modal/ConnectWalletVersionModal';

export default function SelectWallet() {
  const isActive = useIsActive();
  const { isMobilePX } = useCommonState();
  const { activate } = usePortkeyProvider();
  const [openConnectWalletVersionModal, setOpenConnectWalletVersionModal] = useState(false);

  const connectWallet = useCallback(() => {
    setOpenConnectWalletVersionModal(true);
  }, []);

  const handleCancel = useCallback(async () => {
    console.log('');
    setOpenConnectWalletVersionModal(false);
  }, []);

  const handleSelect = useCallback(async () => {
    console.log('');
    setOpenConnectWalletVersionModal(false);
    await activate();
  }, [activate]);

  if (!isActive) {
    return (
      <>
        <ConnectWalletButton
          className={styles['connect-wallet-button']}
          size={CommonButtonSize.Small}
          onClick={connectWallet}
        />
        <ConnectWalletVersionModal
          open={openConnectWalletVersionModal}
          onCancel={handleCancel}
          onSelect={handleSelect}
        />
      </>
    );
  }
  return isMobilePX ? <MobileSelectWallet /> : <WebSelectWallet />;
}
