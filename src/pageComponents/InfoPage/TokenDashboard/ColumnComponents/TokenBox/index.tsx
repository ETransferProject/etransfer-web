import styles from './styles.module.scss';
import clsx from 'clsx';
import { useCommonState } from 'store/Provider/hooks';
import { useMemo } from 'react';
import { formatSymbolDisplay } from 'utils/format';
import DisplayImage from 'components/DisplayImage';

type TTokenBoxProps = {
  symbol: string;
  icon: string;
  className?: string;
  iconClassName?: string;
  nameClassName?: string;
  size?: number;
};

export default function TokenBox({
  symbol,
  icon,
  className,
  iconClassName,
  nameClassName,
  size = 24,
}: TTokenBoxProps) {
  const { isPadPX } = useCommonState();
  const symbolFormat = useMemo(() => formatSymbolDisplay(symbol), [symbol]);

  return (
    <div
      className={clsx(
        'flex-row-center',
        isPadPX ? styles['mobil-token-container'] : styles['web-token-container'],
        className,
      )}>
      <DisplayImage
        width={size}
        height={size}
        name={symbolFormat}
        src={icon}
        alt={`${symbolFormat}-logo`}
        className={iconClassName}
      />
      <span className={clsx(styles['token-symbol'], nameClassName)}>{symbolFormat}</span>
    </div>
  );
}
