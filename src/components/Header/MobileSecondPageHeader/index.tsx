import clsx from 'clsx';
import styles from './styles.module.scss';
import { DownBigIcon } from 'assets/images';
import CommonSpace from 'components/CommonSpace';
import { useRouter } from 'next/navigation';

interface MobileSecondPageHeaderProps {
  title?: string;
  className?: string;
  onBack?: () => void;
}

export default function MobileSecondPageHeader({
  title,
  className,
  onBack,
}: MobileSecondPageHeaderProps) {
  const router = useRouter();
  return (
    <div
      className={clsx('flex-row-center-between', styles['mobile-second-page-header'], className)}>
      <div onClick={onBack || router.back}>
        <DownBigIcon className={styles['header-back']} />
      </div>

      <span className={clsx('text-center', styles['header-title'])}>{title}</span>
      <CommonSpace direction="horizontal" size={20} />
    </div>
  );
}
