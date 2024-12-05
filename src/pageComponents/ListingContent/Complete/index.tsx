import { CompleteIcon } from 'assets/images';
import CommonButton, { CommonButtonType } from 'components/CommonButton';
import styles from './styles.module.scss';
import { useCallback } from 'react';
import clsx from 'clsx';
import { VIEW_PROGRESS } from 'constants/listing';
import { useRouter } from 'next/navigation';

export default function Complete() {
  const router = useRouter();

  const handleGoMyApplications = useCallback(() => {
    router.push('/my-applications');
  }, [router]);

  return (
    <div className={clsx('column-center', styles['complete-container'])}>
      <CompleteIcon />
      <div className={styles['title']}>Application completed</div>
      <div className={styles['content']}>
        {`The token pool has been initialized successfully. Transfers are expected to be available within 1 business day, and we will notify you via email.`}
      </div>

      <CommonButton
        className={clsx('flex-1', styles['transfer-button'])}
        type={CommonButtonType.Border}
        onClick={handleGoMyApplications}
        ghost>
        {VIEW_PROGRESS}
      </CommonButton>
    </div>
  );
}
