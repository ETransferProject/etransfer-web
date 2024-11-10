import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { TOKEN_INFO_USDT, TokenType } from 'constants/index';
import { TNetworkItem, TTokenItem } from 'types/api';

export type TCrossChainTransferState = {
  tokenSymbol: string;
  tokenList: TTokenItem[];

  fromNetwork?: TNetworkItem;
  fromNetworkList?: TNetworkItem[];
  toNetwork?: TNetworkItem;
  toNetworkList?: TNetworkItem[];
  totalNetworkList?: TNetworkItem[];

  recipientAddress?: string;
};

export const InitialCrossChainTransferState: TCrossChainTransferState = {
  tokenSymbol: TokenType.USDT,
  tokenList: [TOKEN_INFO_USDT],
};

export const CrossChainTransferSlice = createSlice({
  name: 'crossChainTransfer',
  initialState: InitialCrossChainTransferState,
  reducers: {
    setTokenSymbol: (state, action: PayloadAction<string>) => {
      state.tokenSymbol = action.payload;
    },
    setTokenList: (state, action: PayloadAction<TTokenItem[]>) => {
      state.tokenList = action.payload;
    },
    setFromNetwork: (state, action: PayloadAction<TNetworkItem | undefined>) => {
      state.fromNetwork = action.payload;
    },
    setFromNetworkList: (state, action: PayloadAction<TNetworkItem[]>) => {
      state.fromNetworkList = action.payload;
    },
    setToNetwork: (state, action: PayloadAction<TNetworkItem | undefined>) => {
      state.toNetwork = action.payload;
    },
    setToNetworkList: (state, action: PayloadAction<TNetworkItem[]>) => {
      state.toNetworkList = action.payload;
    },
    setTotalNetworkList: (state, action: PayloadAction<TNetworkItem[]>) => {
      state.totalNetworkList = action.payload;
    },
    setRecipientAddress: (state, action: PayloadAction<string | undefined>) => {
      state.recipientAddress = action.payload;
    },
    resetCrossChainTransferState: () => {
      return InitialCrossChainTransferState;
    },
  },
});

export const {
  setTokenSymbol,
  setTokenList,
  setFromNetwork,
  setFromNetworkList,
  setToNetwork,
  setToNetworkList,
  setTotalNetworkList,
  setRecipientAddress,
  resetCrossChainTransferState,
} = CrossChainTransferSlice.actions;

export default CrossChainTransferSlice;
