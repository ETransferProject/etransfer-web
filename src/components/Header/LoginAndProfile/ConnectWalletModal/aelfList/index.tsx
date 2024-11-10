import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import styles from '../styles.module.scss';
import clsx from 'clsx';
import { CONNECT_AELF_LIST_CONFIG } from 'constants/wallet/aelf';
import { useQueryAuthToken } from 'hooks/authToken';
import { useIsLogin } from 'hooks/wallet';
import { useCallback, useState } from 'react';
import { SingleMessage, unsubscribeUserOrderRecord } from '@etransfer/ui-react';
import { handleWebLoginErrorMessage } from '@etransfer/utils';
import DynamicArrow from 'components/DynamicArrow';
import { Logout } from 'assets/images';
import { useClearStore } from 'hooks/common';
import service from 'api/axios';
import myEvents from 'utils/myEvent';
import Address from './Address';

export default function AelfWalletList() {
  const { connectWallet, disConnectWallet, walletInfo } = useConnectWallet();
  const { getAuth } = useQueryAuthToken();
  const isLogin = useIsLogin();
  const [dynamicArrowExpand, setDynamicArrowExpand] = useState(false);
  const clearStore = useClearStore();

  const handleLogin = useCallback(async () => {
    try {
      if (isLogin) {
        await getAuth();
      }
      if (!isLogin) {
        await connectWallet();
      }
    } catch (error) {
      SingleMessage.error(handleWebLoginErrorMessage(error));
    }
  }, [connectWallet, getAuth, isLogin]);

  const onDisconnect = useCallback(() => {
    Promise.resolve(disConnectWallet()).then(() => {
      clearStore();
      service.defaults.headers.common['Authorization'] = '';
      myEvents.LogoutSuccess.emit();
      console.warn('>>>>>> logout');
      // stop notice socket
      unsubscribeUserOrderRecord(walletInfo?.address || '');
    });
  }, []);

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
                    isLogin && styles['wallet-list-item-icon-active'],
                  )}>
                  <Icon />
                </div>
                <div className={styles['wallet-list-item-name']}>{item.name}</div>
                {isLogin && (
                  <div onClick={onViewDetail} className={'flex-row-center'}>
                    <DynamicArrow isExpand={dynamicArrowExpand} />
                  </div>
                )}
              </div>
              {isLogin && (
                <div onClick={onDisconnect}>
                  <Logout />
                </div>
              )}
            </div>
            <div
              className={clsx(
                styles['wallet-aelf-account-list'],
                isLogin && dynamicArrowExpand
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
