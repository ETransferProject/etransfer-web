import { useMemo } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { RecordsStatus } from 'types/records';
import moment from 'moment';
import { useCommonState } from 'store/Provider/hooks';

type ArrivalTimeBoxProps = {
  arrivalTime: number;
  status: string;
};

export default function ArrivalTimeBox({ arrivalTime, status }: ArrivalTimeBoxProps) {
  const { isMobilePX } = useCommonState();

  const content = useMemo(() => {
    const yearMonthDay = moment(arrivalTime).format('YYYY-MM-DD');
    const hourMinuteSecond = moment(arrivalTime).format('HH:mm:ss');
    const now = moment();
    const targetTime = moment(arrivalTime);
    const minutes = targetTime.diff(now, 'minutes');
    switch (status) {
      case RecordsStatus.Processing:
        return (
          <>
            {minutes > 0 ? (
              <span>
                ~ in {minutes} {minutes === 1 ? 'min' : 'mins'}
              </span>
            ) : (
              'Arriving soon'
            )}
          </>
        );
      case RecordsStatus.Failed:
        return '--';
      case RecordsStatus.Succeed:
        return (
          <div className={clsx(styles['year-hour-wrapper'])}>
            <span className={styles['year']}>{yearMonthDay}</span>
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
        styles['arrivalTimeBox'],
        isMobilePX ? styles['mobile-arrivalTimeBox'] : styles['web-arrivalTimeBox'],
      )}>
      {content}
    </div>
  );
}
