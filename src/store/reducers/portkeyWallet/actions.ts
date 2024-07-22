import { createAction } from '@reduxjs/toolkit';

import { PortkeyWalletInfo } from './slice';
import { TAelfAccounts, TChainIds } from 'types/wallet';

export const setV1AccountsAction = createAction<TAelfAccounts>('portkeyWallet/setV1AccountsAction');

export const setV1ChainIdsAction = createAction<TChainIds>('portkeyWallet/setV1ChainIdsAction');

export const setV1ConnectedInfoAction = createAction<PortkeyWalletInfo>(
  'portkeyWallet/setV1ConnectedInfoAction',
);

export const setV1DisconnectedAction = createAction('portkeyWallet/setV1DisconnectedAction');

export const setV2AccountsAction = createAction<TAelfAccounts>('portkeyWallet/setV2AccountsAction');

export const setV2ChainIdsAction = createAction<TChainIds>('portkeyWallet/setV2ChainIdsAction');

export const setV2ConnectedInfoAction = createAction<PortkeyWalletInfo>(
  'portkeyWallet/setV2ConnectedInfoAction',
);

export const setV2DisconnectedAction = createAction('portkeyWallet/setV2DisconnectedAction');

export const setDisconnectedAction = createAction('portkeyWallet/setDisconnectedAction');
