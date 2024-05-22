import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { CHAIN_LIST, IChainNameItem, TOKEN_INFO_USDT, TokenType } from 'constants/index';
import { TNetworkItem, TTokenItem } from 'types/api';

export type TWithdrawState = {
  currentSymbol: string;
  tokenList: TTokenItem[];
  currentChainItem?: IChainNameItem;
  address?: string;
  currentNetwork?: TNetworkItem;
  networkList?: TNetworkItem[];
};

export const InitialWithdrawState: TWithdrawState = {
  currentSymbol: TokenType.USDT,
  tokenList: [TOKEN_INFO_USDT],
  currentChainItem: CHAIN_LIST[0],
};

export const WithdrawSlice = createSlice({
  name: 'withdraw',
  initialState: InitialWithdrawState,
  reducers: {
    setCurrentSymbol: (state, action: PayloadAction<string>) => {
      state.currentSymbol = action.payload;
    },
    setTokenList: (state, action: PayloadAction<TTokenItem[]>) => {
      state.tokenList = JSON.parse(JSON.stringify(action.payload));
    },
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
      return JSON.parse(JSON.stringify(InitialWithdrawState));
    },
  },
});

export const {
  setCurrentSymbol,
  setTokenList,
  setWithdrawChainItem,
  setWithdrawAddress,
  setWithdrawCurrentNetwork,
  setWithdrawNetworkList,
  resetWithdrawState,
} = WithdrawSlice.actions;

export default WithdrawSlice;
