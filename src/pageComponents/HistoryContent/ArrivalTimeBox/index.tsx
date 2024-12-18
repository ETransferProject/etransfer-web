import { useMemo } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { TOrderStatus } from 'types/records';
import moment from 'moment';
import { useCommonState } from 'store/Provider/hooks';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import { DATE_FORMATE } from 'constants/misc';

type TArrivalTimeBoxProps = {
  arrivalTime: number;
  status: string;
};

export default function ArrivalTimeBox({ arrivalTime, status }: TArrivalTimeBoxProps) {
  const { isPadPX } = useCommonState();

  const content = useMemo(() => {
    const yearMonthDay = moment(arrivalTime).format(DATE_FORMATE);
    const hourMinuteSecond = moment(arrivalTime).format('HH:mm:ss');
    const now = moment();
    const targetTime = moment(arrivalTime);
    const minutes = targetTime.diff(now, 'minutes');
    switch (status) {
      case TOrderStatus.Processing:
        return (
          <>
            {minutes > 0 ? (
              <span>{`~ in ${minutes} ${minutes === 1 ? 'min' : 'mins'}`}</span>
            ) : (
              'Arriving soon'
            )}
          </>
        );
      case TOrderStatus.Failed:
        return DEFAULT_NULL_VALUE;
      case TOrderStatus.Succeed:
        return (
          <div className={clsx(styles['year-hour-wrapper'])}>
            <span className={styles['year']}>{yearMonthDay}</span>
            &nbsp;
            <span className={styles['hour']}>{hourMinuteSecond}</span>
          </div>
        );
      default:
        return null;
    }
  }, [arrivalTime, status]);

  return (
    <div
      className={clsx(
        styles['arrival-time-box'],
        isPadPX ? styles['mobile-arrival-time-box'] : styles['web-arrival-time-box'],
      )}>
      {content}
    </div>
  );
}
