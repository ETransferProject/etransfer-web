import styles from '../styles.module.scss';
import clsx from 'clsx';
import { CONNECT_AELF_LIST_CONFIG } from 'constants/wallet/aelf';
import { useQueryAuthToken } from 'hooks/authToken';
import useAelf from 'hooks/wallet/useAelf';
import { useCallback, useState } from 'react';
import { SingleMessage, unsubscribeUserOrderRecord } from '@etransfer/ui-react';
import { handleWebLoginErrorMessage } from '@etransfer/utils';
import DynamicArrow from 'components/DynamicArrow';
import { Logout } from 'assets/images';
import { useClearStore } from 'hooks/common';
import service from 'api/axios';
import myEvents from 'utils/myEvent';
import Address from './Address';
import PartialLoading from 'components/PartialLoading';

export default function AelfWalletList() {
  const { account, connectWallet, disconnect, isConnected } = useAelf();
  const { getAuth } = useQueryAuthToken();
  const [dynamicArrowExpand, setDynamicArrowExpand] = useState(false);
  const clearStore = useClearStore();
  const [isConnectLoading, setIsConnectLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    try {
      if (isConnected) {
        await getAuth();
      }
      if (!isConnected) {
        setIsConnectLoading(true);
        await connectWallet();
        setIsConnectLoading(false);
      }
    } catch (error) {
      setIsConnectLoading(false);
      SingleMessage.error(handleWebLoginErrorMessage(error));
    }
  }, [connectWallet, getAuth, isConnected]);

  const onDisconnect = useCallback(() => {
    Promise.resolve(disconnect()).then(() => {
      clearStore();
      service.defaults.headers.common['Authorization'] = '';
      myEvents.LogoutSuccess.emit();
      console.warn('>>>>>> logout');
      // stop notice socket
      unsubscribeUserOrderRecord(account || '');
    });
  }, [account, clearStore, disconnect]);

  const onViewDetail = useCallback(
    (event: any) => {
      event.stopPropagation();

      setDynamicArrowExpand(!dynamicArrowExpand);
    },
    [dynamicArrowExpand],
  );

  return (
    <div>
      <div className={styles['wallet-list-title']}>{CONNECT_AELF_LIST_CONFIG.section}</div>
      {CONNECT_AELF_LIST_CONFIG.list.map((item) => {
        const Icon = item.icon;
        return (
          <div className={clsx(styles['wallet-list-item'])} key={'aelf-wallet-' + item.key}>
            <div className={clsx('flex-row-center-between')} onClick={handleLogin}>
              <div className={clsx('flex-row-center', styles['wallet-list-item-left'])}>
                <div
                  className={clsx(
                    styles['wallet-list-item-icon'],
                    isConnected && styles['wallet-list-item-icon-active'],
                  )}>
                  <Icon />
                </div>
                <div className={styles['wallet-list-item-name']}>{item.name}</div>
                {isConnected && (
                  <div onClick={onViewDetail} className={'flex-row-center'}>
                    <DynamicArrow isExpand={dynamicArrowExpand} />
                  </div>
                )}
              </div>
              {isConnected && (
                <div onClick={onDisconnect}>
                  <Logout />
                </div>
              )}
              {!isConnected && isConnectLoading && (
                <div className={styles['wallet-connect-loading']}>
                  <PartialLoading />
                </div>
              )}
            </div>
            <div
              className={clsx(
                styles['wallet-aelf-account-list'],
                isConnected && dynamicArrowExpand
                  ? styles['wallet-aelf-account-list-show']
                  : styles['wallet-aelf-account-list-hidden'],
              )}>
              <Address />
            </div>
          </div>
        );
      })}
    </div>
  );
}