import { Logout } from 'assets/images';
import styles from '../styles.module.scss';
import clsx from 'clsx';
import {
  CONNECT_EVM_LIST_CONFIG,
  MOBILE_EVM_WALLET_ALLOWANCE,
  PORTKEY_EVM_WALLET_ALLOWANCE,
  TELEGRAM_EVM_WALLET_ALLOWANCE,
} from 'constants/wallet/EVM';
import useEVM from 'hooks/wallet/useEVM';
import { useCallback, useMemo, useState } from 'react';
import { getOmittedStr, handleErrorMessage } from '@etransfer/utils';
import Copy, { CopySize } from 'components/Copy';
import PartialLoading from 'components/PartialLoading';
import { SingleMessage } from '@etransfer/ui-react';
import { WalletTypeEnum } from 'context/Wallet/types';
import { USER_REJECT_CONNECT_WALLET_TIP } from 'constants/wallet';
import { TelegramPlatform } from 'utils/telegram';
import { isPortkey } from 'utils/portkey';
import { isMobileDevices } from 'utils/isMobile';
import { useAfterDisconnect } from 'hooks/wallet';
import { useSetWalletType } from 'hooks/crossChainTransfer';

export default function EVMWalletList({
  connectedCallback,
  disConnectedCallback,
}: {
  connectedCallback?: (walletType: WalletTypeEnum) => void;
  disConnectedCallback?: (walletType: WalletTypeEnum) => void;
}) {
  const { account, connect, connectors, connector, disconnect, isConnected, walletType } = useEVM();
  const setWalletType = useSetWalletType();
  const [isConnectLoading, setIsConnectLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isShowCopy, setIsShowCopy] = useState(false);

  const onConnect = useCallback(
    async (id: string, index: number) => {
      try {
        if (isConnected) {
          setWalletType(walletType);
          connectedCallback?.(walletType);
          return;
        }
        const connector = connectors.find((item) => item.id === id);
        if (!connector) return;

        setActiveIndex(index);
        setIsConnectLoading(true);
        await connect({ connector: connector });
        setWalletType(walletType);
        setIsConnectLoading(false);
        connectedCallback?.(walletType);
      } catch (error) {
        setIsConnectLoading(false);
        if (
          handleErrorMessage(error).includes('rejected') ||
          handleErrorMessage(error).includes('denied')
        ) {
          SingleMessage.error(handleErrorMessage(USER_REJECT_CONNECT_WALLET_TIP));
        }
      }
    },
    [connect, connectedCallback, connectors, isConnected, setWalletType, walletType],
  );

  const afterDisconnect = useAfterDisconnect();
  const onDisconnect = useCallback(
    async (event: any) => {
      event.stopPropagation();

      const _account = account || '';
      // disconnect wallet
      await disconnect();

      afterDisconnect(_account, walletType);
      disConnectedCallback?.(walletType);
    },
    [account, afterDisconnect, disConnectedCallback, disconnect, walletType],
  );

  const handleMouseEnter = useCallback((event: any) => {
    event.stopPropagation();
    setIsShowCopy(true);
  }, []);

  const handleMouseLeave = useCallback((event: any) => {
    event.stopPropagation();
    setIsShowCopy(false);
  }, []);

  const renderAccount = useCallback(
    (key: string, name: string) => {
      if (isConnected && connector?.id === key && account) {
        return (
          <div className="flex-column">
            <div className="flex-row-center gap-8">
              <span className={styles['wallet-list-item-name']}>
                {getOmittedStr(account, 5, 5)}
              </span>
              {isShowCopy && <Copy toCopy={account} size={CopySize.Small} />}
            </div>
            <div className={styles['wallet-list-item-desc']}>{name}</div>
          </div>
        );
      }
      return <div className={styles['wallet-list-item-name']}>{name}</div>;
    },
    [account, connector?.id, isConnected, isShowCopy],
  );

  const walletList = useMemo(() => {
    const totalList = CONNECT_EVM_LIST_CONFIG.list.filter((item) => {
      if (TelegramPlatform.isTelegramPlatform()) {
        return TELEGRAM_EVM_WALLET_ALLOWANCE.includes(item.key);
      }
      if (isPortkey()) {
        return PORTKEY_EVM_WALLET_ALLOWANCE.includes(item.key);
      }
      if (isMobileDevices()) {
        return MOBILE_EVM_WALLET_ALLOWANCE.includes(item.key);
      }
      return true;
    });

    if (isConnected) {
      const targetList = totalList.filter((item) => {
        return connector?.id === item.key;
      });
      return targetList;
    }
    return totalList;
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
            onClick={() => onConnect(item.key, index)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}>
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
