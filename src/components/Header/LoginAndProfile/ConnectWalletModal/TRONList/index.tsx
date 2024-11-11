import { Logout } from 'assets/images';
import styles from '../styles.module.scss';
import clsx from 'clsx';
import { CONNECT_TRON_LIST_CONFIG } from 'constants/wallet/TRON';
import useTRON from 'hooks/wallet/useTRON';
import { useCallback, useState } from 'react';
import { getOmittedStr } from '@etransfer/utils';
import Copy, { CopySize } from 'components/Copy';
import PartialLoading from 'components/PartialLoading';

export default function TRONWalletList() {
  const { account, isConnected, connect, disconnect } = useTRON();
  const [isConnectLoading, setIsConnectLoading] = useState(false);

  const onConnect = useCallback(
    async (name: string) => {
      try {
        setIsConnectLoading(true);
        if (isConnected) return;
        connect(name as any);
        setIsConnectLoading(false);
      } catch (error) {
        setIsConnectLoading(false);
      }
    },
    [connect, isConnected],
  );

  const onDisconnect = useCallback(() => {
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
      <div className={styles['wallet-list-title']}>{CONNECT_TRON_LIST_CONFIG.section}</div>
      {CONNECT_TRON_LIST_CONFIG.list.map((item) => {
        const Icon = item.icon;
        return (
          <div
            className={clsx('flex-row-center-between', styles['wallet-list-item'])}
            key={'tron-wallet-' + item.key}
            onClick={() => onConnect('TronLink')}>
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
            {!isConnected && isConnectLoading && (
              <div className={styles['wallet-connect-loading']}>
                <PartialLoading />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
