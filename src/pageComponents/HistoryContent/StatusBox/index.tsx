import styles from './styles.module.scss';
import { CloseFilled, TimeFilled, QuestionMarkIcon } from 'assets/images';
import { useCallback, useMemo, useState } from 'react';
import { TOrderStatus, TRecordsStatusI18n } from 'types/records';
import { useCommonState } from 'store/Provider/hooks';
import CommonModal from 'components/CommonModal';
import { Tooltip } from 'antd';
import { ProcessingTipMessage, FailedTipMessage } from 'constants/records';
import { SupportedELFChainId } from 'constants/index';
import { BusinessType } from 'types/api';

type TStatusBoxProps = {
  status: string;
  address: string;
  network: string;
  fromChainId: SupportedELFChainId;
  toChainId: SupportedELFChainId;
  orderType: BusinessType;
};

export default function StatusBox({ status, network }: TStatusBoxProps) {
  const [isMobileOpenModal, setIsMobileOpenModal] = useState(false);
  const [tipMessage, setTipMessage] = useState('');
  const [title, setTitle] = useState('');
  const { isPadPX } = useCommonState();

  const handleClick = useCallback(() => {
    if (!isPadPX) {
      return;
    }
    // set tip message: Processing  Failed
    switch (status) {
      case TOrderStatus.Processing:
        setTipMessage(ProcessingTipMessage + network);
        setTitle(TRecordsStatusI18n.Processing);
        break;
      case TOrderStatus.Failed:
        setTipMessage(FailedTipMessage);
        setTitle(TRecordsStatusI18n.Failed);
        break;
      default:
        setTipMessage('');
        setTitle('');
        break;
    }
    setIsMobileOpenModal(true);
  }, [isPadPX, status, network]);

  const content = useMemo(() => {
    switch (status) {
      case TOrderStatus.Processing:
        return (
          <Tooltip title={!isPadPX && ProcessingTipMessage + network}>
            <div className={styles['status-box']} onClick={() => handleClick()}>
              <TimeFilled />
              <span className={styles.processing}>{TRecordsStatusI18n.Processing}</span>
              <QuestionMarkIcon />
            </div>
          </Tooltip>
        );
      case TOrderStatus.Succeed:
        return <div className={styles['status-box']}>{TRecordsStatusI18n.Succeed}</div>;
      case TOrderStatus.Failed:
        return (
          <Tooltip title={!isPadPX && FailedTipMessage} placement="top">
            <div className={styles['status-box']} onClick={() => handleClick()}>
              <CloseFilled />
              <span className={styles.failed}>{TRecordsStatusI18n.Failed}</span>
              <QuestionMarkIcon />
            </div>
          </Tooltip>
        );
      default:
        return null;
    }
  }, [status, handleClick, network, isPadPX]);

  return (
    <div className={styles['status-wrapper']}>
      {content}
      <CommonModal
        width={'300px'}
        hideCancelButton={true}
        okText={'OK'}
        onOk={() => setIsMobileOpenModal(false)}
        title={title}
        open={isMobileOpenModal}
        onCancel={() => setIsMobileOpenModal(false)}>
        <div>{tipMessage}</div>
      </CommonModal>
    </div>
  );
}
