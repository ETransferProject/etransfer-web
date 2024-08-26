import { ArrowRight, InfoLineIcon } from 'assets/images';
import styles from './styles.module.scss';
import clsx from 'clsx';

interface CommonWarningTipProps {
  content: string;
  isShowPrefix?: boolean;
  isShowSuffix?: boolean;
  className?: string;
  borderRadius?: number;
  onClick?: () => void;
}

export default function CommonWarningTip({
  content,
  isShowPrefix = true,
  isShowSuffix = true,
  className,
  borderRadius = 8,
  onClick,
}: CommonWarningTipProps) {
  return (
    <div
      className={clsx('flex-row-center', styles['common-warning-tip'], className)}
      style={{ borderRadius: borderRadius }}
      onClick={onClick}>
      <div className={clsx('flex-row-center', 'flex-1')}>
        {isShowPrefix && <InfoLineIcon className="flex-shrink-0" />}
        <span className={styles['common-warning-tip-content']}>{content}</span>
      </div>
      {isShowSuffix && <ArrowRight className="flex-shrink-0" />}
    </div>
  );
}
