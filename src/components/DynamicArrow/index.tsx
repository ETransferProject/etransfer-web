import { DownBigIcon, DownIcon, DownSmallIcon } from 'assets/images';
import styles from './styles.module.scss';
import clsx from 'clsx';

type TDynamicArrow = {
  className?: string;
  iconClassName?: string;
  isExpand?: boolean;
  size?: 'Big' | 'Normal' | 'Small';
};

export default function DynamicArrow({
  className,
  iconClassName,
  isExpand = false,
  size = 'Normal',
}: TDynamicArrow) {
  return (
    <span
      className={clsx(
        'flex-center',
        styles['dynamic-arrow'],
        {
          [styles['dynamic-arrow-big']]: size === 'Big',
          [styles['dynamic-arrow-small']]: size === 'Small',
        },
        className,
      )}>
      {size === 'Big' && (
        <DownBigIcon
          className={clsx(
            styles['dynamic-arrow-icon'],
            isExpand && styles['dynamic-arrow-icon-rotate'],
            iconClassName,
          )}
        />
      )}
      {size === 'Small' && (
        <DownSmallIcon
          className={clsx(
            styles['dynamic-arrow-icon'],
            isExpand && styles['dynamic-arrow-icon-rotate'],
            iconClassName,
          )}
        />
      )}
      {size === 'Normal' && (
        <DownIcon
          className={clsx(
            styles['dynamic-arrow-icon'],
            isExpand && styles['dynamic-arrow-icon-rotate'],
            iconClassName,
          )}
        />
      )}
    </span>
  );
}
