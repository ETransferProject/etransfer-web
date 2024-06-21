import { CommonModalProps } from 'components/CommonModal';
import styles from './styles.module.scss';
import CommonModalTips from 'components/CommonModalTips';

export type TSimpleTipModalProps = {
  open?: boolean;
  content: string;
  getContainer: CommonModalProps['getContainer'];
  onOk?: () => void;
};

export default function SimpleTipModal({
  open = false,
  content,
  getContainer,
  onOk,
}: TSimpleTipModalProps) {
  return (
    <CommonModalTips
      className={styles.simpleTipModal}
      footerClassName={styles.simpleTipModalFooter}
      getContainer={getContainer}
      open={open}
      closable={false}
      okText="OK"
      onOk={onOk}>
      <div className={styles.simpleTipModalBody}>{content}</div>
    </CommonModalTips>
  );
}
