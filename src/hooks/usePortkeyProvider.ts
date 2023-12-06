import { useCallback } from 'react';
import portkeyWallet from 'wallet/portkeyWallet';
import { useAppDispatch, useLoading } from 'store/Provider/hooks';
import {
  setConnectedInfoAction,
  setDisconnectedAction,
} from 'store/reducers/portkeyWallet/actions';
import { initialPortkeyWalletState } from 'store/reducers/portkeyWallet/slice';

export interface PortkeyProviderResult {
  activate: () => Promise<void>;
  deactivate: () => boolean;
  connectEagerly: () => Promise<void>;
}

export function usePortkeyProvider(): PortkeyProviderResult {
  const dispatch = useAppDispatch();
  const { setLoading } = useLoading();

  const activate = useCallback(async () => {
    try {
      setLoading(true);
      const { accounts, name } = await portkeyWallet.activate();
      setLoading(false);
      dispatch(
        setConnectedInfoAction({
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
  }, [dispatch, setLoading]);

  const deactivate = useCallback(() => {
    dispatch(setDisconnectedAction(initialPortkeyWalletState));
    return true;
  }, [dispatch]);

  const connectEagerly = useCallback(async () => {
    try {
      await portkeyWallet.connectEagerly();
      activate();
    } catch (error) {
      console.log(error, '====error');
    }
  }, [activate]);

  return {
    activate,
    deactivate,
    connectEagerly,
  };
}
