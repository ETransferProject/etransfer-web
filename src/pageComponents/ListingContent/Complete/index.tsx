import { CompleteIcon } from 'assets/images';
import CommonButton, { CommonButtonType } from 'components/CommonButton';
import styles from './styles.module.scss';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

export default function Complete() {
  const router = useRouter();

  const handleGoTransfer = useCallback(() => {
    router.push('/cross-chain-transfer');
  }, [router]);

  return (
    <div className={clsx('column-center', styles['complete-container'])}>
      <CompleteIcon />
      <div className={styles['title']}>Listing complete.</div>
      <div className={styles['content']}>
        You can now open the ETransfer App to start cross-chain transfers.
      </div>

      <CommonButton
        className={clsx('flex-1', styles['transfer-button'])}
        type={CommonButtonType.Border}
        onClick={handleGoTransfer}
        ghost>
        Transfer Now
      </CommonButton>
    </div>
  );
}
