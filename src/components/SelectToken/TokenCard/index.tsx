import clsx from 'clsx';
import styles from './styles.module.scss';
import { formatSymbolDisplay } from 'utils/format';
import { SupportedELFChainId } from 'constants/index';
import { BalanceAndUSD } from '../BalanceAndUSD';
import DisplayImage from 'components/DisplayImage';

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
        <DisplayImage src={icon} name={formatSymbolDisplay(symbol)} />
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
        <DisplayImage src={icon} name={formatSymbolDisplay(symbol)} />
        <span className={styles['token-card-name']}>{formatSymbolDisplay(symbol)}</span>
        <span className={styles['token-card-symbol']}>{name}</span>
      </div>
      {open && isShowBalance && decimals && chainId && (
        <BalanceAndUSD symbol={symbol} decimals={decimals} chainId={chainId} />
      )}
    </div>
  );
}
