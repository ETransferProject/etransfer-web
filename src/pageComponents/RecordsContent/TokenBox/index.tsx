import styles from './styles.module.scss';
import clsx from 'clsx';
import { USDTToken, SGRToken } from 'assets/images';
import { TokenType } from 'types';
import { useCommonState } from 'store/Provider/hooks';

type TokenBoxProps = {
  symbol: string;
};

export default function TokenBox({ symbol }: TokenBoxProps) {
  const { isMobilePX } = useCommonState();

  return (
    <div
      className={clsx(
        styles['tokenBox'],
        isMobilePX ? styles['mobil-tokenBox'] : styles['web-tokenBox'],
      )}>
      {symbol === TokenType.USDT && <USDTToken className={styles['token-icon']} />}
      {symbol === TokenType.SGR && <SGRToken className={styles['token-icon']} />}
      <span className={clsx(styles['token'])}>{symbol}</span>
    </div>
  );
}
