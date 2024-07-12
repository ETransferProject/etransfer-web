import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TTransferDashboardFilterToken } from 'types/api';
import { TTokenDashboardItem, TTransferDashboardData } from 'types/infoDashboard';

export type TInfoDashboardState = {
  tokens: TTokenDashboardItem[];
  transferList: TTransferDashboardData[];
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
    setTokensInfo: (state, action: PayloadAction<TTransferDashboardFilterToken[]>) => {
      state.tokensInfo = action.payload;
    },
    resetInfoDashboardState: () => {
      return InitialInfoDashboardState;
    },
  },
});

export const { setTokens, setTransferList, resetInfoDashboardState, setTokensInfo } =
  InfoDashboardSlice.actions;

export default InfoDashboardSlice;
