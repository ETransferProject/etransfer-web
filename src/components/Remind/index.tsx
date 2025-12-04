import clsx from 'clsx';
import styles from './styles.module.scss';
import { InfoBrandIcon } from 'assets/images';

export enum RemindType {
  BRAND = 'brand',
  INFO = 'info',
  WARNING = 'warning',
}

export default function Remind({
  className,
  iconClassName,
  isShowIcon = true,
  isCard = true,
  isBorder = true,
  type = RemindType.BRAND,
  children,
}: {
  className?: string;
  iconClassName?: string;
  isShowIcon?: boolean;
  isCard?: boolean;
  isBorder?: boolean;
  type?: RemindType;
  children: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        isCard ? styles['remind-card'] : styles['remind-text'],
        isBorder && styles['remind-border'],
        styles[`remind-${type}`],
        className,
      )}>
      {isShowIcon && (
        <InfoBrandIcon className={clsx('flex-shrink-0', styles['icon'], iconClassName)} />
      )}
      <div className={styles['text']}>{children}</div>
    </div>
  );
}
