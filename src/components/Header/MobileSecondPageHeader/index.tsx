import clsx from 'clsx';
import styles from './styles.module.scss';
import { DownBigIcon } from 'assets/images';
import CommonSpace from 'components/CommonSpace';

interface MobileSecondPageHeaderProps {
  title?: string;
  className?: string;
}

export default function MobileSecondPageHeader({ title, className }: MobileSecondPageHeaderProps) {
  return (
    <div
      className={clsx('flex-row-center-between', styles['mobile-second-page-header'], className)}>
      <DownBigIcon className={styles['header-back']} />
      <span className={clsx('text-center', styles['header-title'])}>{title}</span>
      <CommonSpace direction="horizontal" size={20} />
    </div>
  );
}
