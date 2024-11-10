import { Logout } from 'assets/images';
import styles from '../styles.module.scss';
import clsx from 'clsx';
import { CONNECT_EVM_LIST_CONFIG } from 'constants/wallet/EVM';
import useEVM from 'hooks/wallet/useEVM';
import { useCallback } from 'react';
import { getOmittedStr } from '@etransfer/utils';
import Copy, { CopySize } from 'components/Copy';

export default function EVMWalletList() {
  const { account, connect, connectors, connector, disconnect, isConnected } = useEVM();

  const onConnect = useCallback(
    async (index: number) => {
      await connect({ connector: connectors[index] });
    },
    [connect, connectors],
  );

  const onDisconnect = useCallback(async () => {
    disconnect();
  }, [disconnect]);

  const renderAccount = useCallback((key: string, name: string) => {
    if (isConnected && connector?.name === key && account) {
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
      <div className={styles['wallet-list-title']}>{CONNECT_EVM_LIST_CONFIG.section}</div>
      {CONNECT_EVM_LIST_CONFIG.list.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            className={clsx('flex-row-center-between', styles['wallet-list-item'])}
            key={'evm-wallet-' + item.key}
            onClick={() => onConnect(index)}>
            <div className={clsx('flex-row-center', styles['wallet-list-item-left'])}>
              <div
                className={clsx(
                  styles['wallet-list-item-icon'],
                  isConnected &&
                    connector?.name === item.key &&
                    styles['wallet-list-item-icon-active'],
                )}>
                <Icon />
              </div>
              {renderAccount(item.key, item.name)}
            </div>
            {isConnected && connector?.name === item.key && (
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
