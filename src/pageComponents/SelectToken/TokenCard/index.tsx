import clsx from 'clsx';
import styles from './styles.module.scss';
import CommonImage from 'components/CommonImage';
import { useEffect, useState } from 'react';
interface TokenCardProps {
  icon: string;
  name: string;
  className?: string;
  isDisabled?: boolean;
  symbol: string;
  type?: string;
  open: boolean;
  onClick: () => void;
}

export function TokenCardForMobile({
  className,
  name,
  symbol,
  icon,
  isDisabled = false,
  open,
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
      <SelectImage icon={icon} open={open} symbol={symbol} />
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
  open,
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
      <SelectImage icon={icon} open={open} symbol={symbol} />
      <span className={styles['token-card-name']}>{symbol}</span>
      <span className={styles['token-card-symbol']}>{name}</span>
    </div>
  );
}

export function SelectImage({
  icon,
  open,
  symbol,
}: {
  icon: string;
  open: boolean;
  symbol: string;
}) {
  const [showIcon, setShowIcon] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (open && !isSuccess) {
      setShowIcon(true);
    }
  }, [isSuccess, open]);

  return (
    <>
      {showIcon && icon ? (
        <CommonImage
          src={icon}
          alt="token"
          className={styles['token-card-icon']}
          onLoad={() => {
            setIsSuccess(true);
          }}
          onError={() => setShowIcon(false)}
        />
      ) : (
        <div className={clsx(styles['token-card-defaultIcon'], styles['token-card-icon'])}>
          {symbol.charAt(0)}
        </div>
      )}
    </>
  );
}
