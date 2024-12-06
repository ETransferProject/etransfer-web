import styles from './styles.module.scss';
import { CloseFilled, TimeFilled, QuestionMarkIcon } from 'assets/images';
import { useCallback, useMemo, useState } from 'react';
import { useCommonState } from 'store/Provider/hooks';
import { Tooltip } from 'antd';
import { TMyApplicationStatus } from 'types/listingApplication';
import clsx from 'clsx';
import CommonModal from 'components/CommonModal';
import { GOT_IT } from 'constants/misc';
import { ApplicationChainStatusEnum } from 'types/api';

type TStatusBoxProps = {
  wrapperClassName?: string;
  className?: string;
  status: ApplicationChainStatusEnum;
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

  const isSucceed = useMemo(() => {
    return status === ApplicationChainStatusEnum.Complete;
  }, [status]);

  const isFailed = useMemo(() => {
    return (
      status === ApplicationChainStatusEnum.Failed || status === ApplicationChainStatusEnum.Rejected
    );
  }, [status]);

  const showFailedReason = useCallback(() => {
    if (isPadPX) {
      setIsMobileOpenModal(true);
    }
  }, [isPadPX]);

  const content = useMemo(() => {
    if (isSucceed) {
      return (
        <div className={clsx(styles['status-box'], className)}>{TMyApplicationStatus.Succeed}</div>
      );
    }

    if (isFailed) {
      return (
        <div className={clsx(styles['status-box'], className)} onClick={showFailedReason}>
          <CloseFilled />
          <span className={styles.failed}>{TMyApplicationStatus.Failed}</span>
          <Tooltip title={!isPadPX && failReason} placement="top">
            <QuestionMarkIcon />
          </Tooltip>
        </div>
      );
    }

    return (
      <div className={clsx(styles['status-box'], className)}>
        <TimeFilled />
        <span className={styles.processing}>{TMyApplicationStatus.Processing}</span>
      </div>
    );
  }, [isSucceed, isFailed, className, showFailedReason, isPadPX, failReason]);

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
