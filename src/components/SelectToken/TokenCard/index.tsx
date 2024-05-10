import clsx from 'clsx';
import styles from './styles.module.scss';
import CommonImage from 'components/CommonImage';
import { useEffect, useState } from 'react';
import { formatSymbolDisplay } from 'utils/format';
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
        styles['token-card-for-web-hover'],
        isDisabled && styles['token-card-disabled'],
        className,
      )}
      onClick={onClick}>
      <SelectImage icon={icon} open={open} symbol={formatSymbolDisplay(symbol)} />
      <span className={styles['token-card-name']}>{formatSymbolDisplay(symbol)}</span>
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
      <SelectImage icon={icon} open={open} symbol={formatSymbolDisplay(symbol)} />
      <span className={styles['token-card-name']}>{formatSymbolDisplay(symbol)}</span>
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
      {showIcon && icon && (
        <CommonImage
          loading="eager"
          src={icon}
          alt="token"
          width={24}
          height={24}
          fill={false}
          className={clsx(styles['token-card-icon'], {
            [styles['token-card-icon-load']]: !isSuccess,
          })}
          onLoad={() => {
            setIsSuccess(true);
          }}
          onError={() => setShowIcon(false)}
        />
      )}
      <div
        className={clsx(styles['token-card-defaultIcon'], styles['token-card-icon'], {
          [styles['token-card-defaultIcon-none']]: showIcon && isSuccess,
        })}>
        {symbol.charAt(0)}
      </div>
    </>
  );
}
