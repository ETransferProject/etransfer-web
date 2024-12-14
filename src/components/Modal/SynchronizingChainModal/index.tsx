import { GOT_IT } from 'constants/misc';
import styles from './styles.module.scss';
import CommonModalTip from 'components/Tips/CommonModalTip';

export type TSynchronizingChainModal = {
  open?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
};

const SynchronizingChainModalTitle =
  'Data is synchronising on the blockchain. Please wait a minute and try again.';

export default function SynchronizingChainModal({
  open = false,
  onOk,
  onCancel,
}: TSynchronizingChainModal) {
  return (
    <CommonModalTip
      className={styles.synchronizingChainModal}
      footerClassName={styles.synchronizingChainModalFooter}
      getContainer="body"
      open={open}
      closable={true}
      title="Tips"
      okText={GOT_IT}
      onOk={onOk}
      onCancel={onCancel}>
      <div className={styles.synchronizingChainModalBody}>{SynchronizingChainModalTitle}</div>
    </CommonModalTip>
  );
}
