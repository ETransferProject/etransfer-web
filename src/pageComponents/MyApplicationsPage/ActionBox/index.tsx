import { useCallback, useState } from 'react';
import { TOrderStatus } from 'types/records';
import styles from './styles.module.scss';
import ViewProgress from 'pageComponents/ListingContent/ViewProgress';
import { VIEW_PROGRESS } from 'constants/listing';

// TODO ts
export default function ActionBox({
  status,
  coboReviewStatus,
}: {
  status: string;
  coboReviewStatus: string;
}) {
  const [openViewProgress, setOpenViewProgress] = useState(false);

  const handleViewProgress = useCallback(() => {
    setOpenViewProgress(true);
  }, []);

  const handleCloseViewProgress = useCallback(() => {
    setOpenViewProgress(false);
  }, []);

  const handleConfirmViewProgress = useCallback(() => {
    setOpenViewProgress(false);
  }, []);

  const handleInitializeTokenPool = useCallback(() => {
    // TODO
  }, []);

  const handleLaunchOnOtherChain = useCallback(() => {
    // TODO
  }, []);

  const handleReapply = useCallback(() => {
    // TODO
  }, []);

  if (status === TOrderStatus.Processing) {
    if (coboReviewStatus === 'Reviewing') {
      return (
        <>
          <div className={styles['action']} onClick={handleViewProgress}>
            {VIEW_PROGRESS}
          </div>
          <ViewProgress
            open={openViewProgress}
            onClose={handleCloseViewProgress}
            onConfirm={handleConfirmViewProgress}
          />
        </>
      );
    }
    // reviewed
    return (
      <div className={styles['action']} onClick={handleInitializeTokenPool}>
        Initialize token pool
      </div>
    );
  }
  if (status === TOrderStatus.Succeed) {
    return (
      <div className={styles['action']} onClick={handleLaunchOnOtherChain}>
        Launch on other chain
      </div>
    );
  }
  //   TOrderStatus.Failed
  return (
    <div className={styles['action']} onClick={handleReapply}>
      Reapply
    </div>
  );
}
