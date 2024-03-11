import clsx from 'clsx';
import styles from './styles.module.scss';
import CommonImage from 'components/CommonImage';

interface TokenCardProps {
  icon: string;
  name: string;
  className?: string;
  isDisabled?: boolean;
  symbol: string;
  type?: string;
  onClick: () => void;
}

export function TokenCardForMobile({
  className,
  name,
  symbol,
  icon,
  isDisabled = false,
  onClick,
}: TokenCardProps) {
  return (
    <div
      className={clsx(
        styles['token-card-for-mobile'],
        isDisabled && styles['token-card-disabled'],
        className,
      )}
      onClick={onClick}>
      {icon ? (
        <CommonImage src={icon} alt="token" className={styles['token-card-icon']} />
      ) : (
        <div className={clsx(styles['token-card-defaultIcon'], styles['token-card-icon'])}>
          {symbol.charAt(0)}
        </div>
      )}
      <span className={styles['token-card-name']}>{symbol}</span>
      <span className={styles['token-card-symbol']}>{name}</span>
    </div>
  );
}

export function TokenCardForWeb({
  className,
  icon,
  name,
  symbol,
  isDisabled = false,
  onClick,
}: TokenCardProps) {
  return (
    <div
      className={clsx(
        'flex',
        styles['token-card-for-web'],
        styles['token-card-for-web-hover'],
        isDisabled && styles['token-card-disabled'],
        className,
      )}
      onClick={onClick}>
      {icon ? (
        <CommonImage src={icon} alt="token" className={styles['token-card-icon']} />
      ) : (
        <div className={clsx(styles['token-card-defaultIcon'], styles['token-card-icon'])}>
          {symbol.charAt(0)}
        </div>
      )}
      <span className={styles['token-card-name']}>{symbol}</span>
      <span className={styles['token-card-symbol']}>{name}</span>
    </div>
  );
}
