import MobileTransferBody from './MobileTransferBody';
import MobileTransferHeader from './MobileTransferHeader';
import styles from './styles.module.scss';

export default function MobileTransfer() {
  return (
    <div className={styles['mobile-transfer']}>
      <MobileTransferHeader />
      <MobileTransferBody />
    </div>
  );
}
