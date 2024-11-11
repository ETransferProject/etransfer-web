import { Logout } from 'assets/images';
import styles from '../styles.module.scss';
import clsx from 'clsx';
import { CONNECT_TON_LIST_CONFIG } from 'constants/wallet/TON';
import useTON from 'hooks/wallet/useTON';
import { useCallback, useState } from 'react';
import { getOmittedStr } from '@etransfer/utils';
import Copy, { CopySize } from 'components/Copy';
import PartialLoading from 'components/PartialLoading';

export default function TONWalletList() {
  const { account, connect, disconnect, isConnected } = useTON();
  const [isConnectLoading, setIsConnectLoading] = useState(false);

  const onConnect = useCallback(async () => {
    try {
      setIsConnectLoading(true);
      if (isConnected) return;
      connect(CONNECT_TON_LIST_CONFIG.key);
      setIsConnectLoading(false);
    } catch (error) {
      setIsConnectLoading(false);
    }
  }, [connect, isConnected]);

  const onDisconnect = useCallback(async () => {
    disconnect();
  }, [disconnect]);

  const renderAccount = useCallback(
    (name: string) => {
      if (isConnected && account) {
        return (
          <div className="flex-column">
            <div className="flex-row-center gap-8">
              <span className={styles['wallet-list-item-name']}>
                {getOmittedStr(account, 5, 5)}
              </span>
              <Copy toCopy={account} size={CopySize.Small} />
            </div>
            <div className={styles['wallet-list-item-desc']}>{name}</div>
          </div>
        );
      }
      return <div className={styles['wallet-list-item-name']}>{name}</div>;
    },
    [account, isConnected],
  );

  return (
    <div>
      <div className={styles['wallet-list-title']}>{CONNECT_TON_LIST_CONFIG.section}</div>

      <div
        className={clsx('flex-row-center-between', styles['wallet-list-item'])}
        onClick={onConnect}>
        <div className={clsx('flex-row-center', styles['wallet-list-item-left'])}>
          <div
            className={clsx(
              styles['wallet-list-item-icon'],
              isConnected && styles['wallet-list-item-icon-active'],
            )}>
            <CONNECT_TON_LIST_CONFIG.icon />
          </div>
          {renderAccount(CONNECT_TON_LIST_CONFIG.name)}
        </div>
        {isConnected && (
          <div
            className={clsx('flex-row-center', styles['wallet-list-item-logout'])}
            onClick={onDisconnect}>
            <Logout />
          </div>
        )}
        {!isConnected && isConnectLoading && (
          <div className={styles['wallet-connect-loading']}>
            <PartialLoading />
          </div>
        )}
      </div>
    </div>
  );
}
