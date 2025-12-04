import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TTransferDashboardFilterToken } from 'types/api';
import { TTokenDashboardItem, TTransferDashboardData } from 'types/infoDashboard';

export type TInfoDashboardState = {
  tokens: TTokenDashboardItem[];
  transferList: TTransferDashboardData[];
  selectedTransfer?: TTransferDashboardData;
  tokensInfo: TTransferDashboardFilterToken[];
};

export const InitialInfoDashboardState: TInfoDashboardState = {
  tokens: [],
  transferList: [],
  tokensInfo: [],
};

export const InfoDashboardSlice = createSlice({
  name: 'infoDashboard',
  initialState: InitialInfoDashboardState,
  reducers: {
    setTokens: (state, action: PayloadAction<TTokenDashboardItem[]>) => {
      state.tokens = action.payload;
    },
    setTransferList: (state, action: PayloadAction<TTransferDashboardData[]>) => {
      state.transferList = action.payload;
    },
    setSelectedTransfer: (state, action: PayloadAction<TTransferDashboardData>) => {
      state.selectedTransfer = action.payload;
    },
    setTokensInfo: (state, action: PayloadAction<TTransferDashboardFilterToken[]>) => {
      state.tokensInfo = action.payload;
    },
    resetInfoDashboardState: () => {
      return InitialInfoDashboardState;
    },
  },
});

export const {
  setTokens,
  setTransferList,
  setSelectedTransfer,
  resetInfoDashboardState,
  setTokensInfo,
} = InfoDashboardSlice.actions;

export default InfoDashboardSlice;
