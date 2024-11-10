import { Logout } from 'assets/images';
import styles from '../styles.module.scss';
import clsx from 'clsx';
import { CONNECT_TON_LIST_CONFIG } from 'constants/wallet/TON';
import useTON from 'hooks/wallet/useTON';
import { useCallback } from 'react';
import { getOmittedStr } from '@etransfer/utils';
import Copy, { CopySize } from 'components/Copy';

export default function TONWalletList() {
  const { account, connect, disconnect, isConnected } = useTON();

  const onConnect = useCallback(
    async (name: string) => {
      connect(name);
    },
    [connect],
  );

  const onDisconnect = useCallback(async () => {
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
      <div className={styles['wallet-list-title']}>{CONNECT_TON_LIST_CONFIG.section}</div>
      {CONNECT_TON_LIST_CONFIG.list.map((item) => {
        const Icon = item.icon;
        return (
          <div
            className={clsx('flex-row-center-between', styles['wallet-list-item'])}
            key={'ton-wallet-' + item.key}
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
