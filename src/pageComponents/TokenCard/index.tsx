import clsx from 'clsx';
import styles from './styles.module.scss';
import tokenDefault from 'assets/images/tokenDefault.svg';
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
  icon = tokenDefault,
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
      <CommonImage src={icon} alt="token" className={styles['token-card-icon']} />
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
      <CommonImage src={icon} alt="token" className={styles['token-card-icon']} />
      <span className={styles['token-card-name']}>{symbol}</span>
      <span className={styles['token-card-symbol']}>{name}</span>
    </div>
  );
}
