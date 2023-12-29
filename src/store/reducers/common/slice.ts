import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChainNameItem, CHAIN_LIST } from 'constants/index';
import { SideMenuKey } from 'constants/home';

export interface CommonState {
  isMobile: boolean;
  isMobilePX: boolean;
  activeMenuKey: SideMenuKey;
  currentChainItem: ChainNameItem;
}

export const initialState: CommonState = {
  isMobile: false,
  isMobilePX: false,
  activeMenuKey: SideMenuKey.Deposit,
  currentChainItem: CHAIN_LIST[0],
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
    setCurrentChainItem: (state, action: PayloadAction<ChainNameItem>) => {
      state.currentChainItem = action.payload;
    },
    initCommon: (state) => {
      state.activeMenuKey = initialState.activeMenuKey;
      state.currentChainItem = initialState.currentChainItem;
    },
  },
});

export const { setIsMobile, setIsMobilePX, setActiveMenuKey, setCurrentChainItem, initCommon } =
  CommonSlice.actions;

export default CommonSlice;
