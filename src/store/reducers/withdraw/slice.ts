import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { CHAIN_LIST, IChainNameItem } from 'constants/index';
import { TNetworkItem } from 'types/api';

export type TWithdrawState = {
  currentChainItem?: IChainNameItem;
  address?: string;
  currentNetwork?: TNetworkItem;
  networkList?: TNetworkItem[];
};

export const InitialWithdrawState: TWithdrawState = {
  currentChainItem: CHAIN_LIST[0],
};

export const WithdrawSlice = createSlice({
  name: 'withdraw',
  initialState: InitialWithdrawState,
  reducers: {
    setWithdrawChainItem: (state, action: PayloadAction<IChainNameItem>) => {
      state.currentChainItem = action.payload;
    },
    setWithdrawAddress: (state, action: PayloadAction<string | undefined>) => {
      state.address = action.payload;
    },
    setWithdrawCurrentNetwork: (state, action: PayloadAction<TNetworkItem | undefined>) => {
      state.currentNetwork = action.payload;
    },
    setWithdrawNetworkList: (state, action: PayloadAction<TNetworkItem[]>) => {
      state.networkList = action.payload;
    },
    resetWithdrawState: () => {
      return InitialWithdrawState;
    },
  },
});

export const {
  setWithdrawChainItem,
  setWithdrawAddress,
  setWithdrawCurrentNetwork,
  setWithdrawNetworkList,
  resetWithdrawState,
} = WithdrawSlice.actions;

export default WithdrawSlice;
