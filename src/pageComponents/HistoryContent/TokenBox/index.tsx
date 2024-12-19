import clsx from 'clsx';
import DisplayImage from 'components/DisplayImage';
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
      <DisplayImage
        className={styles['token-box-icon']}
        defaultIconClassName={styles['token-box-default-icon']}
        width={16}
        height={16}
        src={icon}
        name={formatSymbolDisplay(symbol)}
      />
      <span>{formatSymbolDisplay(symbol)}</span>
    </div>
  );
}
