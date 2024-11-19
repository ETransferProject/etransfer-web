import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import {
  TOKEN_INFO_USDT,
  TokenType,
  TRANSFER_DEFAULT_FROM_NETWORK,
  TRANSFER_DEFAULT_TO_NETWORK,
} from 'constants/index';
import { WalletTypeEnum } from 'context/Wallet/types';
import { TNetworkItem, TTokenItem } from 'types/api';

export type TCrossChainTransferState = {
  tokenSymbol: string;
  tokenList: TTokenItem[];
  totalTokenList: TTokenItem[];

  fromNetwork: TNetworkItem;
  fromNetworkList?: TNetworkItem[];
  toNetwork: TNetworkItem;
  toNetworkList?: TNetworkItem[];
  totalNetworkList?: TNetworkItem[];

  recipientAddress?: string;

  fromWalletType?: WalletTypeEnum;
  toWalletType?: WalletTypeEnum;
};

export const InitialCrossChainTransferState: TCrossChainTransferState = {
  tokenSymbol: TokenType.USDT,
  tokenList: [TOKEN_INFO_USDT],
  totalTokenList: [TOKEN_INFO_USDT],
  fromNetwork: TRANSFER_DEFAULT_FROM_NETWORK,
  toNetwork: TRANSFER_DEFAULT_TO_NETWORK,
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
    setTotalTokenList: (state, action: PayloadAction<TTokenItem[]>) => {
      state.totalTokenList = action.payload;
    },
    setFromNetwork: (state, action: PayloadAction<TNetworkItem>) => {
      state.fromNetwork = action.payload;
    },
    setFromNetworkList: (state, action: PayloadAction<TNetworkItem[]>) => {
      state.fromNetworkList = action.payload;
    },
    setToNetwork: (state, action: PayloadAction<TNetworkItem>) => {
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
    setFromWalletType: (state, action: PayloadAction<WalletTypeEnum | undefined>) => {
      state.fromWalletType = action.payload;
    },
    setToWalletType: (state, action: PayloadAction<WalletTypeEnum | undefined>) => {
      state.toWalletType = action.payload;
    },
    resetCrossChainTransferState: () => {
      return InitialCrossChainTransferState;
    },
  },
});

export const {
  setTokenSymbol,
  setTokenList,
  setTotalTokenList,
  setFromNetwork,
  setFromNetworkList,
  setToNetwork,
  setToNetworkList,
  setTotalNetworkList,
  setRecipientAddress,
  setFromWalletType,
  setToWalletType,
  resetCrossChainTransferState,
} = CrossChainTransferSlice.actions;

export default CrossChainTransferSlice;
