import styles from './styles.module.scss';
import clsx from 'clsx';
import { EmptyBox } from 'assets/images';

export type TEmptyDataBoxProps = {
  emptyText?: string;
};

export default function EmptyDataBox({ emptyText = 'No found' }: TEmptyDataBoxProps) {
  return (
    <div className={clsx(styles['empty-data-box'])}>
      <EmptyBox />
      <span className={styles['empty-data-box-text']}>{emptyText}</span>
    </div>
  );
}
