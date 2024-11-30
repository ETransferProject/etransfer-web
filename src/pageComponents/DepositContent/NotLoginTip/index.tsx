import { InfoBrandIcon } from 'assets/images';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { CONNECT_AELF_WALLET, UNLOCK } from 'constants/wallet/index';
import useAelf, { useLogin } from 'hooks/wallet/useAelf';

export default function NotLoginTip({
  isShowIcon = true,
  isCard = true,
}: {
  isShowIcon?: boolean;
  isCard?: boolean;
}) {
  const { isConnected, isLocking } = useAelf();
  const handleLogin = useLogin();

  if (isConnected) return null;

  return (
    <div
      className={clsx(
        'flex-row-center',
        isCard ? styles['not-login-tip-card'] : styles['not-login-tip-text'],
      )}>
      {isShowIcon && <InfoBrandIcon className="flex-shrink-0" />}
      <span className={styles['text']}>
        <span>{`Please `}</span>
        <span className={styles['action']} onClick={handleLogin}>
          {isLocking ? UNLOCK : CONNECT_AELF_WALLET.toLocaleLowerCase()}
        </span>
        <span>{` to get the deposit address.`}</span>
      </span>
    </div>
  );
}
