import { Logout } from 'assets/images';
import styles from '../styles.module.scss';
import clsx from 'clsx';
import { CONNECT_TRON_LIST_CONFIG } from 'constants/wallet/TRON';
import useTRON from 'hooks/wallet/useTRON';
import { useCallback, useState } from 'react';
import { getOmittedStr } from '@etransfer/utils';
import Copy, { CopySize } from 'components/Copy';
import PartialLoading from 'components/PartialLoading';
import { WalletTypeEnum } from 'context/Wallet/types';
import { removeOneLocalJWT } from 'api/utils';
import { setFromWalletType, setToWalletType } from 'store/reducers/crossChainTransfer/slice';
import { useAppDispatch, useCrossChainTransfer } from 'store/Provider/hooks';

export default function TRONWalletList({
  onSelected,
}: {
  onSelected?: (walletType: WalletTypeEnum) => void;
}) {
  const dispatch = useAppDispatch();
  const { account, isConnected, isConnecting, walletType, connect, disconnect } = useTRON();
  const [isShowCopy, setIsShowCopy] = useState(false);
  const { fromWalletType, toWalletType } = useCrossChainTransfer();

  const onConnect = useCallback(async () => {
    try {
      if (isConnected) {
        onSelected?.(WalletTypeEnum.TRON);
        return;
      }
      await connect();
      onSelected?.(WalletTypeEnum.TRON);
    } catch (error) {
      console.log('>>>>>> TRONWalletList onConnect error', error);
    }
  }, [connect, isConnected, onSelected]);

  const onDisconnect = useCallback(
    async (event: any) => {
      event.stopPropagation();

      // disconnect wallet
      await disconnect();

      // clear jwt
      const localKey = account + walletType;
      removeOneLocalJWT(localKey);

      // unbind wallet
      if (fromWalletType === WalletTypeEnum.TRON) {
        dispatch(setFromWalletType(undefined));
      }
      if (toWalletType === WalletTypeEnum.TRON) {
        dispatch(setToWalletType(undefined));
      }
    },
    [account, disconnect, dispatch, fromWalletType, toWalletType, walletType],
  );

  const renderAccount = useCallback(
    (name: string) => {
      if (isConnected && account) {
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
    [account, isConnected, isShowCopy],
  );

  const handleMouseEnter = useCallback((event: any) => {
    event.stopPropagation();
    setIsShowCopy(true);
  }, []);

  const handleMouseLeave = useCallback((event: any) => {
    event.stopPropagation();
    setIsShowCopy(false);
  }, []);

  return (
    <div>
      <div className={styles['wallet-list-title']}>{CONNECT_TRON_LIST_CONFIG.section}</div>
      {CONNECT_TRON_LIST_CONFIG.list.map((item) => {
        const Icon = item.icon;
        return (
          <div
            className={clsx('flex-row-center-between', styles['wallet-list-item'])}
            key={'tron-wallet-' + item.key}
            onClick={onConnect}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}>
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
            {!isConnected && isConnecting && (
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
