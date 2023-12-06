import { createAction } from '@reduxjs/toolkit';
import { Accounts, ChainIds } from '@portkey/provider-types';
import { PortkeyWalletState } from './slice';

export const setAccountsAction = createAction<Accounts>('portkeyWallet/setAccountsAction');

export const setChainIdsAction = createAction<ChainIds>('portkeyWallet/setChainIdsAction');

export const setConnectedInfoAction = createAction<PortkeyWalletState>(
  'portkeyWallet/setConnectedInfoAction',
);

export const setDisconnectedAction = createAction<PortkeyWalletState>(
  'portkeyWallet/setDisconnectedAction',
);
