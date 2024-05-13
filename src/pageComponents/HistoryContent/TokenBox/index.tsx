import styles from './styles.module.scss';
import clsx from 'clsx';
import { USDTToken, SGRToken } from 'assets/images';
import { TTokenType } from 'types';
import { useCommonState } from 'store/Provider/hooks';
import { useCallback } from 'react';
import { formatSymbolDisplay } from 'utils/format';

type TokenBoxProps = {
  symbol: string;
};

export default function TokenBox({ symbol }: TokenBoxProps) {
  const { isMobilePX } = useCommonState();

  const tokenIcon = useCallback(() => {
    switch (symbol) {
      case TTokenType.USDT:
        return <USDTToken className={styles['token-icon']} />;
      case TTokenType.SGR:
        return <SGRToken className={styles['token-icon']} />;
      default:
        return (
          <div className={clsx(styles['token-icon'], styles['word-symbol'])}>
            {symbol?.charAt(0).toUpperCase()}
          </div>
        );
    }
  }, [symbol]);

  return (
    <div
      className={clsx(
        styles['token-box'],
        isMobilePX ? styles['mobil-token-box'] : styles['web-token-box'],
      )}>
      {tokenIcon()}
      <span className={clsx(styles['token'])}>{formatSymbolDisplay(symbol)}</span>
    </div>
  );
}
