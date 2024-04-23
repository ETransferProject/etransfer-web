import styles from './styles.module.scss';
import clsx from 'clsx';
import { EmptyBox } from 'assets/images';

type EmptyDataBoxProps = {
  emptyText?: string;
};

export default function EmptyDataBox({ emptyText = 'No found' }: EmptyDataBoxProps) {
  return (
    <div className={clsx(styles['emptyDataBox'])}>
      <EmptyBox />
      {emptyText}
    </div>
  );
}
