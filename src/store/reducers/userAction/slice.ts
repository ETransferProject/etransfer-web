import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NetworkItem } from 'types/api';

export interface UserActionDeposit {
  address?: string;
  currentNetwork?: NetworkItem;
  networkList?: NetworkItem[];
  initOpenNetworkModalCount: number; // cant persist
  initOpenTokenkModalCount: number;
}

export interface UserActionWithdraw {
  address?: string;
  currentNetwork?: NetworkItem;
  networkList?: NetworkItem[];
}
export interface UserActionState {
  deposit: UserActionDeposit;
  withdraw: UserActionWithdraw;
}

export const initialUserActionState: UserActionState = {
  deposit: { initOpenNetworkModalCount: 0, initOpenTokenkModalCount: 0 },
  withdraw: {},
};

export const UserActionSlice = createSlice({
  name: 'userAction',
  initialState: initialUserActionState,
  reducers: {
    setDepositAddress: (state, action: PayloadAction<string | undefined>) => {
      state.deposit.address = action.payload;
    },
    setDepositCurrentNetwork: (state, action: PayloadAction<NetworkItem | undefined>) => {
      state.deposit.currentNetwork = action.payload;
    },
    setDepositNetworkList: (state, action: PayloadAction<NetworkItem[]>) => {
      state.deposit.networkList = action.payload;
    },
    setAddInitOpenNetworkModalCount: (state, _action: PayloadAction<void>) => {
      state.deposit.initOpenNetworkModalCount = state.deposit.initOpenNetworkModalCount++;
    },
    setAddInitOpenTokenModalCount: (state, _action: PayloadAction<void>) => {
      state.deposit.initOpenTokenkModalCount = state.deposit.initOpenTokenkModalCount++;
    },
    setWithdrawAddress: (state, action: PayloadAction<string | undefined>) => {
      state.withdraw.address = action.payload;
    },
    setWithdrawCurrentNetwork: (state, action: PayloadAction<NetworkItem | undefined>) => {
      state.withdraw.currentNetwork = action.payload;
    },
    setWithdrawNetworkList: (state, action: PayloadAction<NetworkItem[]>) => {
      state.withdraw.networkList = action.payload;
    },
    initUserAction: () => {
      return initialUserActionState;
    },
  },
});

export const {
  setDepositAddress,
  setDepositCurrentNetwork,
  setDepositNetworkList,
  setAddInitOpenNetworkModalCount,
  setAddInitOpenTokenModalCount,
  setWithdrawAddress,
  setWithdrawCurrentNetwork,
  setWithdrawNetworkList,
  initUserAction,
} = UserActionSlice.actions;

export default UserActionSlice;
