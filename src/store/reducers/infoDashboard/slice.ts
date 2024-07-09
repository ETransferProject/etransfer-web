import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TTokenDashboardItem } from 'types/infoDashboard';

export type TInfoDashboardState = {
  tokens: TTokenDashboardItem[];
  transferList: any[];
};

export const InitialInfoDashboardState: TInfoDashboardState = {
  tokens: [],
  transferList: [],
};

export const InfoDashboardSlice = createSlice({
  name: 'infoDashboard',
  initialState: InitialInfoDashboardState,
  reducers: {
    setTokens: (state, action: PayloadAction<TTokenDashboardItem[]>) => {
      state.tokens = action.payload;
    },
    setTransferList: (state, action: PayloadAction<any>) => {
      state.transferList = action.payload;
    },
    resetInfoDashboardState: () => {
      return InitialInfoDashboardState;
    },
  },
});

export const { setTokens, setTransferList, resetInfoDashboardState } = InfoDashboardSlice.actions;

export default InfoDashboardSlice;
