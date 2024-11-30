import styles from './styles.module.scss';
import clsx from 'clsx';
import moment from 'moment';
import { useCommonState } from 'store/Provider/hooks';
import { DATE_FORMATE } from 'constants/misc';

type TCreateTimeBoxProps = {
  createTime: number;
};

export default function CreateTimeBox({ createTime }: TCreateTimeBoxProps) {
  const { isPadPX } = useCommonState();
  const yearMonthDay = moment(createTime).format(DATE_FORMATE);
  const hourMinuteSecond = moment(createTime).format('HH:mm:ss');

  return (
    <div
      className={clsx(
        styles['create-time-box'],
        isPadPX ? styles['mobile-create-time-box'] : styles['web-create-time-box'],
      )}>
      <div className={clsx(styles['year-hour-wrapper'])}>
        <span className={styles['year']}>{yearMonthDay}</span>
        &nbsp;
        <span className={styles['hour']}>{hourMinuteSecond}</span>
      </div>
    </div>
  );
}
