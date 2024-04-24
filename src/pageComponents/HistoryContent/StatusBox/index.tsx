import styles from './styles.module.scss';
import { CloseFilled, TimeFilled, QuestionMarkIcon } from 'assets/images';
import { useCallback, useMemo, useState } from 'react';
import { RecordsStatus, RecordsStatusI18n } from 'types/records';
import { useCommonState } from 'store/Provider/hooks';
import CommonModal from 'components/CommonModal';
import { Tooltip } from 'antd';
import { ProcessingTipMessage, FailedTipMessage } from 'constants/records';
import { SupportedELFChainId } from 'constants/index';

type StatusBoxProps = {
  status: string;
  address: string;
  network: string;
  fromChainId: SupportedELFChainId;
  toChainId: SupportedELFChainId;
  orderType: string;
};

export default function StatusBox({ status, network }: StatusBoxProps) {
  const [isMobildOpenModal, setIsMobildOpenModal] = useState(false);
  const [tipMessage, setTipMessage] = useState('');
  const [title, setTitle] = useState('');
  const { isMobilePX } = useCommonState();

  const handleClick = useCallback(() => {
    if (!isMobilePX) {
      return;
    }
    // set tip message: Processing  Failed
    switch (status) {
      case RecordsStatus.Processing:
        setTipMessage(ProcessingTipMessage + network);
        break;
      case RecordsStatus.Failed:
        setTipMessage(FailedTipMessage);
        break;
      default:
        setTipMessage('');
        break;
    }
    setTitle(status);
    setIsMobildOpenModal(true);
  }, [isMobilePX, status, network]);

  const content = useMemo(() => {
    switch (status) {
      case RecordsStatus.Processing:
        return (
          <Tooltip title={ProcessingTipMessage + network}>
            <div className={styles['status-box']} onClick={() => handleClick()}>
              <TimeFilled />
              <span className={styles.processing}>{RecordsStatusI18n.Processing}</span>
              <QuestionMarkIcon />
            </div>
          </Tooltip>
        );
      case RecordsStatus.Succeed:
        return <div className={styles['status-box']}>{RecordsStatusI18n.Succeed}</div>;
      case RecordsStatus.Failed:
        return (
          <Tooltip title={FailedTipMessage} placement="top">
            <div className={styles['status-box']} onClick={() => handleClick()}>
              <CloseFilled />
              <span className={styles.failed}>{RecordsStatusI18n.Failed}</span>
              <QuestionMarkIcon />
            </div>
          </Tooltip>
        );
      default:
        return null;
    }
  }, [status, handleClick, network]);

  return (
    <div className={styles['status-wrapper']}>
      {content}
      <CommonModal
        width={'300px'}
        hideCancelButton={true}
        okText={'OK'}
        onOk={() => setIsMobildOpenModal(false)}
        title={title}
        open={isMobildOpenModal}
        onCancel={() => setIsMobildOpenModal(false)}>
        <div className={styles['tip-message-box']}>{tipMessage}</div>
      </CommonModal>
    </div>
  );
}
