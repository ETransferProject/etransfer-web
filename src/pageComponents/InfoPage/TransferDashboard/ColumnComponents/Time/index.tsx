import styles from './styles.module.scss';
import { formatTime } from '../../utils';

type TimeProps = {
  time: number;
};

export default function Time({ time }: TimeProps) {
  return <div className={styles['time']}>{formatTime(time)}</div>;
}
