import { useCallback } from 'react';
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
import { singleMessage } from '@portkey/did-ui-react';
import { ConnectWalletError } from 'constants/wallet';

export interface PortkeyProviderResult {
  activate: (version?: PortkeyVersion) => Promise<void>;
  deactivate: () => boolean;
  connectEagerly: () => Promise<void>;
}

export function usePortkeyProvider(): PortkeyProviderResult {
  const dispatch = useAppDispatch();
  const { setLoading } = useLoading();
  const { currentVersion } = useCommonState();

  const activate = useCallback(
    async (version?: PortkeyVersion) => {
      try {
        const versionNew = version || currentVersion;
        if (!versionNew) return;
        const portkeyWallet = getPortkeyWallet(versionNew);
        setLoading(true);
        const { accounts, name } = await portkeyWallet.activate();
        setLoading(false);
        if (versionNew === PortkeyVersion.v1) {
          dispatch(
            setV1ConnectedInfoAction({
              accounts,
              name,
              isActive: true,
            }),
          );
        }
        if (versionNew === PortkeyVersion.v2) {
          dispatch(
            setV2ConnectedInfoAction({
              accounts,
              name,
              isActive: true,
            }),
          );
        }
      } catch (error: any) {
        if (error?.message === ConnectWalletError) singleMessage.error(ConnectWalletError, 3000);
      } finally {
        setLoading(false);
      }
    },
    [currentVersion, dispatch, setLoading],
  );

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

  const connectEagerly = useCallback(
    async (version?: PortkeyVersion) => {
      try {
        if (!version && !currentVersion) return;
        const portkeyWallet = getPortkeyWallet(version || currentVersion);
        await portkeyWallet.connectEagerly();
        activate(version || currentVersion);
      } catch (error) {
        console.log(error, '====error');
      }
    },
    [activate, currentVersion],
  );

  return {
    activate,
    deactivate,
    connectEagerly,
  };
}
