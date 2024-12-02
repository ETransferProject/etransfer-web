import Remind from 'components/Remind';
import styles from './styles.module.scss';
import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CoboCustodyReviewStatusIcon } from 'assets/images';
import clsx from 'clsx';
import ViewProgress from '../ViewProgress';

export default function CoboCustodyReview() {
  const router = useRouter();
  const [openViewProgress, setOpenViewProgress] = useState(false);

  const handleGoMyApplications = useCallback(() => {
    router.push('/my-applications');
  }, [router]);

  const handleViewProgress = useCallback(() => {
    setOpenViewProgress(true);
  }, []);

  const handleCloseViewProgress = useCallback(() => {
    setOpenViewProgress(false);
  }, []);

  const handleConfirmViewProgress = useCallback(() => {
    setOpenViewProgress(true);
  }, []);

  const renderRemind = useMemo(() => {
    return (
      <Remind className={styles['remind']} iconClassName={styles['remind-icon']} isBorder={false}>
        <div>
          <div className={styles['tip-row']}>
            • You can see the progress in ‘
            <span className={styles['action']} onClick={handleGoMyApplications}>
              My Applications
            </span>
            ’.
          </div>
          <div className={styles['tip-row']}>
            • Once approved, please add liquidity to complete the listing.
          </div>
          <div className={styles['tip-row']}>• If you need any support, please contact us.</div>
        </div>
      </Remind>
    );
  }, [handleGoMyApplications]);

  return (
    <div className={styles['cobo-custody-review']}>
      {renderRemind}
      <div className={styles['cobo-custody-review-body']}>
        <CoboCustodyReviewStatusIcon />
        <div className={styles['cobo-custody-review-text']}>
          The token was created successfully and has been submitted for Cobo custody review.
        </div>

        <div className={clsx(styles['action'], styles['action-bold'])} onClick={handleViewProgress}>
          View progress
        </div>
      </div>
      <ViewProgress
        open={openViewProgress}
        onClose={handleCloseViewProgress}
        onConfirm={handleConfirmViewProgress}
      />
    </div>
  );
}
