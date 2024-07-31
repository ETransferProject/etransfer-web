import { InfoBrandIcon } from 'assets/images';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { LOGIN, UNLOCK } from 'constants/wallet';
import { useIsLogin, useLogin } from 'hooks/wallet';

export default function NotLoginTip({
  isShowIcon = true,
  isCard = true,
}: {
  isShowIcon?: boolean;
  isCard?: boolean;
}) {
  const { isLocking } = useConnectWallet();
  const isLogin = useIsLogin();
  const handleLogin = useLogin();

  if (isLogin) return null;

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
          {isLocking ? UNLOCK : LOGIN}
        </span>
        <span>{` to get the deposit address.`}</span>
      </span>
    </div>
  );
}
