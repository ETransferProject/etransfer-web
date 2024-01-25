import { useCallback, useMemo } from 'react';
import getPortkeyWallet from 'wallet/portkeyWallet';
import { useAppDispatch, useCommonState, useLoading } from 'store/Provider/hooks';
import {
  setV1ConnectedInfoAction,
  setV1DisconnectedAction,
  setV2ConnectedInfoAction,
  setV2DisconnectedAction,
} from 'store/reducers/portkeyWallet/actions';
import { setSwitchVersionAction } from 'store/reducers/common/slice';
import { PortkeyVersion } from 'constants/index';

export interface PortkeyProviderResult {
  activate: () => Promise<void>;
  deactivate: () => boolean;
  connectEagerly: () => Promise<void>;
}

export function usePortkeyProvider(): PortkeyProviderResult {
  const dispatch = useAppDispatch();
  const { setLoading } = useLoading();
  const { currentVersion } = useCommonState();
  const portkeyWallet = useMemo(() => getPortkeyWallet(currentVersion), [currentVersion]);

  const activate = useCallback(async () => {
    try {
      setLoading(true);
      const { accounts, name } = await portkeyWallet.activate();
      setLoading(false);
      if (currentVersion === PortkeyVersion.v1) {
        dispatch(
          setV1ConnectedInfoAction({
            accounts,
            name,
            isActive: true,
          }),
        );
      }
      if (currentVersion === PortkeyVersion.v2) {
        dispatch(
          setV2ConnectedInfoAction({
            accounts,
            name,
            isActive: true,
          }),
        );
      }
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [currentVersion, dispatch, portkeyWallet, setLoading]);

  const deactivate = useCallback(() => {
    if (currentVersion === PortkeyVersion.v1) {
      dispatch(setV1DisconnectedAction());
    }
    if (currentVersion === PortkeyVersion.v2) {
      dispatch(setV2DisconnectedAction());
    }

    dispatch(setSwitchVersionAction(undefined));
    return true;
  }, [currentVersion, dispatch]);

  const connectEagerly = useCallback(async () => {
    try {
      if (!currentVersion) return;
      await portkeyWallet.connectEagerly();
      activate();
    } catch (error) {
      console.log(error, '====error');
    }
  }, [activate, currentVersion, portkeyWallet]);

  return {
    activate,
    deactivate,
    connectEagerly,
  };
}
