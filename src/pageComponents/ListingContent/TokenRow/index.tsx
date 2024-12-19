import clsx from 'clsx';
import DisplayImage from 'components/DisplayImage';
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
      <DisplayImage
        className={styles['token-logo']}
        width={20}
        height={20}
        src={icon}
        name={formatSymbolDisplay(symbol)}
      />
      <span className={styles['token-symbol']}>{formatSymbolDisplay(symbol)}</span>
      <span className={styles['token-name']}>{name}</span>
    </div>
  );
}
