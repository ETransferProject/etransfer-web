import clsx from 'clsx';
import styles from './styles.module.scss';
import CommonImage from 'components/CommonImage';
import { useEffect, useState } from 'react';
import { formatSymbolDisplay } from 'utils/format';
import { SupportedELFChainId } from 'constants/index';
import { BalanceAndUSD } from '../BalanceAndUSD';

interface TokenCardProps {
  icon: string;
  name: string;
  className?: string;
  isDisabled?: boolean;
  symbol: string;
  open: boolean;
  isShowBalance?: boolean;
  decimals?: string | number;
  chainId?: SupportedELFChainId;
  onClick: () => void;
}

export function TokenCardForMobile({
  className,
  name,
  symbol,
  icon,
  isDisabled = false,
  open,
  isShowBalance,
  decimals,
  chainId,
  onClick,
}: TokenCardProps) {
  return (
    <div
      className={clsx(
        'flex-row-center-between',
        styles['token-card-for-mobile'],
        styles['token-card-for-web-hover'],
        isDisabled && styles['token-card-disabled'],
        className,
      )}
      onClick={onClick}>
      <div className="flex-row-center">
        <SelectImage icon={icon} open={open} symbol={formatSymbolDisplay(symbol)} />
        <span className={styles['token-card-name']}>{formatSymbolDisplay(symbol)}</span>
        <span className={styles['token-card-symbol']}>{name}</span>
      </div>
      {open && isShowBalance && decimals && chainId && (
        <BalanceAndUSD symbol={symbol} decimals={decimals} chainId={chainId} />
      )}
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
  isShowBalance,
  decimals,
  chainId,
  onClick,
}: TokenCardProps) {
  return (
    <div
      className={clsx(
        'flex-row-center-between',
        styles['token-card-for-web'],
        styles['token-card-for-web-hover'],
        isDisabled && styles['token-card-disabled'],
        className,
      )}
      onClick={onClick}>
      <div className="flex-row-center">
        <SelectImage icon={icon} open={open} symbol={formatSymbolDisplay(symbol)} />
        <span className={styles['token-card-name']}>{formatSymbolDisplay(symbol)}</span>
        <span className={styles['token-card-symbol']}>{name}</span>
      </div>
      {open && isShowBalance && decimals && chainId && (
        <BalanceAndUSD symbol={symbol} decimals={decimals} chainId={chainId} />
      )}
    </div>
  );
}

export function SelectImage({
  className,
  defaultIconClassName,
  icon,
  open,
  symbol,
  size = 24,
}: {
  className?: string;
  defaultIconClassName?: string;
  icon: string;
  open: boolean;
  symbol: string;
  size?: number;
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
          width={size}
          height={size}
          fill={false}
          className={clsx(
            styles['token-card-icon'],
            {
              [styles['token-card-icon-load']]: !isSuccess,
            },
            className,
          )}
          onLoad={() => {
            setIsSuccess(true);
          }}
          onError={() => setShowIcon(false)}
        />
      )}
      <div
        className={clsx(
          'row-center',
          styles['token-card-defaultIcon'],
          styles['token-card-icon'],
          {
            [styles['token-card-defaultIcon-none']]: showIcon && isSuccess,
          },
          defaultIconClassName,
        )}
        style={{ width: size, height: size, lineHeight: size + 'px' }}>
        {symbol.charAt(0)}
      </div>
    </>
  );
}
