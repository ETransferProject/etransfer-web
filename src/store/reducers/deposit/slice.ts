import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { CHAIN_LIST, IChainNameItem } from 'constants/index';
import { TNetworkItem, TDepositTokenItem } from 'types/api';

export type TDepositState = {
  // from
  fromTokenSymbol: string;
  fromTokenList?: TDepositTokenItem[];
  fromNetwork?: TNetworkItem;
  fromNetworkList?: TNetworkItem[];

  // to
  toTokenSymbol: string;
  toTokenList?: TDepositTokenItem[];
  toChainItem: IChainNameItem;
  toChainList?: IChainNameItem[];

  // info
  address?: string;

  // other
  initOpenNetworkModalCount: number; // cant persist
  initOpenTokenModalCount: number;
};

export const InitialDepositState: TDepositState = {
  fromTokenSymbol: 'USDT',
  // fromTokenList: [],
  // fromNetworkList: [],
  toTokenSymbol: 'USDT',
  toChainItem: CHAIN_LIST[1] || CHAIN_LIST[0],
  // toTokenList: [],
  // toChainList: [],
  initOpenNetworkModalCount: 0,
  initOpenTokenModalCount: 0,
};

export const DepositSlice = createSlice({
  name: 'deposit',
  initialState: InitialDepositState,
  reducers: {
    // from
    setFromTokenSymbol: (state, action: PayloadAction<string>) => {
      state.fromTokenSymbol = action.payload;
    },
    setFromTokenList: (state, action: PayloadAction<TDepositTokenItem[]>) => {
      state.fromTokenList = action.payload;
    },
    setFromNetwork: (state, action: PayloadAction<TNetworkItem | undefined>) => {
      state.fromNetwork = action.payload;
    },
    setFromNetworkList: (state, action: PayloadAction<TNetworkItem[]>) => {
      state.fromNetworkList = action.payload;
    },
    // to
    setToTokenSymbol: (state, action: PayloadAction<string>) => {
      state.toTokenSymbol = action.payload;
    },
    setToTokenList: (state, action: PayloadAction<TDepositTokenItem[]>) => {
      state.toTokenList = action.payload;
    },
    setToChainItem: (state, action: PayloadAction<IChainNameItem>) => {
      state.toChainItem = action.payload;
    },
    setToChainList: (state, action: PayloadAction<IChainNameItem[]>) => {
      state.toChainList = action.payload;
    },
    // info
    setDepositAddress: (state, action: PayloadAction<string | undefined>) => {
      state.address = action.payload;
    },
    // other
    setAddInitOpenNetworkModalCount: (state) => {
      state.initOpenNetworkModalCount = state.initOpenNetworkModalCount++;
    },
    setAddInitOpenTokenModalCount: (state) => {
      state.initOpenTokenModalCount = state.initOpenTokenModalCount++;
    },
    resetDepositState: () => {
      return InitialDepositState;
    },
  },
});

export const {
  setFromTokenSymbol,
  setFromTokenList,
  setFromNetwork,
  setFromNetworkList,
  setToTokenSymbol,
  setToTokenList,
  setToChainItem,
  setToChainList,
  setDepositAddress,
  setAddInitOpenNetworkModalCount,
  setAddInitOpenTokenModalCount,
  resetDepositState,
} = DepositSlice.actions;

export default DepositSlice;
