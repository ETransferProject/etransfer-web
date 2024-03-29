import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IChainNameItem, CHAIN_LIST } from 'constants/index';
import { PortkeyVersion } from 'constants/wallet';
import { SideMenuKey } from 'constants/home';

export interface CommonState {
  isMobile: boolean;
  isMobilePX: boolean;
  activeMenuKey: SideMenuKey;
  currentChainItem: IChainNameItem;
  currentVersion?: PortkeyVersion;
}

export const initialState: CommonState = {
  isMobile: false,
  isMobilePX: false,
  activeMenuKey: SideMenuKey.Deposit,
  currentChainItem: CHAIN_LIST[0],
  currentVersion: undefined,
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
    setCurrentChainItem: (state, action: PayloadAction<IChainNameItem>) => {
      state.currentChainItem = action.payload;
    },
    initCommon: (state) => {
      state.activeMenuKey = initialState.activeMenuKey;
      state.currentChainItem = initialState.currentChainItem;
    },
    setSwitchVersionAction: (state, action) => {
      state.currentVersion = action.payload;
    },
  },
});

export const {
  setIsMobile,
  setIsMobilePX,
  setActiveMenuKey,
  setCurrentChainItem,
  initCommon,
  setSwitchVersionAction,
} = CommonSlice.actions;

export default CommonSlice;
