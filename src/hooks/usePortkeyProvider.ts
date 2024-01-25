import { useCallback, useMemo } from 'react';
import getPortkeyWallet from 'wallet/portkeyWallet';
import { useAppDispatch, useLoading, usePortkeyWalletState } from 'store/Provider/hooks';
import {
  setV1ConnectedInfoAction,
  setV1DisconnectedAction,
} from 'store/reducers/portkeyWallet/actions';

export interface PortkeyProviderResult {
  activate: () => Promise<void>;
  deactivate: () => boolean;
  connectEagerly: () => Promise<void>;
}

export function usePortkeyProvider(): PortkeyProviderResult {
  const dispatch = useAppDispatch();
  const { setLoading } = useLoading();
  const { currentVersion } = usePortkeyWalletState();
  const portkeyWallet = useMemo(() => getPortkeyWallet(currentVersion), [currentVersion]);

  const activate = useCallback(async () => {
    try {
      setLoading(true);
      const { accounts, name } = await portkeyWallet.activate();
      setLoading(false);
      dispatch(
        setV1ConnectedInfoAction({
          accounts,
          name,
          isActive: true,
        }),
      );
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [dispatch, portkeyWallet, setLoading]);

  const deactivate = useCallback(() => {
    dispatch(setV1DisconnectedAction());
    return true;
  }, [dispatch]);

  const connectEagerly = useCallback(async () => {
    try {
      await portkeyWallet.connectEagerly();
      activate();
    } catch (error) {
      console.log(error, '====error');
    }
  }, [activate, portkeyWallet]);

  return {
    activate,
    deactivate,
    connectEagerly,
  };
}
