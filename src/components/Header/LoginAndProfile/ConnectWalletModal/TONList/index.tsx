import { Logout } from 'assets/images';
import styles from '../styles.module.scss';
import clsx from 'clsx';
import { CONNECT_TON_LIST_CONFIG } from 'constants/wallet/TON';
import useTON, { useTonWalletConnectionError } from 'hooks/wallet/useTON';
import { useCallback, useState } from 'react';
import { getOmittedStr, handleErrorMessage } from '@etransfer/utils';
import Copy, { CopySize } from 'components/Copy';
// import PartialLoading from 'components/PartialLoading';
import { SingleMessage } from '@etransfer/ui-react';
import { TonConnectError } from '@tonconnect/ui-react';
import { USER_REJECT_CONNECT_WALLET_TIP } from 'constants/wallet';
import { WalletTypeEnum } from 'context/Wallet/types';
import { useAfterDisconnect } from 'hooks/wallet';

export default function TONWalletList({
  onSelected,
}: {
  onSelected?: (walletType: WalletTypeEnum) => void;
}) {
  const { account, connect, disconnect, isConnected } = useTON();
  // const [isConnectLoading, setIsConnectLoading] = useState(false);
  const [isShowCopy, setIsShowCopy] = useState(false);

  const onConnectErrorCallback = useCallback((error: TonConnectError) => {
    const errorMessage = handleErrorMessage(error);
    let targetMessage = errorMessage;
    if (errorMessage.includes('Pop-up closed') || errorMessage.includes('Reject request')) {
      targetMessage = USER_REJECT_CONNECT_WALLET_TIP;
    }
    SingleMessage.error(targetMessage);
    // setIsConnectLoading(false);
  }, []);
  useTonWalletConnectionError(onConnectErrorCallback);

  const onConnect = useCallback(async () => {
    try {
      // setIsConnectLoading(true);
      if (isConnected) {
        onSelected?.(WalletTypeEnum.TON);
        return;
      }
      await connect(CONNECT_TON_LIST_CONFIG.key);
      onSelected?.(WalletTypeEnum.TON);
    } catch (error) {
      // setIsConnectLoading(false);
    }
  }, [connect, isConnected, onSelected]);

  // useEffect(() => {
  //   if (isConnected) {
  //     setIsConnectLoading(false);
  //   }
  // }, [isConnected]);

  const afterDisconnect = useAfterDisconnect();
  const onDisconnect = useCallback(
    async (event: any) => {
      event.stopPropagation();

      const _account = account || '';
      await disconnect();
      afterDisconnect(_account, WalletTypeEnum.TON);
    },
    [account, afterDisconnect, disconnect],
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
      <div className={styles['wallet-list-title']}>{CONNECT_TON_LIST_CONFIG.section}</div>

      <div
        className={clsx('flex-row-center-between', styles['wallet-list-item'])}
        onClick={onConnect}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}>
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
        {/* {!isConnected && isConnectLoading && (
          <div className={styles['wallet-connect-loading']}>
            <PartialLoading />
          </div>
        )} */}
      </div>
    </div>
  );
}
