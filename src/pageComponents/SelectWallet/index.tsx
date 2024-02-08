import React, { useCallback, useState } from 'react';
import { useAppDispatch, useCommonState } from 'store/Provider/hooks';
import ConnectWalletButton from 'pageComponents/ConnectWalletButton';
import MobileSelectWallet from './MobileSelectWallet';
import WebSelectWallet from './WebSelectWallet';
import { CommonButtonSize } from 'components/CommonButton';
import styles from './styles.module.scss';
import { usePortkeyProvider } from 'hooks/usePortkeyProvider';
import { useIsActive } from 'hooks/portkeyWallet';
import ConnectWalletVersionModal from 'pageComponents/Modal/ConnectWalletVersionModal';
import { PortkeyVersion } from 'constants/wallet';
import { isPortkeyV1, isPortkeyV2 } from 'utils/portkey';
import { setSwitchVersionAction } from 'store/reducers/common/slice';

export default function SelectWallet() {
  const isActive = useIsActive();
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
