import { SupportIcon } from 'assets/images';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { useCallback } from 'react';
import { openWithBlank } from 'utils/common';

const ETransferSupportUrl = 'https://t.me/etransfer_support';

export default function SupportEntry({ className }: { className?: string }) {
  const handleCLick = useCallback(() => {
    openWithBlank(ETransferSupportUrl);
  }, []);

  return (
    <div className={clsx('row-center', styles.supportEntry, className)} onClick={handleCLick}>
      <SupportIcon />
      <span className={styles.supportEntryValue}>Support</span>
    </div>
  );
}
