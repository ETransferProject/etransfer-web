import CommonModalTips from 'components/CommonModalTips';
import styles from './styles.module.scss';
import { PortkeyVersion } from 'constants/index';
import { WalletIcon24 } from 'assets/images';
import { useCallback } from 'react';
import { useAppDispatch } from 'store/Provider/hooks';
import { setSwitchVersionAction } from 'store/reducers/common/slice';

export type TConnectWalletVersionModal = {
  open?: boolean;
  onSelect?: () => void;
  onCancel?: () => void;
};

const ConnectWalletVersionModalTitle = 'Connect a Wallet';
const ConnectWalletVersionModalContent = [
  {
    key: PortkeyVersion.v2,
    text: 'Portkey (Early Access)',
  },
  { key: PortkeyVersion.v1, text: 'Portkey' },
];

export default function ConnectWalletVersionModal({
  open = false,
  onSelect,
  onCancel,
}: TConnectWalletVersionModal) {
  const dispatch = useAppDispatch();
  const handleClick = useCallback(
    (version: PortkeyVersion) => {
      dispatch(setSwitchVersionAction(version));
      onSelect?.();
    },
    [dispatch, onSelect],
  );

  return (
    <CommonModalTips
      className={styles.connectWalletVersionModal}
      footerClassName={styles.connectWalletVersionModalFooter}
      getContainer="body"
      open={open}
      closable={true}
      hideOkButton={true}
      title={ConnectWalletVersionModalTitle}
      onCancel={onCancel}>
      <div className={styles.connectWalletVersionModalBody}>
        {ConnectWalletVersionModalContent.map((item) => {
          return (
            <div
              key={`ConnectWalletVersionModal_${item.key}`}
              className={styles.connectWalletVersionModalItem}
              onClick={() => handleClick(item.key)}>
              <WalletIcon24 className={styles.walletIcon} />
              <span className={styles.connectWalletVersionModalText}>{item.text}</span>
            </div>
          );
        })}
      </div>
    </CommonModalTips>
  );
}
