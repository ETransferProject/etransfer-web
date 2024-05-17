import { createSlice } from '@reduxjs/toolkit';
import { Accounts, ChainIds } from '@portkey/provider-types';
import {
  setDisconnectedAction,
  setV1AccountsAction,
  setV1ChainIdsAction,
  setV1ConnectedInfoAction,
  setV1DisconnectedAction,
  setV2AccountsAction,
  setV2ChainIdsAction,
  setV2ConnectedInfoAction,
  setV2DisconnectedAction,
} from './actions';

export interface PortkeyWalletInfo {
  isActive: boolean; // is connected
  name: string;
  accounts?: Accounts;
  chainIds?: ChainIds;
}

export interface PortkeyWalletState {
  v1: PortkeyWalletInfo;
  v2: PortkeyWalletInfo;
}

export const initialPortkeyWalletState: PortkeyWalletState = {
  v1: {
    isActive: false,
    name: '',
    accounts: {},
  },
  v2: {
    isActive: false,
    name: '',
    accounts: {},
  },
};

export const PortkeyWalletSlice = createSlice({
  name: 'portkeyWallet',
  initialState: initialPortkeyWalletState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(setV1AccountsAction, (state, action) => {
        state.v1.accounts = action.payload;
      })
      .addCase(setV1ChainIdsAction, (state, action) => {
        state.v1.chainIds = action.payload;
      })
      .addCase(setV1ConnectedInfoAction, (state, action) => {
        state.v1.accounts = action.payload.accounts;
        state.v1.isActive = action.payload.isActive;
        state.v1.name = action.payload.name;
      })
      .addCase(setV1DisconnectedAction, (state) => {
        state.v1 = JSON.parse(JSON.stringify(initialPortkeyWalletState.v1));
      })
      .addCase(setV2AccountsAction, (state, action) => {
        state.v2.accounts = action.payload;
      })
      .addCase(setV2ChainIdsAction, (state, action) => {
        state.v2.chainIds = action.payload;
      })
      .addCase(setV2ConnectedInfoAction, (state, action) => {
        state.v2.accounts = action.payload.accounts;
        state.v2.isActive = action.payload.isActive;
        state.v2.name = action.payload.name;
      })
      .addCase(setV2DisconnectedAction, (state) => {
        state.v2 = JSON.parse(JSON.stringify(initialPortkeyWalletState.v2));
      })
      .addCase(setDisconnectedAction, () => {
        return JSON.parse(JSON.stringify(initialPortkeyWalletState));
      });
  },
});

export default PortkeyWalletSlice;
