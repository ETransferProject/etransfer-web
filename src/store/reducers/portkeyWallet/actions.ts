import { createAction } from '@reduxjs/toolkit';
import { Accounts, ChainIds } from '@portkey/provider-types';
import { PortkeyWalletInfo } from './slice';
import { PortkeyVersion } from 'constants/index';

export const setV1AccountsAction = createAction<Accounts>('portkeyWallet/setV1AccountsAction');

export const setV1ChainIdsAction = createAction<ChainIds>('portkeyWallet/setV1ChainIdsAction');

export const setV1ConnectedInfoAction = createAction<PortkeyWalletInfo>(
  'portkeyWallet/setV1ConnectedInfoAction',
);

export const setV1DisconnectedAction = createAction('portkeyWallet/setV1DisconnectedAction');

export const setV2AccountsAction = createAction<Accounts>('portkeyWallet/setV2AccountsAction');

export const setV2ChainIdsAction = createAction<ChainIds>('portkeyWallet/setV2ChainIdsAction');

export const setV2ConnectedInfoAction = createAction<PortkeyWalletInfo>(
  'portkeyWallet/setV2ConnectedInfoAction',
);

export const setV2DisconnectedAction = createAction('portkeyWallet/setV2DisconnectedAction');

export const setDisconnectedAction = createAction('portkeyWallet/setDisconnectedAction');

export const setSwitchVersionAction = createAction<PortkeyVersion>(
  'portkeyWallet/setSwitchVersionAction',
);
