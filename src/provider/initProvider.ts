'use client';
import { NetworkType, NotificationEvents } from '@portkey/provider-types';
import { useCallback } from 'react';
import { store } from 'store/Provider/store';
import {
  setAccountsAction,
  setChainIdsAction,
  // setConnectedInfoAction,
  setDisconnectedAction,
} from 'store/reducers/portkeyWallet/actions';
import { initialPortkeyWalletState } from 'store/reducers/portkeyWallet/slice';
import portkeyWallet from 'wallet/portkeyWallet';
import { NETWORK_TYPE } from 'constants/index';
import { useEffectOnce } from 'react-use';
import { useThrottleCallback } from 'hooks';
import { usePortkeyProvider } from 'hooks/usePortkeyProvider';
import myEvents from 'utils/myEvent';
import { resetJWT } from 'api/utils';
import singleMessage from 'components/SingleMessage';

export default function InitProvider() {
  const { connectEagerly } = usePortkeyProvider();

  const listener = useCallback(async () => {
    const provider = await portkeyWallet.getProvider();

    if (!provider) return;
    provider.on(NotificationEvents.ACCOUNTS_CHANGED, (accounts) => {
      if (Object.keys(accounts).length === 0) {
        store.dispatch(setDisconnectedAction(initialPortkeyWalletState));
        return;
      }
      store.dispatch(setAccountsAction(accounts));
    });
    provider.on(NotificationEvents.CHAIN_CHANGED, (chainIds) =>
      store.dispatch(setChainIdsAction(chainIds)),
    );
    provider.on(NotificationEvents.NETWORK_CHANGED, (networkType: NetworkType) => {
      if (networkType !== NETWORK_TYPE) {
        store.dispatch(setDisconnectedAction(initialPortkeyWalletState));
      }
    });
    // provider.on(NotificationEvents.CONNECTED, async () => {
    //   const { accounts, name } = await portkeyWallet.connected();
    //   store.dispatch(setConnectedInfoAction({ accounts, name, isActive: true }));
    // });
    provider.on(NotificationEvents.DISCONNECTED, () => {
      store.dispatch(setDisconnectedAction(initialPortkeyWalletState));
    });
  }, []);

  const removeListener = useCallback(async () => {
    const provider = await portkeyWallet.getProvider();
    if (!provider) return;

    const disconnect = () => {
      store.dispatch(setDisconnectedAction(initialPortkeyWalletState));
    };
    provider.removeListener(NotificationEvents.ACCOUNTS_CHANGED, disconnect);
    provider.removeListener(NotificationEvents.CHAIN_CHANGED, disconnect);
    provider.removeListener(NotificationEvents.NETWORK_CHANGED, disconnect);
    // provider.removeListener(NotificationEvents.CONNECTED, disconnect);
    provider.removeListener(NotificationEvents.DISCONNECTED, disconnect);
  }, []);

  const init = useThrottleCallback(async () => {
    try {
      await portkeyWallet.init({ networkType: NETWORK_TYPE });
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
      store.dispatch(setDisconnectedAction(initialPortkeyWalletState));
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
