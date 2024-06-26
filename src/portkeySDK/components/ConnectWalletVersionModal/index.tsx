import CommonModalTips from 'components/CommonModalTips';
import styles from './styles.module.scss';
import { PortkeyVersion } from 'constants/wallet';
import { Portkey24, PortkeyV2 } from 'assets/images';
import { useCallback } from 'react';
import { useAppDispatch } from 'store/Provider/hooks';
import { setSwitchVersionAction } from 'store/reducers/common/slice';

export type TConnectWalletVersionModal = {
  open?: boolean;
  onSelect?: (version: PortkeyVersion) => void;
  onCancel?: () => void;
};

const ConnectWalletVersionModalTitle = 'Connect a Wallet';
const ConnectWalletVersionModalContent = [
  {
    key: PortkeyVersion.v2,
    text: 'Portkey Wallet',
  },
  { key: PortkeyVersion.v1, text: 'Portkey (Deprecated)' },
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
      onSelect?.(version);
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
              {item.key === PortkeyVersion.v2 ? (
                <PortkeyV2 className={styles.walletIcon} />
              ) : (
                <Portkey24 className={styles.walletIcon} />
              )}
              <span className={styles.connectWalletVersionModalText}>{item.text}</span>
            </div>
          );
        })}
      </div>
    </CommonModalTips>
  );
}
