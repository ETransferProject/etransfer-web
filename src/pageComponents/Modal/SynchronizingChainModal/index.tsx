import Copy from 'components/Copy';
import OpenLink from 'components/OpenLink';
import styles from './styles.module.scss';
import clsx from 'clsx';
import CommonModalTips from 'components/CommonModalTips';

export type TSynchronizingChainModal = {
  open?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
};

const SynchronizingChainModalTitle =
  'The on-chain accounting is synchronizing. Please wait a minute and try again.';

export default function SynchronizingChainModal({
  open = false,
  onOk,
  onCancel,
}: TSynchronizingChainModal) {
  return (
    <CommonModalTips
      className={styles.synchronizingChainModal}
      footerClassName={styles.synchronizingChainModalFooter}
      getContainer="body"
      open={open}
      closable={true}
      title="Tips"
      okText="OK"
      onOk={onOk}
      onCancel={onCancel}>
      <div className={styles.synchronizingChainModalBody}>{SynchronizingChainModalTitle}</div>
    </CommonModalTips>
  );
}
