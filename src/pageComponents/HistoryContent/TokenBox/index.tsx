import styles from './styles.module.scss';
import clsx from 'clsx';
import { USDTToken, SGRToken } from 'assets/images';
import { TokenType } from 'constants/index';
import { useCommonState } from 'store/Provider/hooks';
import { useCallback } from 'react';
import { formatSymbolDisplay } from 'utils/format';

type TTokenBoxProps = {
  symbol: string;
};

export default function TokenBox({ symbol }: TTokenBoxProps) {
  const { isPadPX } = useCommonState();

  const tokenIcon = useCallback(() => {
    switch (symbol) {
      case TokenType.USDT:
        return <USDTToken className={styles['token-icon']} />;
      case TokenType.SGR:
        return <SGRToken className={styles['token-icon']} />;
      default:
        return (
          <div className={clsx('row-center', styles['token-icon'], styles['word-symbol'])}>
            {symbol?.charAt(0).toUpperCase()}
          </div>
        );
    }
  }, [symbol]);

  return (
    <div
      className={clsx(
        styles['token-box'],
        isPadPX ? styles['mobil-token-box'] : styles['web-token-box'],
      )}>
      {tokenIcon()}
      <span className={clsx(styles['token'])}>{formatSymbolDisplay(symbol)}</span>
    </div>
  );
}
