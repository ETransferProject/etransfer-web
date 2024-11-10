import { Logout } from 'assets/images';
import styles from '../styles.module.scss';
import clsx from 'clsx';
import { CONNECT_SOL_LIST_CONFIG } from 'constants/wallet/Solana';
import useSolana from 'hooks/wallet/useSolana';
import { useCallback } from 'react';
import { getOmittedStr } from '@etransfer/utils';
import Copy, { CopySize } from 'components/Copy';

export default function SolanaWalletList() {
  const { account, isConnected, connect, disconnect } = useSolana();

  const onConnect = useCallback(
    (name: any) => {
      connect(name);
    },
    [connect],
  );
  const onDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const renderAccount = useCallback((name: string) => {
    if (isConnected && account) {
      return (
        <div className="flex-column">
          <div className="flex-row-center gap-8">
            <span className={styles['wallet-list-item-name']}>{getOmittedStr(account, 5, 5)}</span>
            <Copy toCopy={account} size={CopySize.Small} />
          </div>
          <div className={styles['wallet-list-item-desc']}>{name}</div>
        </div>
      );
    }
    return <div className={styles['wallet-list-item-name']}>{name}</div>;
  }, []);

  return (
    <div>
      <div className={styles['wallet-list-title']}>{CONNECT_SOL_LIST_CONFIG.section}</div>
      {CONNECT_SOL_LIST_CONFIG.list.map((item) => {
        const Icon = item.icon;
        return (
          <div
            className={clsx('flex-row-center-between', styles['wallet-list-item'])}
            key={'solana-wallet-' + item.key}
            onClick={() => onConnect(item.key)}>
            <div className={clsx('flex-row-center', styles['wallet-list-item-left'])}>
              <div
                className={clsx(
                  styles['wallet-list-item-icon'],
                  isConnected && styles['wallet-list-item-icon-active'],
                )}>
                <Icon />
              </div>
              {renderAccount(item.name)}
            </div>
            {isConnected && (
              <div
                className={clsx('flex-row-center', styles['wallet-list-item-logout'])}
                onClick={onDisconnect}>
                <Logout />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
