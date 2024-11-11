import { Logout } from 'assets/images';
import styles from '../styles.module.scss';
import clsx from 'clsx';
import { CONNECT_EVM_LIST_CONFIG } from 'constants/wallet/EVM';
import useEVM from 'hooks/wallet/useEVM';
import { useCallback, useMemo, useState } from 'react';
import { getOmittedStr } from '@etransfer/utils';
import Copy, { CopySize } from 'components/Copy';
import PartialLoading from 'components/PartialLoading';

export default function EVMWalletList() {
  const { account, connect, connectors, connector, disconnect, isConnected } = useEVM();
  const [isConnectLoading, setIsConnectLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const onConnect = useCallback(
    async (index: number) => {
      try {
        if (isConnected) return;
        setActiveIndex(index);
        setIsConnectLoading(true);
        await connect({ connector: connectors[index] });
        setIsConnectLoading(false);
      } catch (error) {
        setIsConnectLoading(false);
      }
    },
    [connect, connectors, isConnected],
  );

  const onDisconnect = useCallback(async () => {
    disconnect();
  }, [disconnect]);

  const renderAccount = useCallback(
    (key: string, name: string) => {
      if (isConnected && connector?.id === key && account) {
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
    [account, connector?.id, isConnected],
  );

  const walletList = useMemo(() => {
    if (isConnected) {
      const targetList = CONNECT_EVM_LIST_CONFIG.list.filter((item) => {
        return connector?.id === item.key;
      });
      return targetList;
    }
    return CONNECT_EVM_LIST_CONFIG.list;
  }, [connector, isConnected]);

  return (
    <div>
      <div className={styles['wallet-list-title']}>{CONNECT_EVM_LIST_CONFIG.section}</div>
      {walletList.map((item, index) => {
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
                    connector?.id === item.key &&
                    styles['wallet-list-item-icon-active'],
                )}>
                <Icon />
              </div>
              {renderAccount(item.key, item.name)}
            </div>
            {isConnected && connector?.id === item.key && (
              <div
                className={clsx('flex-row-center', styles['wallet-list-item-logout'])}
                onClick={onDisconnect}>
                <Logout />
              </div>
            )}
            {!isConnected && isConnectLoading && activeIndex === index && (
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
