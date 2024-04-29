import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PortkeyVersion } from 'constants/wallet';
import { SideMenuKey } from 'constants/home';

export interface CommonState {
  isMobile: boolean;
  isMobilePX: boolean;
  activeMenuKey: SideMenuKey;
  currentVersion?: PortkeyVersion;
  isShowRedDot?: boolean;
}

export const initialState: CommonState = {
  isMobile: false,
  isMobilePX: false,
  activeMenuKey: SideMenuKey.Deposit,
  currentVersion: PortkeyVersion.v2,
  isShowRedDot: false,
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
    setActiveMenuKey: (state, action: PayloadAction<SideMenuKey>) => {
      state.activeMenuKey = action.payload;
    },
    initCommon: (state) => {
      state.activeMenuKey = initialState.activeMenuKey;
    },
    setSwitchVersionAction: (state, action) => {
      state.currentVersion = action.payload;
    },
    setIsShowRedDot: (state, action) => {
      state.isShowRedDot = action.payload;
    },
  },
});

export const {
  setIsMobile,
  setIsMobilePX,
  setActiveMenuKey,
  initCommon,
  setSwitchVersionAction,
  setIsShowRedDot,
} = CommonSlice.actions;

export default CommonSlice;
