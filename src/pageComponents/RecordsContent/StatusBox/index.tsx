import styles from './styles.module.scss';
import { CloseFilled, TimeFilled, QuestionMarkIcon } from 'assets/images';
import { useCallback, useMemo, useState } from 'react';
import { RecordsStatus } from 'types/records';
import { useCommonState } from 'store/Provider/hooks';
import CommonModal from 'components/CommonModal';
import { Tooltip } from 'antd';
import { ProcessingTipMessage, FailedTipMessage } from 'constants/records';
import { SupportedELFChainId } from 'constants/index';
import { BitNetworkType } from 'constants/network';
import { useAccounts } from 'hooks/portkeyWallet';

type StatusBoxProps = {
  status: string;
  address: string;
  network: string;
  fromChanId: SupportedELFChainId;
  toChanId: SupportedELFChainId;
  orderType: string;
};

export default function StatusBox({
  status,
  address,
  network,
  fromChanId,
  toChanId,
  orderType,
}: StatusBoxProps) {
  const [isMobildOpenModal, setIsMobildOpenModal] = useState(false);
  const [tipMessage, setTipMessage] = useState('');
  const [title, setTitle] = useState('');
  const { isMobilePX } = useCommonState();
  const accounts = useAccounts();

  const calcAddress = useCallback(() => {
    if (network === BitNetworkType.AELF && !address) {
      let chanId: SupportedELFChainId = orderType === 'Deposit' ? toChanId : fromChanId;
      chanId = chanId ?? SupportedELFChainId.AELF;
      if (accounts && accounts[chanId] && accounts[chanId]?.[0]) {
        return accounts[chanId]?.[0] || '--';
      }
      return '--';
    }
    return address;
  }, [network, address, accounts, orderType, toChanId, fromChanId]);

  const handleClick = useCallback(() => {
    if (!isMobilePX) {
      return;
    }
    // set tip message: Processing  Failed
    switch (status) {
      case RecordsStatus.Processing:
        setTipMessage(`${ProcessingTipMessage + ' : ' + calcAddress()}`);
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
  }, [isMobilePX, status, calcAddress]);

  const content = useMemo(() => {
    switch (status) {
      case RecordsStatus.Processing:
        return (
          <Tooltip title={`${ProcessingTipMessage + ' : ' + calcAddress()}`}>
            <div className={styles['status-box']} onClick={() => handleClick()}>
              <TimeFilled />
              <span className={styles.processing}>{RecordsStatus.Processing}</span>
              <QuestionMarkIcon />
            </div>
          </Tooltip>
        );
      case RecordsStatus.Succeed:
        return <div className={styles['status-box']}>{RecordsStatus.Succeed}</div>;
      case RecordsStatus.Failed:
        return (
          <Tooltip title={FailedTipMessage} placement="top">
            <div className={styles['status-box']} onClick={() => handleClick()}>
              <CloseFilled />
              <span className={styles.failed}>{RecordsStatus.Failed}</span>
              <QuestionMarkIcon />
            </div>
          </Tooltip>
        );
      default:
        return null;
    }
  }, [status, handleClick]);

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
