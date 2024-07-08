import styles from './styles.module.scss';

type TimeProps = {
  time: string;
};

export default function Time({ time }: TimeProps) {
  return <div className={styles['time']}>{time}</div>;
}
