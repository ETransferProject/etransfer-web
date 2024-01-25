'use client';
import { NotificationEvents } from '@portkey/provider-types';
import { useCallback } from 'react';
import { store } from 'store/Provider/store';
import {
  setV1AccountsAction,
  setV1ChainIdsAction,
  setV1DisconnectedAction,
} from 'store/reducers/portkeyWallet/actions';
import portkeyWallet from 'wallet/portkeyWalletV1';
import { NetworkTypeV1, NetworkTypeTextV1, NETWORK_TYPE_V1 } from 'constants/index';
import { useEffectOnce } from 'react-use';
import { useThrottleCallback } from 'hooks';
import { usePortkeyProvider } from 'hooks/usePortkeyProvider';
import myEvents from 'utils/myEvent';
import { resetJWT } from 'api/utils';
import singleMessage from 'components/SingleMessage';
import { initCommon } from 'store/reducers/common/slice';
import { initUserAction } from 'store/reducers/userAction/slice';
import 'utils/firebase';

export default function InitProvider() {
  const { connectEagerly } = usePortkeyProvider();

  const initData = useCallback(() => {
    store.dispatch(initCommon());
    store.dispatch(initUserAction());
  }, []);

  const listener = useCallback(async () => {
    const provider = await portkeyWallet.getProvider();

    if (!provider) return;
    provider.on(NotificationEvents.ACCOUNTS_CHANGED, (accounts) => {
      if (Object.keys(accounts).length === 0) {
        store.dispatch(setV1DisconnectedAction());
        portkeyWallet.clearData();
        initData();
        return;
      }
      store.dispatch(setV1AccountsAction(accounts));
    });
    provider.on(NotificationEvents.CHAIN_CHANGED, (chainIds) =>
      store.dispatch(setV1ChainIdsAction(chainIds)),
    );
    provider.on(NotificationEvents.NETWORK_CHANGED, (networkType: NetworkTypeV1) => {
      if (networkType !== NETWORK_TYPE_V1) {
        singleMessage.error(
          `Please switch Portkey to aelf ${
            NETWORK_TYPE_V1 === NetworkTypeV1.TESTNET
              ? NetworkTypeTextV1.TESTNET
              : NetworkTypeTextV1.MAIN
          }.`,
        );
        store.dispatch(setV1DisconnectedAction());
        portkeyWallet.clearData();
        initData();
      }
    });
    // provider.on(NotificationEvents.CONNECTED, async () => {
    //   const { accounts, name } = await portkeyWallet.connected();
    //   store.dispatch(setV1ConnectedInfoAction({ accounts, name, isActive: true }));
    // });
    provider.on(NotificationEvents.DISCONNECTED, () => {
      store.dispatch(setV1DisconnectedAction());
      portkeyWallet.clearData();
      initData();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeListener = useCallback(async () => {
    const provider = await portkeyWallet.getProvider();
    if (!provider) return;

    const disconnect = () => {
      store.dispatch(setV1DisconnectedAction());
    };
    provider.removeListener(NotificationEvents.ACCOUNTS_CHANGED, disconnect);
    provider.removeListener(NotificationEvents.CHAIN_CHANGED, disconnect);
    provider.removeListener(NotificationEvents.NETWORK_CHANGED, disconnect);
    // provider.removeListener(NotificationEvents.CONNECTED, disconnect);
    provider.removeListener(NotificationEvents.DISCONNECTED, disconnect);
  }, []);

  const init = useThrottleCallback(async () => {
    try {
      await portkeyWallet.init({ networkType: NETWORK_TYPE_V1 });
      listener();
      await connectEagerly();
    } catch (error) {
      console.log(error, 'initProvider=');
    }
  }, [listener, connectEagerly]);

  useEffectOnce(() => {
    const listener = myEvents.DeniedRequest.addListener(() => {
      singleMessage.error('Login expired, please log in again');
      resetJWT();
      store.dispatch(setV1DisconnectedAction());
      portkeyWallet.clearData();
      initData();
    });
    const timer = setTimeout(init(), 1000);
    return () => {
      clearTimeout(timer);
      listener.remove();
      removeListener();
    };
  });
  return null;
}
