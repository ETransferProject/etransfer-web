import styles from './styles.module.scss';
import { CloseFilled, TimeFilled, QuestionMarkIcon } from 'assets/images';
import { useCallback, useMemo, useState } from 'react';
import { TOrderStatus } from 'types/records';
import { useCommonState } from 'store/Provider/hooks';
import { Tooltip } from 'antd';
import { TMyApplicationStatus } from 'types/listingApplication';
import clsx from 'clsx';
import CommonModal from 'components/CommonModal';
import { GOT_IT } from 'constants/misc';

type TStatusBoxProps = {
  wrapperClassName?: string;
  className?: string;
  status: string;
  failReason?: string;
};

export default function StatusBox({
  wrapperClassName,
  className,
  status,
  failReason,
}: TStatusBoxProps) {
  const { isPadPX } = useCommonState();
  const [isMobileOpenModal, setIsMobileOpenModal] = useState(false);

  const showFailedReason = useCallback(() => {
    if (isPadPX) {
      setIsMobileOpenModal(true);
    }
  }, [isPadPX]);

  const content = useMemo(() => {
    switch (status) {
      case TOrderStatus.Processing:
        return (
          <div className={clsx(styles['status-box'], className)}>
            <TimeFilled />
            <span className={styles.processing}>{TMyApplicationStatus.Processing}</span>
          </div>
        );
      case TOrderStatus.Succeed:
        return (
          <div className={clsx(styles['status-box'], className)}>
            {TMyApplicationStatus.Succeed}
          </div>
        );
      case TOrderStatus.Failed:
        return (
          <div className={clsx(styles['status-box'], className)} onClick={showFailedReason}>
            <CloseFilled />
            <span className={styles.failed}>{TMyApplicationStatus.Failed}</span>
            <Tooltip title={!isPadPX && failReason} placement="top">
              <QuestionMarkIcon />
            </Tooltip>
          </div>
        );
      default:
        return null;
    }
  }, [status, className, showFailedReason, isPadPX, failReason]);

  return (
    <div className={clsx(styles['status-wrapper'], wrapperClassName)}>
      {content}
      <CommonModal
        width={'300px'}
        hideCancelButton={true}
        okText={GOT_IT}
        onOk={() => setIsMobileOpenModal(false)}
        title={TMyApplicationStatus.Failed}
        open={isMobileOpenModal}
        onCancel={() => setIsMobileOpenModal(false)}>
        <div>{failReason}</div>
      </CommonModal>
    </div>
  );
}
