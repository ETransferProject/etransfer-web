import styles from './styles.module.scss';
import clsx from 'clsx';
import { EmptyBox } from 'assets/images';

type TEmptyDataBoxProps = {
  emptyText?: string;
};

export default function EmptyDataBox({ emptyText = 'No found' }: TEmptyDataBoxProps) {
  return (
    <div className={clsx(styles['empty-data-box'])}>
      <EmptyBox />
      {emptyText}
    </div>
  );
}
