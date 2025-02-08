import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import {
  TOKEN_INFO_USDT,
  TokenType,
  TRANSFER_DEFAULT_FROM_NETWORK,
  TRANSFER_DEFAULT_TO_NETWORK,
} from 'constants/index';
import { WalletTypeEnum } from 'context/Wallet/types';
import { TGetTokenNetworkRelationResult, TNetworkItem, TTokenItem } from 'types/api';

export type TWithdrawNewState = {
  tokenSymbol: string;
  tokenList: TTokenItem[];

  fromNetwork?: TNetworkItem;
  fromNetworkList?: TNetworkItem[];
  toNetwork?: TNetworkItem;
  toNetworkList?: TNetworkItem[];
  totalNetworkList?: TNetworkItem[];

  withdrawAddress?: string;

  tokenChainRelation?: TGetTokenNetworkRelationResult;

  fromWalletType?: WalletTypeEnum;
  toWalletType?: WalletTypeEnum;
};

export const InitialWithdrawNewState: TWithdrawNewState = {
  tokenSymbol: TokenType.USDT,
  tokenList: [TOKEN_INFO_USDT],
  fromNetwork: TRANSFER_DEFAULT_TO_NETWORK,
  toNetwork: TRANSFER_DEFAULT_FROM_NETWORK,
  withdrawAddress: '',
};

export const WithdrawNewSlice = createSlice({
  name: 'withdrawNew',
  initialState: InitialWithdrawNewState,
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
    setTokenChainRelation: (state, action: PayloadAction<TGetTokenNetworkRelationResult>) => {
      state.tokenChainRelation = action.payload;
    },
    setWithdrawAddress: (state, action: PayloadAction<string | undefined>) => {
      state.withdrawAddress = action.payload;
    },
    setFromWalletType: (state, action: PayloadAction<WalletTypeEnum | undefined>) => {
      state.fromWalletType = action.payload;
    },
    setToWalletType: (state, action: PayloadAction<WalletTypeEnum | undefined>) => {
      state.toWalletType = action.payload;
    },
    resetWithdrawNewState: () => {
      return InitialWithdrawNewState;
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
  setTokenChainRelation,
  setWithdrawAddress,
  setFromWalletType,
  setToWalletType,
  resetWithdrawNewState,
} = WithdrawNewSlice.actions;

export default WithdrawNewSlice;
