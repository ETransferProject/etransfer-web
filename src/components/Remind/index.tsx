import clsx from 'clsx';
import styles from './styles.module.scss';
import { InfoBrandIcon } from 'assets/images';

export default function Remind({
  className,
  iconClassName,
  isShowIcon = true,
  isCard = true,
  isBorder = true,
  isBrand = true,
  children,
}: {
  className?: string;
  iconClassName?: string;
  isShowIcon?: boolean;
  isCard?: boolean;
  isBorder?: boolean;
  isBrand?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        isCard ? styles['remind-card'] : styles['remind-text'],
        isBorder && styles['remind-border'],
        isBrand && styles['remind-brand'],
        className,
      )}>
      {isShowIcon && (
        <InfoBrandIcon className={clsx('flex-shrink-0', styles['icon'], iconClassName)} />
      )}
      <div className={styles['text']}>{children}</div>
    </div>
  );
}
