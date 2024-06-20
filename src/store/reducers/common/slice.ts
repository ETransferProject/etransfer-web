import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PortkeyVersion } from 'constants/wallet';
import { SideMenuKey } from 'constants/home';

export interface CommonState {
  isMobile: boolean;
  isMobilePX: boolean;
  isPadPX: boolean;
  activeMenuKey: SideMenuKey;
  currentVersion?: PortkeyVersion;
  isUnreadHistory?: boolean;
}

export const initialState: CommonState = {
  isMobile: false,
  isMobilePX: false,
  isPadPX: false,
  activeMenuKey: SideMenuKey.Deposit,
  currentVersion: PortkeyVersion.v2,
  isUnreadHistory: false,
};

//it automatically uses the immer library to let you write simpler immutable updates with normal mutative code
export const CommonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setIsMobile: (state, action: PayloadAction<boolean>) => {
      state.isMobile = action.payload;
    },
    setIsMobilePX: (state, action: PayloadAction<boolean>) => {
      state.isMobilePX = action.payload;
    },
    setIsPadPX: (state, action: PayloadAction<boolean>) => {
      state.isPadPX = action.payload;
    },
    setActiveMenuKey: (state, action: PayloadAction<SideMenuKey>) => {
      state.activeMenuKey = action.payload;
    },
    setSwitchVersionAction: (state, action: PayloadAction<PortkeyVersion | undefined>) => {
      state.currentVersion = action.payload;
    },
    setIsUnreadHistory: (state, action) => {
      state.isUnreadHistory = action.payload;
    },
    resetCommon: (state) => {
      state.activeMenuKey = SideMenuKey.Deposit;
      state.currentVersion = PortkeyVersion.v2;
    },
  },
});

export const {
  setIsMobile,
  setIsMobilePX,
  setIsPadPX,
  setActiveMenuKey,
  resetCommon,
  setSwitchVersionAction,
  setIsUnreadHistory,
} = CommonSlice.actions;

export default CommonSlice;
