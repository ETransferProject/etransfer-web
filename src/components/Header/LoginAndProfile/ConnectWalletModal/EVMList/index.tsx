import { Logout } from 'assets/images';
import styles from '../styles.module.scss';
import clsx from 'clsx';
import { CONNECT_EVM_LIST_CONFIG } from 'constants/wallet/EVM';
import useEVM from 'hooks/wallet/useEVM';
import { useCallback, useMemo, useState } from 'react';
import { getOmittedStr, handleErrorMessage } from '@etransfer/utils';
import Copy, { CopySize } from 'components/Copy';
import PartialLoading from 'components/PartialLoading';
import { SingleMessage } from '@etransfer/ui-react';
import { WalletTypeEnum } from 'context/Wallet/types';
import { useAppDispatch, useCrossChainTransfer } from 'store/Provider/hooks';
import { setFromWalletType, setToWalletType } from 'store/reducers/crossChainTransfer/slice';
import { removeOneLocalJWT } from 'api/utils';

export default function EVMWalletList({
  onSelected,
}: {
  onSelected?: (walletType: WalletTypeEnum) => void;
}) {
  const dispatch = useAppDispatch();
  const { account, connect, connectors, connector, disconnect, isConnected, walletType } = useEVM();
  const [isConnectLoading, setIsConnectLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isShowCopy, setIsShowCopy] = useState(false);
  const { fromWalletType, toWalletType } = useCrossChainTransfer();

  const onConnect = useCallback(
    async (id: string, index: number) => {
      try {
        if (isConnected) {
          onSelected?.(WalletTypeEnum.EVM);
          return;
        }
        const connector = connectors.find((item) => item.id === id);
        if (!connector) return;

        setActiveIndex(index);
        setIsConnectLoading(true);
        await connect({ connector: connector });
        onSelected?.(WalletTypeEnum.EVM);
        setIsConnectLoading(false);
      } catch (error) {
        setIsConnectLoading(false);
        SingleMessage.error(handleErrorMessage(error));
      }
    },
    [connect, connectors, isConnected, onSelected],
  );

  const onDisconnect = useCallback(
    async (event: any) => {
      event.stopPropagation();

      // disconnect wallet
      disconnect();

      // clear jwt
      const localKey = account + walletType;
      removeOneLocalJWT(localKey);

      // unbind wallet
      if (fromWalletType === WalletTypeEnum.EVM) {
        dispatch(setFromWalletType(undefined));
      }
      if (toWalletType === WalletTypeEnum.EVM) {
        dispatch(setToWalletType(undefined));
      }
    },
    [account, disconnect, dispatch, fromWalletType, toWalletType, walletType],
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
