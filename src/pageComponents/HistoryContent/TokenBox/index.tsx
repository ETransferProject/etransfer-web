import clsx from 'clsx';
import { SelectImage } from 'components/SelectToken/TokenCard';
import { formatSymbolDisplay } from 'utils/format';
import styles from './styles.module.scss';

interface ITokenBoxProps {
  className?: string;
  icon: string;
  symbol: string;
}

export default function TokenBox({ className, icon, symbol }: ITokenBoxProps) {
  return (
    <div className={clsx('flex-row-center', styles['token-box'], className)}>
      <SelectImage
        className={styles['token-box-icon']}
        defaultIconClassName={styles['token-box-default-icon']}
        size={16}
        icon={icon}
        open
        symbol={formatSymbolDisplay(symbol)}
      />
      <span>{formatSymbolDisplay(symbol)}</span>
    </div>
  );
}
