import styles from './styles.module.scss';

export interface VolumeProps {
  count: string;
  unit: string;
}

export default function Volume({ count, unit }: VolumeProps) {
  return <div className={styles['volume-container']}>{`${count} ${unit}`}</div>;
}
