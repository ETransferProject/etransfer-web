import { useMemo } from 'react';
import styles from './styles.module.scss';
import moment from 'moment';

type TimeProps = {
  time: number;
};

export default function Time({ time }: TimeProps) {
  const currentTime = useMemo(() => new Date(), []);
  const currentTimestamp = useMemo(() => moment(currentTime).valueOf(), [currentTime]);

  const formatTime = useMemo(() => {
    const timeDaysDiff = moment(currentTimestamp).diff(moment(time), 'days');
    if (timeDaysDiff > 0) {
      return moment(time).format('MMM D, YYYY hh:mm:ss');
    } else {
      const timeHourDiff = moment(currentTimestamp).diff(moment(time), 'hours');
      if (timeHourDiff > 0) {
        return `${timeHourDiff} hours ago`;
      } else {
        const timeMinDiff = moment(currentTimestamp).diff(moment(time), 'minutes');
        if (timeMinDiff > 0) {
          return `${timeMinDiff} minutes ago`;
        } else {
          return `just now`;
        }
      }
    }
  }, [currentTimestamp, time]);

  return <div className={styles['time']}>{formatTime}</div>;
}
