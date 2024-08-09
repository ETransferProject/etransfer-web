import clsx from 'clsx';
import ExclamationFilledIcon from 'assets/images/exclamationFilled.svg';
import CommonModalSwitchDrawer, {
  CommonModalSwitchDrawerProps,
} from 'components/CommonModalSwitchDrawer';
import styles from './styles.module.scss';
import { GOT_IT } from 'constants/misc';

interface FailModalProps {
  failReason: string;
  modalProps: CommonModalSwitchDrawerProps;
}

export default function FailModal({ failReason, modalProps }: FailModalProps) {
  return (
    <CommonModalSwitchDrawer {...modalProps} hideCancelButton okText={GOT_IT}>
      <div className={clsx('flex-column', styles['container'])}>
        <div className={clsx('flex-column-center', styles['title-wrapper'])}>
          <div className={clsx('flex-center', styles['title-icon'])}>
            <ExclamationFilledIcon />
          </div>
          <div className={styles['title']}>Transaction Failed</div>
        </div>
        <div className={styles['fail-reason']}>{failReason}</div>
      </div>
    </CommonModalSwitchDrawer>
  );
}
