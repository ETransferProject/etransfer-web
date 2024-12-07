import clsx from 'clsx';
import { SelectImage } from 'components/SelectToken/TokenCard';
import { formatSymbolDisplay } from 'utils/format';
import styles from './styles.module.scss';

interface ITokenRowProps {
  className?: string;
  symbol?: string;
  name?: string;
  icon?: string;
}

export default function TokenRow({ className, symbol = '', name = '', icon = '' }: ITokenRowProps) {
  return (
    <div className={clsx(styles['token-row'], className)}>
      <SelectImage
        className={styles['token-logo']}
        size={20}
        icon={icon}
        symbol={formatSymbolDisplay(symbol)}
        open
      />
      <span className={styles['token-symbol']}>{formatSymbolDisplay(symbol)}</span>
      <span className={styles['token-name']}>{name}</span>
    </div>
  );
}
