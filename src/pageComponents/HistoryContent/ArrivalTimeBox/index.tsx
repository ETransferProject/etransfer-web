import { useMemo } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { TRecordsStatus } from 'types/records';
import moment from 'moment';
import { useCommonState } from 'store/Provider/hooks';
import { defaultNullValue } from 'constants/index';

type TArrivalTimeBoxProps = {
  arrivalTime: number;
  status: string;
};

export default function ArrivalTimeBox({ arrivalTime, status }: TArrivalTimeBoxProps) {
  const { isMobilePX } = useCommonState();

  const content = useMemo(() => {
    const yearMonthDay = moment(arrivalTime).format('YYYY-MM-DD');
    const hourMinuteSecond = moment(arrivalTime).format('HH:mm:ss');
    const now = moment();
    const targetTime = moment(arrivalTime);
    const minutes = targetTime.diff(now, 'minutes');
    switch (status) {
      case TRecordsStatus.Processing:
        return (
          <>
            {minutes > 0 ? (
              <span>{`~ in ${minutes} ${minutes === 1 ? 'min' : 'mins'}`}</span>
            ) : (
              'Arriving soon'
            )}
          </>
        );
      case TRecordsStatus.Failed:
        return defaultNullValue;
      case TRecordsStatus.Succeed:
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
        isMobilePX ? styles['mobile-arrival-time-box'] : styles['web-arrival-time-box'],
      )}>
      {content}
    </div>
  );
}
