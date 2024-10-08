import { CommonModalProps } from 'components/CommonModal';
import styles from './styles.module.scss';
import CommonModalTip from 'components/Tips/CommonModalTip';
import { GOT_IT } from 'constants/misc';

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
    <CommonModalTip
      className={styles.simpleTipModal}
      footerClassName={styles.simpleTipModalFooter}
      getContainer={getContainer}
      open={open}
      closable={false}
      okText={GOT_IT}
      onOk={onOk}>
      <div className={styles.simpleTipModalBody}>{content}</div>
    </CommonModalTip>
  );
}
